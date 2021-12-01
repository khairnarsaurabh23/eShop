const User = require('../models/user');
const bigPromise = require('./bigPromise');
const customError = require('../utils/cError');
const jwt = require('jsonwebtoken');

exports.isLoggedIn = bigPromise(async (req, res, next) => {
    const token = req.cookies.token || req.header("Authorization").replace('Bearer ', '');

    if (!token) {
        return next(new customError('Your login session expired, login agin', 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    //injecting our own info to req
    req.user = await User.findeById(decoded.id);

    next();
});
