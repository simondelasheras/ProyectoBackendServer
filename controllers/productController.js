// productController.js
const { Producto } = require('./models');

// Obtener todos los productos
const getAllProducts = async (req, res) => {
  try {
    const productos = await Producto.find();
    res.json(productos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener detalles de un producto específico
const getProductDetails = async (req, res) => {
  try {
    const producto = await Producto.findById(req.params.productId);
    res.json(producto);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getAllProducts, getProductDetails };