const express = require("express");
const userController = require("../controller/user");
const authController = require("../controller/auth");
const reviewController = require("../controller/review");

const router = express.Router();
router.get(
  "/me",
  authController.protect,
  userController.getMe,
  userController.getUser
);
router.post("/signup", authController.signup);
router.post("/login", authController.login);

router.post("/forgotPassword", authController.forgotPassword);
router.post("/twoFactorAuthentication", authController.twoFactorAuthentication);
router.patch("/resetPassword/:token", authController.resetPassword);
router.get("/confirm/:token", authController.confirm);
//potect all routes after this moddleware
router.use(authController.protect); //first this line

router.patch("/updatePassword", authController.updatePassword);
router.patch(
  "/updateMe",
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  userController.updateMe
);
router.delete("/deleteMe", userController.deleteMe);

router.use(authController.restrictTo("admin"));

router
  .route("/")
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route("/:id")
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
