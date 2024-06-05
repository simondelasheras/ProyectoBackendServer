// routes/buyRoutes.js
const express = require('express');
const { Router } = require("express");
const { body } = require('express-validator');
const { processPurchase, handleGetRequest } = require('../controllers/buyController');
const router = Router();

// Ruta para manejar solicitudes GET a /api/buy
router.get('/', handleGetRequest);

// Ruta para manejar solicitudes POST a /api/buy
router.post('/', [
  // Definir reglas de validación para la solicitud POST
  body('email').isEmail().withMessage('Email must be valid'),
  body('products').isArray({ min: 1 }).withMessage('Products must be an array with at least one item'),
], processPurchase);

module.exports = router;
