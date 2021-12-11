const express = require('express');
const router = express.Router();

//importing controllers for product routes
const {test,
    addProduct,
    getAllProduct,
    adminUpdateProduct,
    adminDeleteProduct,
    addReview,
    deleteReview} = require('../controllers/product');


//importing middlewares for product routes
const {userMiddleware, userRole} = require('../middlewares/user');

//testing route
router.route('/test').get(userMiddleware, test);

//product route
router.route('/products').get(getAllProduct);

//review route
router.route("/review").post(userMiddleware, addReview);
router.route("/review").delete(userMiddleware, deleteReview);

//admin route
router.route('/admin/addproduct').post(userMiddleware, userRole("admin"), addProduct);
router.route('/admin/update/:id')
    .put(userMiddleware, userRole("admin"), adminUpdateProduct)
    .delete(userMiddleware, userRole("admin"), adminDeleteProduct);



module.exports = router;
