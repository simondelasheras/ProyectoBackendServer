const mongoose = require("mongoose");

const dbConnection = async () => {
  const connectionString = (process.env.CONNECTION_STRING || "").trim();
  if (!connectionString) {
    throw new Error("Falta configurar CONNECTION_STRING.");
  }
  try {
    await mongoose.connect(connectionString, { serverSelectionTimeoutMS: 5000 });
    console.log("Base de datos online");
  } catch {
    throw new Error("No se pudo conectar a la base de datos. Revisá que MongoDB esté en marcha y que CONNECTION_STRING sea válida.");
  }
};

module.exports = { dbConnection };
