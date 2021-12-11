const express = require('express');
const router = express.Router();

const {createOrder,
    getOneOrder,
    getLoggedInOrders} = require('../controllers/order');

//middleware to restrict the route only to the logged in users
const {userMiddleware} = require('../middlewares/user');

router.route('/order').post(userMiddleware, createOrder);
router.route('/user/order').post(userMiddleware, getOneOrder);
router.route('/order/:id').post(userMiddleware, getLoggedInOrders);



module.exports = router;
