var express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const { getToken } = require('../middleware/authenticationMiddleware');
const { isAdmin } = require('../middleware/isAdminMiddleware');

router.get("/index", getToken, isAdmin, gameController.index);
router.get("/request", getToken, isAdmin, gameController.gameRequestList);
router.post("/store", getToken, isAdmin, gameController.gameCreate);
module.exports = router;