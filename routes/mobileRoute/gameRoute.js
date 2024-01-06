const express = require("express");
const router = express.Router();
const gameController = require("../../controllers/mobile/gameController");
const { getToken } = require("../../middleware/authenticationMiddleware");

router.get('/game-request-list', getToken, gameController.gameRequest);
router.post('/game-request', getToken, gameController.gamePlay);
router.get('/game-list', getToken, gameController.gameList);

module.exports = router;