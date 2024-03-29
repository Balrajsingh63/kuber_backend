var express = require('express');
var router = express.Router();
const AuthRouter = require("./adminAuthRoute");
const usersRouter = require("./users");
const gameRouter = require("./game");
const paymentRouter = require("./paymentRoute");
const settingRouter = require("./settingRoute");



router.use("/", AuthRouter);
router.use("/user", usersRouter)
router.use("/game", gameRouter);
router.use("/payment", paymentRouter);
router.use("/setting", settingRouter);

/* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Express' });
// });



module.exports = router;
