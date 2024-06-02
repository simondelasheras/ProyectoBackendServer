// routes/buyRoutes.js
const express = require('express');
const { Router } = require("express");
const { body, validationResult } = require('express-validator');
const { processPurchase } = require('../controllers/buyController');
const router = Router();

router.post('/buy', [
  body('email').isEmail().normalizeEmail(),
  body('products').isArray().notEmpty().withMessage('El pedido debe contener al menos un producto'),
], processPurchase);

module.exports = router;
