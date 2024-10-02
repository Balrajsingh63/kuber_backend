/** @format */

var express = require("express");
var router = express.Router();
const UserRouter = require("../../controllers/superAdmin/userController");

router.get("/", UserRouter.index);
router.get("/:id", UserRouter.show);
router.post("/", UserRouter.adminRegister);

module.exports = router;
