const DEFAULT_LIMIT = 10;
const DEFAULT_WINDOW_MS = 60 * 1000;

function readCount(name, fallback) {
  const raw = process.env[name];
  if (raw == null || String(raw).trim() === "") return fallback;
  if (!/^[0-9]+$/.test(String(raw).trim())) {
    throw new Error(`${name} debe ser un número entero.`);
  }
  return Number(raw);
}

function createBuyRateLimit() {
  const limit = readCount("BUY_RATE_LIMIT", DEFAULT_LIMIT);
  const windowMs = readCount("BUY_RATE_WINDOW_MS", DEFAULT_WINDOW_MS);
  if (windowMs < 1) {
    throw new Error("BUY_RATE_WINDOW_MS debe ser mayor que cero.");
  }

  const hits = new Map();

  return function buyRateLimit(req, res, next) {
    if (limit === 0) return next();

    const now = Date.now();
    const ip = req.ip || req.socket.remoteAddress || "desconocida";
    const recent = (hits.get(ip) || []).filter((time) => now - time < windowMs);
    if (recent.length >= limit) {
      hits.set(ip, recent);
      return res.status(429).json({
        error: "Demasiadas solicitudes de compra. Inténtalo de nuevo más tarde.",
      });
    }

    recent.push(now);
    hits.set(ip, recent);
    if (hits.size > 1000) {
      for (const [key, times] of hits) {
        const still = times.filter((time) => now - time < windowMs);
        if (still.length === 0) hits.delete(key);
        else hits.set(key, still);
      }
    }
    next();
  };
}

module.exports = createBuyRateLimit;
