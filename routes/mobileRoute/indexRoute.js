const express = require('express');
const router = express.Router();
const payment = require('../mobileRoute/paymentRoute');
const gameRoutes = require('../mobileRoute/gameRoute');
const usersRoutes = require("../mobileRoute/usersRoute");
const authRoutes = require("../authRoute");
const settingRouter = require("./settingRoute");

router.use("/", authRoutes)
router.use("/users", usersRoutes);
router.use("/game", gameRoutes)
router.use('/payment', payment);
router.use("/setting", settingRouter);
module.exports = router;