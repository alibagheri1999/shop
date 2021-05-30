const express = require("express");
const app = express();
const appInformation = require("./package/informations.js");
const bodyParser = require("body-parser");
const compression = require("compression");
const MongoClient = require("mongodb").MongoClient;
const cors = require("cors");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const fs = require("fs");
const url = require("url");
const productRoutes = require("./package/carts");
const cartRoutes = require("./package/shopingcarts");
const AppError = require(".//src/appError");
const UserRoutes = require("./package/user");
const reviewRoutes = require("./package/review");
const bookingRoutes = require("./package/booking");
const viewRouter = require("./package/view");
//-----------------------------------------------
//const { ROLE, users } = require("./data");
//const { authUser, authRole } = require("./basicAuth");
const Product = require("./models/carts.js");

//set security http headers
app.use(helmet());

//-----------------------------------------------
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "too many request from this IP , plz try again in an hour",
});
//-----------------------------------------------
//limit request
app.use("/", limiter);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({ limit: "10kb" }));
//----------------------------------------

//data sanitization against NoSQL query injection
app.use(mongoSanitize());
//data sanitization against xss
app.use(xss());
//prevent parameter pollution
app.use(
  hpp({
    whitelist: ["name", "price", "difficulty"],
  })
);

app.use(compression());

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  //console.log(req.headers);
  next();
});
//*****************************************************
// function setUser(req, res, next) {
//   const userId = req.body.userId;
//   if (userId) {
//     req.user = users.find(user => user.id === userId);
//   }
//   next();
// }

// function setProject (req,res,next){
//   const projectId = req.body.projectId;
//   req.project = projects.find(project => project.id === projectId);
// }
//*****************************************************

//----------------------------------------
//app.use("/files", express.static("files"));
//----------------------------------------

const port = process.env.PORT || 3000;
app.use(cors());

app.use(morgan("dev"));

app.use("/information", appInformation);
app.use("/user", UserRoutes);
require("./src/config/mongoose")(app);
app.use("/product", productRoutes);
app.use("/cart", cartRoutes);
app.use("/review", reviewRoutes);
app.use("/booking", bookingRoutes);

app.use("/", viewRouter);

app.use((req, res, next) => {
  const error = new Error("not found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, nest) => {
  res.status(error.status || 500).json({
    status: error.status,
    message: error.message,
    stack: error.stack,
  });
});
//-------------------------------------
const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }
};
const handleValidationErrorDB = (err) => {
  const error = Object.values(err.errors).map((el) => el.message);
  const message = `invalid input data . ${errors.join(". ")}`;
  return new AppError(message, 400);
};
//------------------------------------------
app.use((error, req, res, nest) => {
  if (error.name === "ValidationError") {
    error = handleValidationErrorDB(error);
    sendErrorProd(error, res);
  }
});

app.listen(port, () => {
  console.log(`server started on ${port}`);
});
