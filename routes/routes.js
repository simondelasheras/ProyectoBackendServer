// // Importa el middleware
// const parseJson = require('../middlewares/parseJson');

// // Importa express
// const express = require('express');
// const { Router } = require("express");
// const { body, validationResult } = require('express-validator'); // Importamos express-validator
// const nodemailer = require('nodemailer'); // Importamos nodemailer
// const Product = require('../models/products');
// const Cart = require("../models/cart");

// const router = Router();

// // Usa el middleware parseJson en todas las rutas
// // router.use(parseJson);

// // Ruta para obtener todos los productos
// router.get('/products', async (req, res) => {
//   try {
//     const products = await Product.find();
//     console.log("lista de products", products);
//     res.json(products);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // Ruta para obtener el carrito
// router.get('/carts', async (req, res) => {
//   try {
//     const cartItems = await Cart.find();
//     res.json(cartItems);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });


// // Ruta para crear un nuevo producto
// router.post('/products', async (req, res) => {
//   try {
//     const newProduct = new Product(req.body);
//     await newProduct.save();
//     res.status(201).json(newProduct);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// });

// // Ruta para agregar un producto al carrito
// router.post('/carts', async (req, res) => {
//   try {
//     const newCartItem = new Cart(req.body);
//     await newCartItem.save();
//     res.status(201).json(newCartItem);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// });

// // Ruta para actualizar un producto existente
// router.patch('/products/:_id', async (req, res) => {
//   try {
//     const { _id } = req.params;

//     // Verificar si el _id es válido utilizando una expresión regular
//     const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(_id);
//     if (!isValidObjectId) {
//       return res.status(400).json({ error: 'Identificador de producto inválido' });
//     }

//     // Verificar si el producto existe en la base de datos
//     const product = await Product.findById(_id);
//     if (!product) {
//       return res.status(404).json({ error: 'Producto no encontrado' });
//     }

//     // Validar los datos del cuerpo de la solicitud
//     if (typeof req.body.name !== 'string' || req.body.name.trim() === '') {
//       return res.status(400).json({ error: 'El nombre del producto es inválido' });
//     }

//     // Actualizar el producto
//     const updateProduct = await Product.findByIdAndUpdate(_id, req.body, { new: true });
//     res.json(updateProduct);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// });


// // Nueva ruta PATCH para actualizar un producto en el carrito
// router.patch('/carts/:_id', async (req, res) => {
//   try {
//     const { _id } = req.params;
//     const updateCartItem = await Cart.findByIdAndUpdate(_id, req.body, { new: true });
//     res.json(updateCartItem);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// });

// // Ruta para eliminar un producto
// router.delete('/cart/:_id', async (req, res) => {
//   try {
//     const { _id } = req.params;
//     await Cart.findByIdAndDelete(_id);
//     res.json({ message: 'Producto eliminado correctamente del carrito' });
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// });
// // Ruta para procesar el pedido de compra con validación de datos y envío de correo electrónico de confirmación
// router.post('/buy', [
//   body('email').isEmail().normalizeEmail(),
//   // Agregar validación para verificar los productos en el pedido
//   body('products').isArray().notEmpty().withMessage('El pedido debe contener al menos un producto'),
//   // Otras validaciones según sea necesario...
// ], async (req, res) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res.status(400).json({ errors: errors.array() });
//   }

//   try {
//     // Procesar el pedido...

//     // Crear un transporte SMTP reutilizable usando nodemailer
//     const transporter = nodemailer.createTransport({
//       service: 'gmail',
//       auth: {
//         user: 'tu_correo@gmail.com',
//         pass: 'tu_contraseña'
//       }
//     });

//     // Configurar opciones del correo electrónico
//     const mailOptions = {
//       from: 'tu_correo@gmail.com',
//       to: req.body.email,
//       subject: 'Confirmación de compra',
//       text: '¡Gracias por tu compra en nuestra tienda!'
//       // Puedes agregar más detalles del pedido en el cuerpo del correo electrónico
//     };

//     // Enviar el correo electrónico de confirmación
//     await transporter.sendMail(mailOptions);

//     // Responder con un mensaje de éxito
//     res.json({ message: 'Correo electrónico de confirmación enviado correctamente' });
//   } catch (error) {
//     // Manejar cualquier error al enviar el correo electrónico
//     res.status(500).json({ error: 'Error al enviar el correo electrónico de confirmación' });
//   }
// });

// module.exports = router;