const express = require("express")

const router = express.Router();

const home = require("../controller/home");

router.get("/", home.userHome);
router.get("/admin", home.adminHome);
router.get("/auth/user", home.userController);
router.get("/auth/admin", home.adminController);