const express = require("express");
const viewsController = require("../controller/view");
const authController = require("../controller/auth");
const bookingController = require("../controller/booking");

const router = express.Router();

router.get("/", authController.isLoggedIn, viewsController.getOverview);
//authController.isLoggedIn,
router.get("/tour/:slug", viewsController.getInformation);
router.get("/login", authController.isLoggedIn, viewsController.getLoginForm);
router.get("/me", authController.protect, viewsController.getAccount);

router.get(
  "/my-information",
  bookingController.createBookingCheckout,
  authController.protect,
  viewsController.getMyInformation
);

router.post(
  "/submit-user-data",
  authController.protect,
  viewsController.updateUserData
);

module.exports = router;
