const express = require('express');
const { Router } = require("express");
const { productsGet, productsPost, productsPatch } = require('../controllers/productController');
const router = Router();

// Ruta para obtener todos los productos
router.get('/', productsGet);

// Ruta para crear un nuevo producto
router.post('/', productsPost);

// Ruta para actualizar un producto existente
router.patch('/:_id', productsPatch);


module.exports = router;
