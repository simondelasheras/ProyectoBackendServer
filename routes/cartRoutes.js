const express = require('express');
const { Router } = require("express");
const { cartGet, cartPost, cartPatch, cartDelete } = require('../controllers/cartController');
const { body, param } = require('express-validator');
const router = Router();

// Ruta para obtener el carrito
router.get('/', cartGet);

// Ruta para agregar un producto al carrito
router.post('/', [
  // Definir reglas de validación para la solicitud POST
  body('name').notEmpty().isString(),
  body('type').notEmpty().isString(),
  // Más validaciones si es necesario
], cartPost);

// Ruta para actualizar un producto en el carrito
router.patch('/:_id', [
  // Definir reglas de validación para la solicitud PATCH
  param('_id').notEmpty().isMongoId(),
  // Más validaciones si es necesario
], cartPatch);

// Ruta para eliminar un producto del carrito
router.delete('/:_id', [
  // Definir reglas de validación para la solicitud DELETE
  param('_id').notEmpty().isMongoId(),
], cartDelete);

module.exports = router;
