const { Router } = require("express");
const { body } = require('express-validator');
const { processPurchase, handleGetRequest } = require('../controllers/buyController');
const createBuyRateLimit = require('../middlewares/buyRateLimit');
const router = Router();

router.get('/', handleGetRequest);

router.post('/',
  createBuyRateLimit(),
  [
    body('email').isEmail().withMessage('Email must be valid'),
    body('products').isArray({ min: 1 }).withMessage('Products must be an array with at least one item'),
  ],
  processPurchase
);

module.exports = router;
