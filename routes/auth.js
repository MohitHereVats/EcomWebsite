
const express = require('express');

const authController = require('../controllers/auth');
const Routes = require('../util/Routes');
const { userValidationRules, validSignUpRequest, checkEmailExists } = require('../middleware/validSignUpRequest');
const { validLoginRequest, userLoginRules, checkUserExists } = require('../middleware/validLoginRequest');

const router = express.Router();

router.get(Routes.LOGIN, authController.getLogin);

router.post(Routes.LOGIN, userLoginRules, [validLoginRequest, checkUserExists], authController.postLogin);

router.post(Routes.LOGOUT, authController.postLogout);

router.get(Routes.SIGNUP, authController.getSignup);

router.post(Routes.SIGNUP,  userValidationRules, [validSignUpRequest, checkEmailExists], authController.postSignup);

router.get(Routes.RESET, authController.getReset);

router.post(Routes.RESET, authController.postReset);

router.get(Routes.RESETPASSWORD, authController.getNewPassword);

router.post(Routes.NEWPASSWORD, authController.postNewPassword);

module.exports = router;
