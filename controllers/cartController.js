// cartController.js
const { Carrito, Producto } = require('./models');

// Obtener contenido del carrito
const getCartContents = async (req, res) => {
  try {
    const carrito = await Carrito.findOne();
    res.json(carrito);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Agregar producto al carrito
const addToCart = async (req, res) => {
  try {
    const productId = req.params.productId;
    const producto = await Producto.findById(productId);

    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    let carrito = await Carrito.findOne();

    if (!carrito) {
      carrito = new Carrito();
    }

    const existingProduct = carrito.products.find(item => item.product.equals(productId));

    if (existingProduct) {
      existingProduct.quantity += 1;
    } else {
      carrito.products.push({ product: productId, quantity: 1 });
    }

    await carrito.save();
    res.json(carrito);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Eliminar producto del carrito
const removeFromCart = async (req, res) => {
  try {
    const productId = req.params.productId;
    const carrito = await Carrito.findOne();

    if (!carrito) {
      return res.status(404).json({ error: 'Carrito no encontrado' });
    }

    carrito.products = carrito.products.filter(item => !item.product.equals(productId));

    await carrito.save();
    res.json(carrito);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Limpiar todo el carrito
const clearCart = async (req, res) => {
  try {
    const carrito = await Carrito.findOne();

    if (!carrito) {
      return res.status(404).json({ error: 'Carrito no encontrado' });
    }

    carrito.products = [];
    await carrito.save();
    res.json(carrito);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getCartContents, addToCart, removeFromCart, clearCart };