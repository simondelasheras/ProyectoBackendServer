const express = require("express");
const cors = require("cors");
const { dbConnection } = require("../database/db.js");
const productRoutes = require("../routes/productRoutes.js");
const cartRoutes = require("../routes/cartRoutes.js");
const buyRoutes = require("../routes/buyRoutes.js");
const parseJson = require("../middlewares/parseJson.js");

const DEFAULT_PORTS = [5050, 8080, 9090];

function readPorts() {
  const raw = process.env.PORT;
  if (raw == null || String(raw).trim() === "") {
    return DEFAULT_PORTS.slice();
  }

  const parts = String(raw).split(",").map((part) => part.trim());
  if (parts.length > DEFAULT_PORTS.length) {
    throw new Error("PORT acepta como máximo tres puertos separados por coma.");
  }

  return DEFAULT_PORTS.map((fallback, index) => {
    const value = parts[index];
    if (!value) return fallback;
    if (!/^[0-9]+$/.test(value)) {
      throw new Error("PORT debe listar puertos numéricos separados por coma.");
    }
    const port = Number(value);
    if (port < 1 || port > 65535) {
      throw new Error("PORT tiene un número de puerto fuera de rango.");
    }
    return port;
  });
}

class Server {
  constructor() {
    const [port1, port2, port3] = readPorts();
    this.app1 = express();
    this.app2 = express();
    this.app3 = express();
    this.port1 = port1;
    this.port2 = port2;
    this.port3 = port3;

    this.middlewares();
    this.routes();
  }

  async conectarDB() {
    await dbConnection();
  }

  configureApp(app) {
    app.use(cors({
      origin: "http://localhost:3000",
      methods: ["GET", "POST", "PATCH", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization"],
    }));
    app.use(parseJson);
    app.use(express.static("public"));
  }

  middlewares() {
    this.configureApp(this.app1);
    this.configureApp(this.app2);
    this.configureApp(this.app3);
  }

  routes() {
    this.app1.use("/api/products", productRoutes);
    this.app2.use("/api/carts", cartRoutes);
    this.app3.use("/api/buy", buyRoutes);
  }

  listen() {
    const bindings = [
      [this.app1, this.port1, "productos"],
      [this.app2, this.port2, "carritos"],
      [this.app3, this.port3, "compra"],
    ];
    const servers = [];

    return new Promise((resolve, reject) => {
      let remaining = bindings.length;
      let settled = false;

      const fail = (error) => {
        if (settled) return;
        settled = true;
        Promise.all(servers.map((httpServer) => new Promise((done) => httpServer.close(done))))
          .then(() => reject(error));
      };

      for (const [app, port, name] of bindings) {
        const httpServer = app.listen(port, () => {
          if (settled) return;
          console.log(`Servidor de ${name} en el puerto ${port}`);
          remaining -= 1;
          if (remaining === 0) {
            settled = true;
            resolve();
          }
        });
        servers.push(httpServer);
        httpServer.on("error", (error) => {
          if (error.code === "EADDRINUSE") {
            fail(new Error(`El puerto ${port} (${name}) ya está en uso.`));
            return;
          }
          fail(new Error(`No se pudo escuchar en el puerto ${port} (${name}).`));
        });
      }
    });
  }
}

module.exports = Server;
