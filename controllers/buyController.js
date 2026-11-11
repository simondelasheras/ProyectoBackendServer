// controllers/buyController.js
const { validationResult } = require('express-validator');
const nodemailer = require('nodemailer');

const DEFAULT_SMTP_HOST = 'smtp-relay.brevo.com';
const DEFAULT_SMTP_PORT = 587;

const NOT_CONFIGURED = { error: 'El envío de correo no está configurado.' };
const PURCHASE_ERROR = {
  error: 'Error al procesar la compra. Por favor, inténtalo de nuevo más tarde.',
};

function readMailConfig() {
  const login = (process.env.BREVO_SMTP_LOGIN || '').trim();
  const key = process.env.BREVO_SMTP_KEY == null ? '' : String(process.env.BREVO_SMTP_KEY);
  const from = (process.env.BREVO_FROM_EMAIL || '').trim();
  const host = (process.env.BREVO_SMTP_HOST || DEFAULT_SMTP_HOST).trim() || DEFAULT_SMTP_HOST;
  const portRaw = (process.env.BREVO_SMTP_PORT || String(DEFAULT_SMTP_PORT)).trim();
  const port = /^[0-9]+$/.test(portRaw) ? Number(portRaw) : NaN;

  return { login, key, from, host, port };
}

function isEmailAddress(value) {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value);
}

function configProblem(cfg) {
  if (!cfg.login || !cfg.key || !cfg.from || !cfg.host) {
    return 'missing';
  }
  if (!Number.isInteger(cfg.port) || cfg.port < 1 || cfg.port > 65535) {
    return 'port';
  }
  if (!isEmailAddress(cfg.login) || !isEmailAddress(cfg.from)) {
    return 'address';
  }
  if (cfg.login.toLowerCase() === cfg.host.toLowerCase()) {
    return 'login';
  }
  if (cfg.key !== cfg.key.trim() || /[\r\n]/.test(cfg.key)) {
    return 'key';
  }
  if (cfg.key.startsWith('xkeysib-') || cfg.key.startsWith('SG.')) {
    return 'key';
  }
  return null;
}

function transportOptions(cfg) {
  const startTls = cfg.port === 587 || cfg.port === 2525;
  const implicitTls = cfg.port === 465;
  const useTls = startTls || implicitTls;

  const options = {
    host: cfg.host,
    port: cfg.port,
    secure: implicitTls,
    requireTLS: useTls,
    ignoreTLS: false,
    auth: {
      user: cfg.login,
      pass: cfg.key,
    },
    pool: false,
    logger: false,
    debug: false,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
  };

  if (useTls) {
    options.tls = {
      minVersion: 'TLSv1.2',
      servername: cfg.host,
    };
  }

  return options;
}

const handleGetRequest = (req, res) => {
  res.status(200).json({ message: 'GET request received on /api/buy' });
};

const processPurchase = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const mailConfig = readMailConfig();
  if (configProblem(mailConfig)) {
    return res.status(503).json(NOT_CONFIGURED);
  }

  const { email, products } = req.body;

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Email is required and must be a string' });
  }

  if (!Array.isArray(products) || products.length === 0) {
    return res.status(400).json({ error: 'Products array is required and must not be empty' });
  }

  const transport = nodemailer.createTransport(transportOptions(mailConfig));

  try {
    const info = await transport.sendMail({
      from: mailConfig.from,
      to: email,
      subject: 'Confirmación de compra - Power Sport',
      text: `¡Gracias por tu compra en nuestra tienda online Power Sport! Has comprado los siguientes productos: ${products.map((p) => `${p.name} (x${p.inCart})`).join(', ')}. Te esperamos pronto.`,
      disableFileAccess: true,
      disableUrlAccess: true,
    });

    const accepted = Array.isArray(info.accepted) ? info.accepted : [];
    const rejected = Array.isArray(info.rejected) ? info.rejected : [];
    if (accepted.length === 0 || rejected.length > 0) {
      console.error('No se pudo enviar el correo de confirmación.');
      return res.status(500).json(PURCHASE_ERROR);
    }

    return res.json({
      message: 'Correo electrónico de confirmación enviado correctamente',
    });
  } catch {
    console.error('No se pudo enviar el correo de confirmación.');
    return res.status(500).json(PURCHASE_ERROR);
  } finally {
    transport.close();
  }
};

module.exports = {
  processPurchase,
  handleGetRequest,
};
