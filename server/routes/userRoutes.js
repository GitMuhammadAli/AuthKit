const express = require("express");
const router = express.Router();
const userController = require("../controller/userController");

router.get("/signup", userController.signup);

router.get("/signin", userController.signin);

router.get("/reset", userController.reset);

router.get("/otp", userController.otp);

router.get("/forget", userController.forget);

module.exports = router;
