/** @format */

var express = require("express");
var router = express.Router();
const AuthRouter = require("../superAdmin/authRoutes");
const UserRouter = require("../superAdmin/userRoutes");
const GameRouter = require("../superAdmin/gameRoutes");
const PaymentRouter = require("../superAdmin/paymentRoutes");
router.use("/auth", AuthRouter);
router.use("/users", UserRouter);
router.use("/games", GameRouter);
router.use("/payment", PaymentRouter);

module.exports = router;
