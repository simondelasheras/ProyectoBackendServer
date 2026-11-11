const DEFAULT_BODY_LIMIT = 64 * 1024;

function readBodyLimit() {
  const raw = process.env.JSON_BODY_LIMIT_BYTES;
  if (raw == null || String(raw).trim() === "") return DEFAULT_BODY_LIMIT;
  if (!/^[0-9]+$/.test(String(raw).trim())) {
    throw new Error("JSON_BODY_LIMIT_BYTES debe ser un número de bytes.");
  }
  const limit = Number(raw);
  if (limit < 1) {
    throw new Error("JSON_BODY_LIMIT_BYTES debe ser mayor que cero.");
  }
  return limit;
}

const bodyLimit = readBodyLimit();

const parseJson = (req, res, next) => {
  if (!["POST", "PATCH", "PUT"].includes(req.method)) {
    return next();
  }

  if (req.headers["content-type"] !== "application/json") {
    return res.status(400).json({ error: "Tipo de contenido no es JSON" });
  }

  let rawData = "";
  let rejected = false;

  req.on("data", (chunk) => {
    if (rejected) return;
    rawData += chunk;
    if (Buffer.byteLength(rawData) > bodyLimit) {
      rejected = true;
      res.status(413).json({ error: "El cuerpo de la solicitud es demasiado grande." });
      req.destroy();
    }
  });

  req.on("end", () => {
    if (rejected || res.headersSent) return;
    try {
      req.body = JSON.parse(rawData);
      next();
    } catch (error) {
      console.error("No se pudo leer el JSON de la solicitud.");
      res.status(400).json({ error: "Error analizando JSON" });
    }
  });

  req.on("error", () => {
    if (rejected || res.headersSent) return;
    res.status(400).json({ error: "No se pudo leer la solicitud." });
  });
};

module.exports = parseJson;
