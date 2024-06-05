// middlewares/parseJson.js
const parseJson = (req, res, next) => {
  console.log('parseJson middleware triggered for path:', req.path);

  // Verificar si el método es POST, PATCH o PUT (excluye DELETE)
  if (!['POST', 'PATCH', 'PUT'].includes(req.method)) {
    return next();
  }

  // Verificar si el Content-Type es application/json
  if (req.headers['content-type'] !== 'application/json') {
    console.log('Invalid content type');
    return res.status(400).json({ error: 'Tipo de contenido no es JSON' });
  }

  let rawData = '';
  req.on('data', chunk => {
    rawData += chunk;
  });

  req.on('end', () => {
    try {
      req.body = JSON.parse(rawData);
      console.log('Parsed body:', req.body); // Log para ver el cuerpo parseado
      next();
    } catch (error) {
      console.log('JSON parsing error:', error.message);
      res.status(400).json({ error: 'Error analizando JSON: ' + error.message });
    }
  });
};

module.exports = parseJson;





