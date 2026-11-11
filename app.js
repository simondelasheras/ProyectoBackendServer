require("dotenv").config();

async function main() {
  try {
    const Server = require("./models/server.js");
    const server = new Server();
    await server.conectarDB();
    await server.listen();
  } catch (error) {
    console.error(error.message || "No se pudo iniciar el servidor.");
    process.exit(1);
  }
}

main();
