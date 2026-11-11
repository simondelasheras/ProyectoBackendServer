const { Router } = require("express");
const { productsGet, productsPost, productsPatch } = require('../controllers/productController');
const { body, param } = require('express-validator');
const router = Router();

// Ruta para obtener todos los productos
router.get('/', productsGet);

// Ruta para crear un nuevo producto
router.post('/', [
  // Definir reglas de validación para la solicitud POST
  body('name').notEmpty().isString(),
  body('type').notEmpty().isString(),
  // Más validaciones si es necesario
], productsPost);

// Ruta para actualizar un producto existente
router.patch('/:_id', [
  // Definir reglas de validación para la solicitud PATCH
  param('_id').notEmpty().isMongoId(),
  // Más validaciones si es necesario
], productsPatch);

module.exports = router;
