/** @format */

var express = require("express");
var router = express.Router();
const GameController = require("../../controllers/superAdmin/gameController");

router.get("/", GameController.index);
router.post("/", GameController.gameCreate);
router.get("/:id", GameController.showGame);
router.put("/:id", GameController.updateGame);
router.delete("/delete/:id", GameController.deleteGame);
router.get("/request-list", GameController.gameRequestList);
module.exports = router;
