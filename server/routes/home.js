const express = require("express");
const router = express.Router();
const { AuthorizeUser, FindUser, decodeUser } = require("../middleware/auth");
const home = require("../controller/home");

router.get("/", decodeUser, AuthorizeUser("user"), home.userHome);
router.get("/admin", decodeUser, AuthorizeUser("admin"), home.adminHome);
router.get("/auth/user", home.userController);
router.get("/auth/admin", home.adminController);

module.exports = router;
