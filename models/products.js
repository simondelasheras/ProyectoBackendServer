const { Schema, model } = require("mongoose");

const productSchema = Schema({
  name: String,
  type: String,
  price: String,
  patent: String,
  category: String,
  gender: String,
  slug: String,
  image: String,
  countInStock: Number,
  description: String,
  id: Number,
  inCart: Number,
});

const Product = model('Product', productSchema);

export default Product;