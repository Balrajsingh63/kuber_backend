/** @format */

var express = require("express");
var router = express.Router();
const UserRouter = require("../../controllers/superAdmin/userController");

router.get("/", UserRouter.index);
router.get("/:id", UserRouter.show);
router.post("/", UserRouter.adminRegister);
router.put("/:id", UserRouter.adminUpdate);
router.get("/block/:id", UserRouter.adminBlock);
router.delete("/:id", UserRouter.adminDelete);
router.get("/game-list/:adminId", UserRouter.adminGameList);
router.get("/game-request-list/:adminId", UserRouter.adminGameRequest);
router.get("/withdrawal-request/:adminId", UserRouter.adminWithdrawalRequest);
module.exports = router;
