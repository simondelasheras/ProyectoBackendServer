// controllers/buyController.js
const { validationResult } = require('express-validator');
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey('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');

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

    // Configurar opciones del correo electrónico
    const msg = {
      to: email,
      from: 'powersport.ok@gmail.com', // Usa una dirección verificada en SendGrid
      subject: 'Confirmación de compra - Power Sport',
      text: `¡Gracias por tu compra en nuestra tienda online Power Sport! Has comprado los siguientes productos: ${products.map(p => `${p.name} (x${p.inCart})`).join(', ')}. Te esperamos pronto.`
    };

    // Enviar el correo electrónico de confirmación
    await sgMail.send(msg);

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
