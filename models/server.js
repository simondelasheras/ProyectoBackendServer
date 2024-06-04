const express = require("express");
const cors = require("cors");
const { dbConnection } = require("../database/db.js");
const productRoutes = require("../routes/productRoutes.js");
const cartRoutes = require("../routes/cartRoutes.js");
const buyRoutes = require("../routes/buyRoutes.js");
const parseJson = require('../middlewares/parseJson');

class Server {
  constructor() {
    this.app1 = express();
    this.app2 = express();
    this.app3 = express();
    this.port1 = process.env.PORT.split(',')[0] || 5050; // Obtener el primer puerto de la lista o usar 5050 como predeterminado
    this.port2 = process.env.PORT.split(',')[1] || 8080; // Obtener el segundo puerto de la lista o usar 8080 como predeterminado
    this.port3 = process.env.PORT.split(',')[2] || 9090; // Obtener el tercer puerto de la lista o usar 9090 como predeterminado


    // Middlewares
    this.middlewares();

    // Rutas de la aplicación
    this.routes();

    // Conexión a la base de datos
    this.conectarDB();
  }

  async conectarDB() {
    await dbConnection();
  }

  middlewares() {
    this.app1.use(cors({
      origin: 'http://localhost:3000', // Permitir solicitudes solo desde este origen (URL del frontend)
      methods: ['GET', 'POST', 'PATCH', 'DELETE'], // Permitir estos métodos HTTP
      allowedHeaders: ['Content-Type', 'Authorization'], // Permitir estos encabezados
    }));
    this.app1.use(express.json());
    this.app1.use(express.static("public"));
    // this.app1.use(parseJson);

    this.app2.use(cors({
      origin: 'http://localhost:3000', // Permitir solicitudes solo desde este origen (URL del frontend)
      methods: ['GET', 'POST', 'PATCH', 'DELETE'], // Permitir estos métodos HTTP
      allowedHeaders: ['Content-Type', 'Authorization'], // Permitir estos encabezados
    }));
    this.app2.use(express.json());
    this.app2.use(express.static("public"));
    // this.app2.use(parseJson);

    this.app3.use(cors({
      origin: 'http://localhost:3000', // Permitir solicitudes solo desde este origen (URL del frontend)
      methods: ['GET', 'POST', 'PATCH', 'DELETE'], // Permitir estos métodos HTTP
      allowedHeaders: ['Content-Type', 'Authorization'], // Permitir estos encabezados
    }));
    this.app3.use(express.json());
    this.app3.use(express.static("public"));
    // this.app3.use(parseJson);
  }

  routes() {
    // Asignar rutas específicas a cada aplicación
    this.app1.use("/api/products", productRoutes);
    this.app2.use("/api/carts", cartRoutes);
    this.app3.use("/api/buy", buyRoutes);
  }

  listen() {
    this.app1.listen(this.port1, () => {
      console.log("Servidor corriendo en puerto", this.port1);
    });

    this.app2.listen(this.port2, () => {
      console.log("Servidor corriendo en puerto", this.port2);
    });

    this.app3.listen(this.port3, () => {
      console.log("Servidor corriendo en puerto", this.port3);
    });
  }
}

module.exports = Server;