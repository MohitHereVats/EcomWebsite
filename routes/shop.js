const path = require('path');

const express = require('express');

const shopController = require('../controllers/shop');
const isAuthenticatedMiddleware = require('../middleware/isAuthenticated');

const router = express.Router();

router.get('/', shopController.getIndex);

router.get('/products', shopController.getProducts);

router.get('/products/:productId', shopController.getProduct);

router.get('/cart', isAuthenticatedMiddleware, shopController.getCart);

router.post('/cart', shopController.postCart);

router.post('/cart-delete-item', shopController.postCartDeleteProduct);

// router.post('/create-order', shopController.postOrder);

router.get('/orders', isAuthenticatedMiddleware, shopController.getOrders);

router.get('/orders/:orderId', isAuthenticatedMiddleware, shopController.getInvoice);

router.get('/checkout', isAuthenticatedMiddleware, shopController.getCheckout);

module.exports = router;
