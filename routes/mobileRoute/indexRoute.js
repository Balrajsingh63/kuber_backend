const express = require('express');
const router = express.Router();
const payment = require('../mobileRoute/paymentRoute');
const gameRoutes = require('../mobileRoute/gameRoute');
const usersRoutes = require("../mobileRoute/usersRoute");
const authRoutes = require("../authRoute");

router.use("/", authRoutes)
router.use("/users", usersRoutes);
router.use("/game", gameRoutes)
router.use('/payment', payment);

module.exports = router;