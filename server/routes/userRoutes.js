const express = require("express");
const router = express.Router();
const authController = require("../controller/userRendering");
const userController = require("../controller/userController");
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
router.get("/account", userController.UserAccount);
router.get("/logout", userController.logout);

// // Google authentication routes
// router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
// router.get('/auth/google/callback',
//     passport.authenticate('google', { failureRedirect: '/signin' }),
//     (req, res) => {
//         res.redirect('/');
//     });

// // Facebook authentication routes
// router.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email'] }));
// router.get('/auth/facebook/callback',
//     passport.authenticate('facebook', { failureRedirect: '/signin' }),
//     (req, res) => {
//         res.redirect('/');
//     });

module.exports = router;
