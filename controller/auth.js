const crypto = require("crypto");
const { promisify } = require("util");
const User = require("./../models/user");
const catchAsync = require("../src/catchAsync");
const jwt = require("jsonwebtoken");
const config = require("../config");
const AppError = require("../src/appError");
const Email = require("../src/email");
const sendEmail = require("../src/email2");
//----------------------------------------
const signToken = (id) => {
  return jwt.sign({ id }, config.secret, {
    expiresIn: 90 * 24 * 60 * 60 * 1000,
  });
};

//----------------------------------------
//first : name of cookie and second is data that we want to send in to the cookie

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: true,
  };

  res.cookie("jwt", token, cookieOptions);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    data: {
      user,
    },
  });
};
const createSendtrullyToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: true,
  };

  res.cookie("jwt", token, cookieOptions);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);

  const url = `${req.portocol}://${req.get("host")}/me`;
  console.log(url);
  await new Email(newUser, url).sendWelcome();

  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  //1) check exist
  if (!email || !password) {
    return res.status(400).json({
      status: "fail",
      message: "plz enter email or password",
    });
  }
  //2) check correct
  const user = await User.findOne({ email: req.body.email }).select(
    "+password"
  );
  console.log(user);

  if (!user || !(await user.correctPassword(password, user.password))) {
    return res.status(401).json({
      status: "fail",
      message: "Incorrect email or password",
    });
  }

  //3) send tokens
  createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  //1)getting token and checking if it is exist

  //2)verification token
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        status: "fail",
        message: "u are not loged in ",
      });
    }
    const decoded = await promisify(jwt.verify)(token, config.secret);
    //3)check if user still exist

    const freshUser = await User.findById(decoded.id);
    if (!freshUser) {
      return res.status(401).json({
        status: "fail",
        message: "the user belonging to this user does not exist",
      });
    }

    //4)check if user changed password after the token was issued
    if (freshUser.changedPasswordAfter(decoded.iat)) {
      return res.status(401).json({
        status: "fail",
        message: "plz log in again",
      });
    }

    req.user = freshUser;
  } catch (err) {
    res.status(401).json({
      status: "fail",
      message: err.message,
    });
  }

  next();
});

// Only for rendered pages, no errors!
exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      // 1) verify token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      // 2) Check if user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      // 3) Check if user changed password after the token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      // THERE IS A LOGGED IN USER
      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};


exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles [ 'admin' , 'lead-guide' ] role = 'user'
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "u dont have permissin to perform this action",
      });
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //1) get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res.status(404).json({
      status: "fail",
      message: "there is no user with email",
    });
  }
  //2) raandom token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  //3) send token to email

  // const message = `forgot your password? submit a patch request with your new password and passwordConfrm to ${resetURL}. \nif u didnt forgrt your password plz ignor this email`;
  try {
    const resetURL = `${req.portocol}://${req.get(
      "host"
    )}/user/resetPassword/${resetToken}`;
    // await sendEmail({
    //   email: user.email,
    //   subject: " your password reset token (for 10 min)",
    //   message: message,});
    await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({
      status: "success",
      message: "token send to email",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return res.status(500).json({
      status: "fail",
      message: "there was an error sending the email , try again later",
    });
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  //get user based on the token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  //if token has not expired and yhere is user , set new password and

  if (!user) {
    return res.status(400).json({
      message: "token is invalid or has expired.",
    });
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  //update changedPasswordAt prperty for user and

  //log the user in sed jsonwebtoken
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user from collection
  const user = await User.findById(req.user.id).select("+password");

  // 2) Check if POSTed current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return res.status(401).json({
      status: "fail",
      message: "Your current password is wrong.",
    });
  }

  // 3) If so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  // User.findByIdAndUpdate will NOT work as intended!

  // 4) Log user in, send JWT
  createSendToken(user, 200, res);
});

exports.twoFactorAuthentication = catchAsync(async (req, res, next) => {
  //1) get user based on POSTed email
  const user = await User.findOne({
    email: req.body.email,
    //password: req.body.password,
  });
  if (!user) {
    return res.status(404).json({
      status: "fail",
      message: "there is no user with email and passsword",
    });
  }
  //2) raandom token
  const resetToken = user.secondCreatePasswordResetToken();
  await user.save({ validateBeforeSave: false });
  //3) send token to email

  const resetURL = `${req.portocol}://${req.get(
    "host"
  )}/user/resetPassword/${resetToken}`;

  const message = `this second step of log in plz sava the token : ${resetURL}`;
  try {
    await sendEmail({
      email: user.email,
      subject: " your password reset token (for 10 min)",
      message: message,
    });
    res.status(200).json({
      status: "success",
      message: "token send to email",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return res.status(500).json({
      status: "fail",
      message: "there was an error sending the email , try again later",
    });
  }
});

exports.confirm = catchAsync(async (req, res, next) => {
  //get user based on the token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  //if token has not expired and yhere is user , set new password and

  if (!user) {
    return res.status(400).json({
      message: "token is invalid or has expired.",
    });
  }

  //update changedPasswordAt prperty for user and

  //log the user in sed jsonwebtoken
  createSendtrullyToken(user, 200, res);
});
