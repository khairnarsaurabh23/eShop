const User = require('../models/user');
const bigPromise = require('./bigPromise');
const customError = require('../utils/cError');
const jwt = require('jsonwebtoken');

//require express
const express = require('express');
const app = express();

//middleware for restricting routes to logged in user
exports.userMiddleware = app.use(async function(req, res, next){
  // check token first in cookies
  let token = req.cookies.token;

  // if token not found in cookies, check if header contains Auth field
  if (!token && req.header("Authorization")) {
    token = req.header("Authorization").replace("Bearer ", "");
  }

  if (!token) {
    return next(new customError("Login first to access this page", 401));
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  req.user = await User.findById(decoded.id);

  next();
});
//middleware for checking the role of user
exports.userRole = (...role) => {
    //by spreading role array parameter sent by route will
    //auto added to the role array
    return (req, res, next) => {
        //check if user had specific role
        //typo in user model :roll
        if (!role.includes(req.user.roll)) {
            return next(new customError('You are not permited to perform this activity', 403));
        }
        next();
    };
};

// exports.isLoggedIn = bigPromise(async (req, res, next) => {
//     const token = req.cookies.token;
//
//     if (!token) {
//         return next(new customError('Your login session expired, login agin', 401));
//     }
//
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//
//     //injecting our own info to req
//     req.user = await User.findeById(decoded.id);
//
//     next();
// });
