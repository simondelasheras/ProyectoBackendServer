// routes.js
const express = require('express');
const router = express.Router();
const productController = require('./productController');
const cartController = require('./cartController');

// Rutas para productos
router.get('/api/products', productController.getAllProducts);
router.get('/api/products/:productId', productController.getProductDetails);

// Rutas para el carrito
router.get('/api/cart', cartController.getCartContents);
router.post('/api/cart/add/:productId', cartController.addToCart);
router.delete('/api/cart/remove/:productId', cartController.removeFromCart);
router.delete('/api/cart/clear', cartController.clearCart);

module.exports = router;
