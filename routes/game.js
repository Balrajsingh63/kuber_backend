var express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const { getToken } = require('../middleware/authenticationMiddleware');
const { isAdmin } = require('../middleware/isAdminMiddleware');

router.get("/index", getToken, isAdmin, gameController.index);
router.get("/request", getToken, isAdmin, gameController.gameRequestList);
router.post("/store", getToken, isAdmin, gameController.gameCreate);
router.post("/result", getToken, isAdmin, gameController.gameResult);
router.delete("/delete/:id", getToken, isAdmin, gameController.deleteGame);
router.put("/update/:id", getToken, isAdmin, gameController.updateGame);
router.get("/filter-game", getToken, isAdmin, gameController.filterGame);
router.get("/today-records", getToken, isAdmin, gameController.todayrecords);
router.post("/update-wallet", getToken, isAdmin, gameController.updateResultWallet);
module.exports = router;
