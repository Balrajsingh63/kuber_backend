var express = require("express");
var router = express.Router();
const AuthRouter = require("../controllers/authController");

router.post("/auth/login", AuthRouter.login);
router.post("/auth/user-register", AuthRouter.userRegister);
router.post("/auth/forget-password", AuthRouter.forgetPassword);
router.post("/auth/change-password", AuthRouter.changePassword);

module.exports = router;
