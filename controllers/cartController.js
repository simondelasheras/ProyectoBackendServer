const { validationResult } = require('express-validator');
const Cart = require("../models/cart");

// Obtener el carrito
const cartGet = async (req, res) => {
  try {
    const cartItems = await Cart.find();
    res.json(cartItems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Agregar un producto al carrito
const cartPost = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const body = req.body;
    console.log("Cuerpo de la solicitud:", body); // Imprime el cuerpo de la solicitud en la consola del servidor
    const newCartItem = new Cart(body);
    await newCartItem.save();
    res.status(201).json({
      msg: "Producto agregado al carrito con éxito",
      newCartItem
    });
  } catch (error) {
    console.error("Error al agregar producto al carrito:", error);
    res.status(400).json({ error: error.message });
  }
};

// Actualizar un producto en el carrito
const cartPatch = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { _id } = req.params;
    const body = req.body;
    const updatedCartItem = await Cart.findByIdAndUpdate(_id, body, { new: true });

    if (!updatedCartItem) {
      return res.status(404).json({ error: "Producto en el carrito no encontrado" });
    }

    res.json(updatedCartItem);
  } catch (error) {
    console.error("Error al actualizar producto en el carrito:", error);
    res.status(400).json({ error: "Error al actualizar producto en el carrito", details: error.message });
  }
};

// Eliminar un producto del carrito
const cartDelete = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { _id } = req.params;
    await Cart.findByIdAndDelete(_id);
    res.json({ message: 'Producto eliminado correctamente del carrito' });
  } catch (error) {
    console.error("Error al eliminar producto del carrito:", error);
    res.status(400).json({ error: "Error al eliminar producto del carrito", details: error.message });
  }
};

module.exports = {
  cartGet,
  cartPost,
  cartPatch,
  cartDelete,
};
