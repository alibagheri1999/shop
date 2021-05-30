const Information = require("../models/information");
const User = require("../models/user");
const Booking = require("../models/booking");
const catchAsync = require("../src/catchAsync");

exports.getOverview = catchAsync(async (req, res, next) => {
  // 1) Get tour data from collection
  const information = await Information.find();

  // 2) Build template
  // 3) Render that template using tour data from 1)
  res.status(200).render("overview", {
    title: "All Infroemation",
    information,
  });
});

exports.getInformation = catchAsync(async (req, res, next) => {
  // 1) Get the data, for the requested tour (including reviews and guides)
  const information = await Information.findOne({
    slug: req.params.slug,
  }).populate({
    path: "review",
    fields: "review rating user",
  });

  if (!information) {
    return new Error("There is no information with that name.");
  }

  // 2) Build template
  // 3) Render template using data from 1)
  res.status(200).render("information", {
    title: `${information.name} information`,
    information,
  });
});

exports.getLoginForm = (req, res) => {
  res.status(200).render("login", {
    title: "Log into your account",
  });
};

exports.getAccount = (req, res) => {
  res.status(200).render("account", {
    title: "Your account",
  });
};

exports.getMyInformation = catchAsync(async (req, res, next) => {
  // 1) Find all bookings
  const bookings = await Booking.find({ user: req.user.id });

  // 2) Find tours with the returned IDs
  const informationIDs = bookings.map((el) => el.tour);
  const information = await Information.find({ _id: { $in: informationIDs } });

  res.status(200).render("overview", {
    title: "My informations",
    information,
  });
});

exports.updateUserData = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).render("account", {
    title: "Your account",
    user: updatedUser,
  });
});
