/** @format */

var express = require("express");
var router = express.Router();
const AuthRouter = require("../controllers/adminAuthController");

router.post("/login", AuthRouter.login);
router.post("/admin-register", AuthRouter.AdminRegister);

module.exports = router;
