var express = require('express');
var router = express.Router();
const AuthRouter = require("./adminAuthRoute");
const usersRouter = require("./users");
const gameRouter = require("./game");




router.use("/", AuthRouter);
router.use("/user", usersRouter)
router.use("/game", gameRouter);

/* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Express' });
// });



module.exports = router;
