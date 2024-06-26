const express = require("express");
const router = express.Router();
const { AuthorizeUser, FindUser, decodeUser } = require("../middleware/auth");
const home = require("../controller/home");

router.get("/", AuthorizeUser("user"), home.userHome);
router.get("/admin", AuthorizeUser("admin"), home.adminHome);
router.get("/auth/user", home.userController);
router.get("/auth/admin", home.adminController);

module.exports = router;
