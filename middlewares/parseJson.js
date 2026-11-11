// middlewares/parseJson.js
const parseJson = (req, res, next) => {
  if (!["POST", "PATCH", "PUT"].includes(req.method)) {
    return next();
  }

  if (req.headers["content-type"] !== "application/json") {
    return res.status(400).json({ error: "Tipo de contenido no es JSON" });
  }

  let rawData = "";
  req.on("data", (chunk) => {
    rawData += chunk;
  });

  req.on("end", () => {
    try {
      req.body = JSON.parse(rawData);
      next();
    } catch (error) {
      console.error("No se pudo leer el JSON de la solicitud.");
      res.status(400).json({ error: "Error analizando JSON" });
    }
  });
};

module.exports = parseJson;
