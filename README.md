# Power Sport

API de la tienda simulada Power Sport. Express y MongoDB (Mongoose).

Es una simulación. Después de una compra exitosa, el cliente vacía el carrito y repone el stock a propósito. Este servidor no descuenta ni repone stock.

## Requisitos

- Node.js
- MongoDB en marcha. El ejemplo usa `mongodb://127.0.0.1:27017/powersport_local`. Otra base se indica con `CONNECTION_STRING`.

## Arranque

```bash
cp .env.example .env
npm install
npm start
```

`.env` no se versiona. `npm test` no ejecuta pruebas: el proyecto no tiene una suite automatizada.

Si `PORT` se omite, se usan 5050, 8080 y 9090. El proceso espera a MongoDB antes de escuchar. Si la base no responde o un puerto está ocupado, termina con un mensaje y no deja los servidores a medias.

## Puertos

Un solo proceso abre tres servidores porque el frontend llama a cada recurso por separado:

| Puerto | Recurso         |
| ------ | --------------- |
| 5050   | `/api/products` |
| 8080   | `/api/carts`    |
| 9090   | `/api/buy`      |

`PORT` acepta hasta tres puertos separados por coma (`5050,8080,9090`). Si solo se indica el primero, carritos y compra quedan en 8080 y 9090.

## Variables

| Variable            | Descripción                                                                 |
| ------------------- | --------------------------------------------------------------------------- |
| `PORT`              | Puertos de productos, carritos y compra. Si se omite: `5050,8080,9090`.    |
| `CONNECTION_STRING` | URI de MongoDB.                                                          |
| `BREVO_SMTP_HOST`   | Servidor SMTP. Si se omite: `smtp-relay.brevo.com`.                         |
| `BREVO_SMTP_PORT`   | Puerto. Si se omite: `587` (STARTTLS). `2525` también negocia STARTTLS. `465` usa TLS implícito. |
| `BREVO_SMTP_LOGIN`  | Usuario SMTP de Brevo. No es el remitente.                                  |
| `BREVO_SMTP_KEY`    | Clave SMTP de Brevo. No es la API key ni una clave de SendGrid.             |
| `BREVO_FROM_EMAIL`  | Remitente. Tiene que estar autorizado en Brevo.                             |

Si faltan el usuario, la clave o el remitente, la compra responde `503` y no intenta enviar.

## Correo de compra

`POST /api/buy` envía la confirmación con nodemailer. El destinatario es el `email` del pedido.

`purchaseId` es opcional. Lo genera el cliente antes del primer envío y lo reutiliza en los reintentos de ese intento. Con el mismo id no se reenvía el correo. Si el SMTP falló, ese id se puede volver a usar. Sin el campo, cada POST envía un correo. El registro dura 24 horas. Un `409` significa que ese id todavía se está enviando.

## Pendiente para publicar

- Actualizar dependencias con avisos de `npm audit`. Este cambio no sube versiones.
- Elegir hosting y puertos públicos. El frontend de la simulación espera 5050, 8080 y 9090 en localhost.
- Ampliar CORS más allá de `http://localhost:3000` cuando exista un dominio.
- Autenticar y limitar la escritura de productos y carritos, y el envío de correos, antes de exponer la API.
