var express = require('express');
const userController = require('../controllers/userController');
const { checkSchema } = require('express-validator');
const userValidateSchema = require('../uility/validation');
const { isAdmin } = require('../middleware/isAdminMiddleware');
const { getToken } = require('../middleware/authenticationMiddleware');
var router = express.Router();

/* GET users listing. */
// router.post('/register', checkSchema(userValidateSchema), userController.userRegister);
router.get('/index', getToken, isAdmin, userController.index);
router.put('/update/:id', getToken, isAdmin, userController.userUpdate);
router.delete('/delete/:id', getToken, isAdmin, userController.userDelete);
module.exports = router;
