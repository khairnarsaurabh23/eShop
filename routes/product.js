const express = require('express');
const router = express.Router();

//importing controllers for product routes
const {test} = require('../controllers/product');


//importing middlewares for product routes
const {userMiddleware, userRole} = require('../middlewares/user');

router.route('/test').get(userMiddleware, test);



module.exports = router;
