const express = require('express');
const router = express.Router();
const app = express();

//for middlewares
const User = require('../models/user');
const bigPromise = require('../middlewares/bigPromise');
const customError = require('../utils/cError');
const jwt = require('jsonwebtoken');

const {signup,
    login,
    logout,
    forgotPassword,
    passwordReset,
    getLoggedInUserDetails,
    changePassword,
    updateUserDetails,
    admin,
    getUser,
    updateUser,
    deleteUser,
    manager} = require('../controllers/userController');

//importing middlewares
const {userMiddleware, userRole} = require('../middlewares/user');

router.route('/signup').post(signup);
router.route('/login').get(login);
router.route('/logout').get(logout);
router.route('/forgotpassword').post(forgotPassword);
router.route('/password/reset/:token').post(passwordReset);
//routes that require Login
router.route('/dashboard').get(userMiddleware, getLoggedInUserDetails);
router.route('/user/changePassword').post(userMiddleware, changePassword);
router.route('/user/update').post(userMiddleware, updateUserDetails);
//admin specific routes
router.route('/admin/users').get(userMiddleware,userRole("admin"), admin);
router.route('/admin/user/:id')
    .get(userMiddleware, userRole("admin"), getUser)
    .put(userMiddleware, userRole("admin"), updateUser)
    .delete(userMiddleware, userRole("admin"), deleteUser);
//manager specific routes
router.route("/manager/users").get(userMiddleware, userRole("manager"), manager);


module.exports = router;
