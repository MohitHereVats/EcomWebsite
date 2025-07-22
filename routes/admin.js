const path = require('path');

const express = require('express');

const adminController = require('../controllers/admin');
const isAuthenticatedMiddleware = require('../middleware/isAuthenticated');

const { productValidationRules, validProductRequest } = require('../middleware/validProductRequest');

const router = express.Router();

router.use(isAuthenticatedMiddleware); // Apply authentication middleware to all admin routes

// /admin/add-product => GET
//Below is the way to protect your routes, so even if user directly pastes your url in the brower the below middlewares
// will be exceuted in left to right order -> If user is not authentiocated -> it will be redirected to Login page
// else to add product screen
router.get('/add-product', adminController.getAddProduct);

// /admin/products => GET
router.get('/products', adminController.getProducts);

// /admin/add-product => POST
router.post('/add-product', productValidationRules, validProductRequest, adminController.postAddProduct);

router.get('/edit-product/:productId', adminController.getEditProduct);

router.post('/edit-product', productValidationRules, validProductRequest, adminController.postEditProduct);

// router.post('/delete-product', adminController.postDeleteProduct);

router.delete('/delete-product', adminController.postDeleteProduct);

module.exports = router;
