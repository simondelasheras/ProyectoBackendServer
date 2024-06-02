
const mongoose = require("mongoose");

console.log('Cadena de conexión desde process.env:', process.env.CONNECTION_STRING);


const dbConnection = async () => {
  try {
    const connectionString = process.env.CONNECTION_STRING; 
    console.log(connectionString);
    if (!connectionString) {
      throw new Error("La cadena de conexión está indefinida");
    }

    await mongoose.connect(process.env.CONNECTION_STRING);
    console.log("Base de datos online");
  } catch (error) {
    console.error(error);
    throw new Error("Error a la hora de iniciar la base de datos");
  }
}

console.log(dbConnection.CONNECTION_STRING);

module.exports = { dbConnection };