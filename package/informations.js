const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
// const { ROLE, users } = require("../data");
// const { authUser, authRole } = require("../basicAuth");
const authController = require("../controller/auth");
//const reviewController = require("../controller/review");
const reviewRouter = require("../package/review");
const Information = require("../models/information");
const Informationcontroller = require("../controller/Information");
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
const fs = require("fs");
const url = require("url");

//*****************************************************
// function setUser(req, res, next) {
//   const userId = req.body.userId;
//   if (userId) {
//     req.user = users.find((user) => user.id === userId);
//   }
//   next();
// }
//*****************************************************
// router
//   .route("/:informationId/review")
//   .post(
//     authController.protect,
//     authController.restrictTo("user"),
//     reviewController.createReview
//   );
//******************************************************

router.use("/:informationId/review", reviewRouter);

router.param("id", Informationcontroller.param);

router.get("/", authController.protect, Informationcontroller.GetAll);

router.get(
  "/top-5-numbers",
  Informationcontroller.aliasTopnumber,
  Informationcontroller.GetAll
);

router.get("/somedata", Informationcontroller.getdata);

router.get("/stats", Informationcontroller.getstats);

router.get(
  "/plan/:year",
  authController.protect,
  authController.restrictTo("admin", "lead-guide", "guide"),
  Informationcontroller.getMounthlyplan
);

router
  .route("/information-within/:distance/center/:latlng/unit/:unit")
  .get(Informationcontroller.getInformationWithin);

router
  .route("/distance/:latlng/unit/:unit")
  .get(Informationcontroller.getDistances);

router.post(
  "/",
  authController.protect,
  authController.restrictTo("admin", "lead-guide"),
  Informationcontroller.PostAll
);

router.get(
  "/:id",
  authController.protect,
  authController.restrictTo("admin", "lead-guide"),
  Informationcontroller.GetOne
);

router.patch(
  "/:id",
  authController.protect,
  authController.restrictTo("admin", "lead-guide"),
  Informationcontroller.uploadInformationPhoto,
  Informationcontroller.resizeInformationImages,
  Informationcontroller.UpdateOne
);

router.delete(
  "/:id",
  authController.protect,
  authController.restrictTo("admin", "lead-guide"),
  Informationcontroller.DeleteOne
);

router.delete("/empty", Informationcontroller.deleteall);

module.exports = router;
