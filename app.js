require("dotenv").config();

const Server = require("./models/server.js");

const server = new Server();

const port = process.env.PORT;

server.listen(port, () => {
  console.log(`Servidor corriendo en puerto ${port}`);
});