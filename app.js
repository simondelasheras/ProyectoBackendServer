require("dotenv").config();

const Server = require("./models/server.js");

async function main() {
  try {
    const server = new Server();
    await server.conectarDB();
    await server.listen();
  } catch (error) {
    console.error(error.message || "No se pudo iniciar el servidor.");
    process.exit(1);
  }
}

main();
