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
| `CORS_ORIGINS`      | Orígenes permitidos, separados por coma. Si se omite: `http://localhost:3000`. |
| `JSON_BODY_LIMIT_BYTES` | Tamaño máximo del JSON. Si se omite: 65536.                          |
| `BUY_RATE_LIMIT`    | Compras por IP en la ventana. Si se omite: 10. `0` desactiva el límite. |
| `BUY_RATE_WINDOW_MS` | Ventana del límite, en milisegundos. Si se omite: 60000.               |
| `BREVO_SMTP_HOST`   | Servidor SMTP. Si se omite: `smtp-relay.brevo.com`.                         |
| `BREVO_SMTP_PORT`   | Puerto. Si se omite: `587` (STARTTLS). `2525` también negocia STARTTLS. `465` usa TLS implícito. |
| `BREVO_SMTP_LOGIN`  | Usuario SMTP de Brevo. No es el remitente.                                  |
| `BREVO_SMTP_KEY`    | Clave SMTP de Brevo. No es la API key ni una clave de SendGrid.             |
| `BREVO_FROM_EMAIL`  | Remitente. Tiene que estar autorizado en Brevo.                             |

Si faltan el usuario, la clave o el remitente, la compra responde `503` y no intenta enviar.

## Correo de compra

`POST /api/buy` envía la confirmación con nodemailer. El destinatario es el `email` del pedido.

`purchaseId` es opcional. Lo genera el cliente antes del primer envío y lo reutiliza en los reintentos de ese intento. Con el mismo id no se reenvía el correo. Si el SMTP falló, ese id se puede volver a usar. Sin el campo, cada POST envía un correo. El registro dura 24 horas. Un `409` significa que ese id todavía se está enviando.

`POST /api/buy` acepta como máximo `BUY_RATE_LIMIT` solicitudes por IP en cada ventana. El límite mira la IP de la conexión, no una cabecera reenviada. Un cuerpo JSON mayor al tope responde `413`.

## Pendiente para publicar

- `nodemailer` sigue en la versión 6. El arreglo publicado pide la versión 10, un salto mayor, y no se aplicó.
- El hosting tiene que publicar tres puertos, o decidir un solo proceso con las rutas juntas. Muchos proveedores inyectan un solo `PORT`: hoy eso mueve solo productos y deja carritos y compra en 8080 y 9090.
- Poner en `CORS_ORIGINS` el origen público cuando exista. El ejemplo no trae un dominio de producción.
- Autenticar quién puede crear o editar productos y carritos, y quién puede disparar correos. El límite por IP no reemplaza eso. Un captcha sería otra decisión de producto.
- Si la API queda detrás de un proxy, hay que decidir si la IP del límite es la del proxy o la del cliente. Hoy no se confía en `X-Forwarded-For`.
