const express = require("express");
const router = express.Router();
const authController = require("../controller/userController");
const userController = require("../controller/user")
const passport = require("passport");

// Rendering routes
router.get("/signup", authController.signup);
router.get("/signin", authController.signin);
router.get("/reset", authController.reset);
router.get("/otp", authController.otp);
router.get("/forget", authController.forget);

// Functional routes
router.post("/register", userController.Register);
router.post("/login", userController.login);
router.post("/forget-password", userController.CheckMailforForget);
router.post("/verify-otp", userController.ConfirmOtp);
router.post("/reset-password", userController.CreateNewPassword);
router.get("/account", userController.UserAccount)

// Google authentication routes
// router.get('/auth/google', authController.googleAuth);
// router.get('/auth/google/callback', authController.googleAuthCallback, authController.googleAuthSuccess);

// Facebook authentication routes
// router.get('/auth/facebook', authController.facebookAuth);
// router.get('/auth/facebook/callback', authController.facebookAuthCallback, authController.facebookAuthSuccess);

module.exports = router;
