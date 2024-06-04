// controllers/buyController.js
const nodemailer = require('nodemailer');
const { validationResult } = require('express-validator');

const handleGetRequest = (req, res) => {
  res.status(200).json({ message: 'GET request received on /api/buy' });
};

const processPurchase = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, products } = req.body;

    // Verificar si se proporciona un correo electrónico válido
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Email is required and must be a string' });
    }

    // Verificar si hay productos en la solicitud
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: 'Products array is required and must not be empty' });
    }

    // Crear un transporte SMTP reutilizable usando nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'powersport.ok@gmail.com',
        pass: 'jxmklacfqlqvwwws'
      }
    });

    // Configurar opciones del correo electrónico
    const mailOptions = {
      from: 'powersport.ok@gmail.com',
      to: email,
      subject: 'Confirmación de compra - Power Sport',
      text: `¡Gracias por tu compra en nuestra tienda online Power Sport! Has comprado los siguientes productos: ${products.map(p => `${p.name} (x${p.inCart})`).join(', ')}. Te esperamos pronto.`
    };

    // Enviar el correo electrónico de confirmación
    await transporter.sendMail(mailOptions);

    // Responder con un mensaje de éxito
    res.json({ message: 'Correo electrónico de confirmación enviado correctamente' });
  } catch (error) {
    console.error('Error processing purchase:', error);
    res.status(500).json({ error: 'Error al procesar la compra. Por favor, inténtalo de nuevo más tarde.' });
  }
};

module.exports = {
  processPurchase,
  handleGetRequest,
};