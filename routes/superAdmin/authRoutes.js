/** @format */

var express = require("express");
var router = express.Router();
const AuthRouter = require("../../controllers/superAdmin/authController");

router.post("/login", AuthRouter.login);
router.post("/block", AuthRouter.blockAdmin);

module.exports = router;
