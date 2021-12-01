const express = require('express');
const router = express.Router();

const {signup,
    login,
    logout,
    forgotPassword,
    passwordReset,
    getUserLoggedInDetails} = require('../controllers/userController');
const isLoggedIn = require('../middlewares/user');

router.route('/signup').post(signup);
router.route('/login').get(login);
router.route('/logout').get(logout);
router.route('/forgotpassword').post(forgotPassword);
router.route('/password/reset/:token').post(passwordReset);
router.route('/dashboard').get(getUserLoggedInDetails);

module.exports = router;
