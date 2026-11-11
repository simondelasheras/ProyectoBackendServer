const { Router } = require("express");
const { productsGet, productsPost, productsPatch } = require('../controllers/productController');
const { body, param } = require('express-validator');
const router = Router();

router.get('/', productsGet);

router.post('/', [
  body('name').notEmpty().isString(),
  body('type').notEmpty().isString(),
], productsPost);

router.patch('/:_id', [
  param('_id').notEmpty().isMongoId(),
], productsPatch);

module.exports = router;
