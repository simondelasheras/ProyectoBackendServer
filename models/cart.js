const { Schema, model } = require("mongoose");

const CartSchema = Schema({
  name: {
    type: String,
  },
  type: {
    type: String,
  },
  price: {
    type: String,
  },
  patent: {
    type: String,
  },
  category: {
    type: String,
  },
  gender: {
    type: String,
  },
  slug: {
    type: String,
  },
  image: {
    type: String,
  },
  countInStock: {
    type: Number,
  },
  description: {
    type: String,
  },
  inCart: {
    type: Number,
  }
});

const Cart = model('Cart', CartSchema);

module.exports = Cart;