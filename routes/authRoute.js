var express = require('express');
var router = express.Router();
const AuthRouter = require("../controllers/authController");

router.post("/login", AuthRouter.login);
router.post("/user-register", AuthRouter.userRegister);

module.exports = router;