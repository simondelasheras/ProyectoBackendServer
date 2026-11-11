const { Router } = require("express");
const { cartGet, cartPost, cartPatch, cartDelete } = require('../controllers/cartController');
const { body, param } = require('express-validator');
const router = Router();

router.get('/', cartGet);

router.post('/', [
  body('name').notEmpty().isString(),
  body('type').notEmpty().isString(),
], cartPost);

router.patch('/:_id', [
  param('_id').notEmpty().isMongoId(),
], cartPatch);

router.delete('/:_id', [
  param('_id').notEmpty().isMongoId(),
], cartDelete);

module.exports = router;
