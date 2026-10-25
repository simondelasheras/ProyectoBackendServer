// controllers/buyController.js
const { validationResult } = require('express-validator');
const sgMail = require('@sendgrid/mail');



const handleGetRequest = (req, res) => {
  res.status(200).json({ message: 'GET request received on /api/buy' });
};

const processPurchase = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  if (!process.env.SENDGRID_API_KEY || !process.env.SENDGRID_FROM_EMAIL) {
    return res.status(503).json({ error: 'El envío de correo no está configurado.' });
  }

  try {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const { email, products } = req.body;

    // Verificar si se proporciona un correo electrónico válido
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Email is required and must be a string' });
    }

    // Verificar si hay productos en la solicitud
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: 'Products array is required and must not be empty' });
    }

    // Configurar opciones del correo electrónico
    const msg = {
      to: email,
      from: process.env.SENDGRID_FROM_EMAIL, // Usa una dirección verificada en SendGrid
      subject: 'Confirmación de compra - Power Sport',
      text: `¡Gracias por tu compra en nuestra tienda online Power Sport! Has comprado los siguientes productos: ${products.map(p => `${p.name} (x${p.inCart})`).join(', ')}. Te esperamos pronto.`
    };

    // Enviar el correo electrónico de confirmación
    await sgMail.send(msg);

    // Responder con un mensaje de éxito
    res.json({ message: 'Correo electrónico de confirmación enviado correctamente' });
  } catch (error) {
    console.error('No se pudo enviar el correo de confirmación.');
    res.status(500).json({ error: 'Error al procesar la compra. Por favor, inténtalo de nuevo más tarde.' });
  }
};

module.exports = {
  processPurchase,
  handleGetRequest,
};
