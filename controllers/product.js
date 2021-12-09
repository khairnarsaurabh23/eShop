const bigPromise = require('../middlewares/bigPromise');

exports.test = bigPromise(async (req, res, next) => {
    res.status(200).json({
        success: true,
        message: 'setup is working properly',
    });
});
