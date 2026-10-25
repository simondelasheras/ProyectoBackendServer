const mongoose = require("mongoose");

const dbConnection = async () => {
  const connectionString = process.env.CONNECTION_STRING;
  if (!connectionString) {
    throw new Error("Falta configurar CONNECTION_STRING");
  }
  try {
    await mongoose.connect(connectionString);
    console.log("Base de datos online");
  } catch (error) {
    throw new Error("No se pudo conectar a la base de datos");
  }
};

module.exports = { dbConnection };
