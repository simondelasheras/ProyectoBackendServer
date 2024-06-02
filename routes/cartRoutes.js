const express = require('express');
const { Router } = require("express");
const { cartGet, cartPost, cartPatch, cartDelete } = require('../controllers/cartController');
const router = Router();


// Ruta para obtener el carrito
router.get('/', cartGet);

// Ruta para agregar un producto al carrito
router.post('/', cartPost);

// Ruta para actualizar un producto en el carrito
router.patch('/:_id', cartPatch);

// Ruta para eliminar un producto del carrito
router.delete('/:_id', cartDelete);

module.exports = router;
