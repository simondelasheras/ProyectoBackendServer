const { validationResult } = require('express-validator');
const Product = require("../models/products");

// Obtener todos los productos
const productsGet = async (req, res) => {
  try {
    const products = await Product.find();
    console.log("lista de products", products);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Crear un nuevo producto
const productsPost = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const body = req.body;
    console.log("Cuerpo de la solicitud:", body); // Imprime el cuerpo de la solicitud en la consola del servidor
    const newProduct = new Product(body);
    await newProduct.save();
    res.status(201).json({
      msg: "Producto agregado a la DB con éxito",
      newProduct
    });
  } catch (error) {
    console.error("Error al agregar producto:", error);
    res.status(400).json({ error: error.message });
  }
};

// Actualizar un producto existente
const productsPatch = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { _id } = req.params;
    const body = req.body;
    const updatedProduct = await Product.findByIdAndUpdate(_id, body, { new: true });

    if (!updatedProduct) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.json(updatedProduct);
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    res.status(400).json({ error: "Error al actualizar producto", details: error.message });
  }
};

module.exports = {
  productsGet,
  productsPost,
  productsPatch,
};


