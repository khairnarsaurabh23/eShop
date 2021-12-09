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


// //middleware for restricting routes to logged in user
// const userMiddleware = app.use(async function(req, res, next){
//   // check token first in cookies
//   let token = req.cookies.token;
//
//   // if token not found in cookies, check if header contains Auth field
//   if (!token && req.header("Authorization")) {
//     token = req.header("Authorization").replace("Bearer ", "");
//   }
//
//   if (!token) {
//     return next(new customError("Login first to access this page", 401));
//   }
//
//   const decoded = jwt.verify(token, process.env.JWT_SECRET);
//
//   req.user = await User.findById(decoded.id);
//
//   next();
// });
// //middleware for checking the role of user
// const userRole = (...role) => {
//     //by spreading role array parameter sent by route will
//     //auto added to the role array
//     return (req, res, next) => {
//         //check if user had specific role
//         //typo in user model :roll
//         if (!role.includes(req.user.roll)) {
//             return next(new customError('You are not permited to perform this activity', 403));
//         }
//         next();
//     };
// };

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
