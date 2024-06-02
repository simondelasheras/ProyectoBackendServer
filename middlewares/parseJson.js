
const parseJson = (req, res, next) => {
  try {
    // Verifica que el tipo de contenido de la solicitud sea JSON
    if (req.headers['content-type'] !== 'application/json') {
      throw new Error('Tipo de contenido no es JSON');
    }

    // Verifica que haya datos en el cuerpo de la solicitud
    if (!req.body) {
      throw new Error('Cuerpo de la solicitud vacío');
    }

    // Analiza el cuerpo JSON de la solicitud
    req.parsedBody = JSON.parse(req.body);

    // Pasa al siguiente middleware o ruta
    next();
  } catch (error) {
    // Maneja los errores de análisis JSON
    res.status(400).json({ error: error.message });
  }
};

module.exports = parseJson;
