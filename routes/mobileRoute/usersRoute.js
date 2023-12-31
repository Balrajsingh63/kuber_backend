const express = require("express");
const router = express.Router();
const UserController = require("../../controllers/mobile/userController");
const { getToken } = require("../../middleware/authenticationMiddleware");

router.get('/index', getToken, UserController.index);
// router.post('/game-request', getToken, gameController.gamePlay);
module.exports = router;