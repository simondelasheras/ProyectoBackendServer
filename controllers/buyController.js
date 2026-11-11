// controllers/buyController.js
const { validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const PurchaseAttempt = require('../models/purchaseAttempt');

const DEFAULT_SMTP_HOST = 'smtp-relay.brevo.com';
const DEFAULT_SMTP_PORT = 587;
const PURCHASE_ID = /^[A-Za-z0-9_-]{8,80}$/;
const STALE_MS = 60000;
const WAIT_MS = 25000;

const NOT_CONFIGURED = { error: 'El envío de correo no está configurado.' };
const PURCHASE_ERROR = {
  error: 'Error al procesar la compra. Por favor, inténtalo de nuevo más tarde.',
};
const SUCCESS_BODY = {
  message: 'Correo electrónico de confirmación enviado correctamente',
};
const IN_PROGRESS = {
  error: 'La compra ya se está procesando. Inténtalo de nuevo en unos segundos.',
};
const INVALID_PURCHASE_ID = {
  error: 'purchaseId debe ser una cadena de 8 a 80 caracteres (letras, números, guion o guion bajo).',
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

function normalizePurchaseId(body) {
  if (!body || body.purchaseId == null) return { id: null };
  if (typeof body.purchaseId !== 'string') return { error: true };
  const id = body.purchaseId.trim();
  if (!id) return { id: null };
  if (!PURCHASE_ID.test(id)) return { error: true };
  return { id };
}

let indexesReady = null;

function ensurePurchaseIndexes() {
  if (!indexesReady) {
    indexesReady = PurchaseAttempt.init().catch((error) => {
      indexesReady = null;
      throw error;
    });
  }
  return indexesReady;
}

function isDuplicateKey(error) {
  return Boolean(error && (error.code === 11000 || (error.cause && error.cause.code === 11000)));
}

async function claimPurchase(purchaseId) {
  const now = new Date();
  const reclaimed = await PurchaseAttempt.findOneAndUpdate(
    {
      purchaseId,
      $or: [
        { status: 'failed' },
        { status: 'processing', createdAt: { $lte: new Date(Date.now() - STALE_MS) } },
      ],
    },
    {
      $set: { status: 'processing', createdAt: now },
      $unset: { responseStatus: '', responseBody: '' },
    },
    { new: true }
  );
  if (reclaimed) return 'owner';

  try {
    await PurchaseAttempt.create({ purchaseId, status: 'processing', createdAt: now });
    return 'owner';
  } catch (error) {
    if (isDuplicateKey(error)) return 'duplicate';
    throw error;
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForPurchase(purchaseId) {
  const deadline = Date.now() + WAIT_MS;
  while (Date.now() < deadline) {
    const doc = await PurchaseAttempt.findOne({ purchaseId }).lean();
    if (!doc || doc.status === 'failed') return { state: 'again' };
    if (doc.status === 'completed') return { state: 'completed', doc };
    await sleep(40);
  }

  const doc = await PurchaseAttempt.findOne({ purchaseId }).lean();
  if (!doc || doc.status === 'failed') return { state: 'again' };
  if (doc.status === 'completed') return { state: 'completed', doc };
  return { state: 'processing' };
}

async function deliverConfirmation(mailConfig, email, products) {
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
      return false;
    }
    return true;
  } catch {
    console.error('No se pudo enviar el correo de confirmación.');
    return false;
  } finally {
    transport.close();
  }
}

async function markFailed(purchaseId) {
  await PurchaseAttempt.updateOne(
    { purchaseId, status: 'processing' },
    {
      $set: { status: 'failed', createdAt: new Date() },
      $unset: { responseStatus: '', responseBody: '' },
    }
  );
}

async function markCompleted(purchaseId) {
  await PurchaseAttempt.updateOne(
    { purchaseId, status: 'processing' },
    { $set: { status: 'completed', responseStatus: 200, responseBody: SUCCESS_BODY } }
  );
}

async function confirmOnce(purchaseId, mailConfig, email, products, res) {
  await ensurePurchaseIndexes();

  for (let round = 0; round < 8; round += 1) {
    const role = await claimPurchase(purchaseId);
    if (role === 'owner') {
      const sent = await deliverConfirmation(mailConfig, email, products);
      if (!sent) {
        // El SMTP no aceptó el mensaje: el mismo id tiene que poder reintentar.
        await markFailed(purchaseId);
        return res.status(500).json(PURCHASE_ERROR);
      }
      try {
        await markCompleted(purchaseId);
      } catch {
        console.error('No se pudo registrar el resultado de la compra.');
      }
      return res.status(200).json(SUCCESS_BODY);
    }

    const outcome = await waitForPurchase(purchaseId);
    if (outcome.state === 'completed') {
      const body = outcome.doc.responseBody || SUCCESS_BODY;
      return res.status(outcome.doc.responseStatus || 200).json(body);
    }
    if (outcome.state === 'processing') {
      return res.status(409).json(IN_PROGRESS);
    }
  }

  return res.status(409).json(IN_PROGRESS);
}

const handleGetRequest = (req, res) => {
  res.status(200).json({ message: 'GET request received on /api/buy' });
};

const processPurchase = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, products } = req.body;

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Email is required and must be a string' });
  }

  if (!Array.isArray(products) || products.length === 0) {
    return res.status(400).json({ error: 'Products array is required and must not be empty' });
  }

  const mailConfig = readMailConfig();
  if (configProblem(mailConfig)) {
    return res.status(503).json(NOT_CONFIGURED);
  }

  const purchase = normalizePurchaseId(req.body);
  if (purchase.error) {
    return res.status(400).json(INVALID_PURCHASE_ID);
  }

  try {
    if (!purchase.id) {
      const sent = await deliverConfirmation(mailConfig, email, products);
      if (!sent) return res.status(500).json(PURCHASE_ERROR);
      return res.status(200).json(SUCCESS_BODY);
    }
    return await confirmOnce(purchase.id, mailConfig, email, products, res);
  } catch {
    console.error('No se pudo enviar el correo de confirmación.');
    if (!res.headersSent) {
      return res.status(500).json(PURCHASE_ERROR);
    }
  }
};

module.exports = {
  processPurchase,
  handleGetRequest,
};
