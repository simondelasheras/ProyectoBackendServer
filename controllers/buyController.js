// controllers/buyController.js
const nodemailer = require('nodemailer');
const { validationResult } = require('express-validator');

const processPurchase = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, products } = req.body;

    // Crear un transporte SMTP reutilizable usando nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'tu_correo@gmail.com',
        pass: 'tu_contraseña'
      }
    });

    // Configurar opciones del correo electrónico
    const mailOptions = {
      from: 'tu_correo@gmail.com',
      to: email,
      subject: 'Confirmación de compra - Power Sport',
      text: `¡Gracias por tu compra en nuestra tienda online Power Sport! Has comprado los siguientes productos: ${products.map(p => `${p.name} (x${p.inCart})`).join(', ')}. Te esperamos pronto.`
    };

    // Enviar el correo electrónico de confirmación
    await transporter.sendMail(mailOptions);

    // Responder con un mensaje de éxito
    res.json({ message: 'Correo electrónico de confirmación enviado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al enviar el correo electrónico de confirmación' });
  }
};

module.exports = {
  processPurchase,
};
