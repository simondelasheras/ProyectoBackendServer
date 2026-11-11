# Power Sport

API de la tienda simulada Power Sport. Express y MongoDB (Mongoose).

El proceso levanta tres servidores:

| Puerto | Recurso        |
| ------ | -------------- |
| 5050   | `/api/products` |
| 8080   | `/api/carts`    |
| 9090   | `/api/buy`      |

`PORT` acepta los tres puertos separados por coma (`5050,8080,9090`). Si solo se indica uno, productos usa ese valor y el resto queda en 8080 y 9090.

## Arranque

```bash
cp .env.example .env
npm install
npm start
```

`.env` no se versiona.

## Correo de compra (Brevo SMTP)

`POST /api/buy` envía la confirmación con nodemailer. El destinatario es el `email` del pedido. El remitente y las credenciales se leen solo de estas variables:

| Variable            | Descripción                                                                 |
| ------------------- | --------------------------------------------------------------------------- |
| `BREVO_SMTP_HOST`   | Servidor SMTP. Si se omite: `smtp-relay.brevo.com`.                         |
| `BREVO_SMTP_PORT`   | Puerto. Si se omite: `587` (STARTTLS). `2525` también negocia STARTTLS. `465` usa TLS implícito. |
| `BREVO_SMTP_LOGIN`  | Usuario SMTP de Brevo. No es el remitente.                                  |
| `BREVO_SMTP_KEY`    | Clave SMTP de Brevo. No es la API key (`xkeysib-`) ni una clave de SendGrid. |
| `BREVO_FROM_EMAIL`  | Remitente. Tiene que estar autorizado en Brevo.                             |

Si faltan el usuario, la clave o el remitente, la compra responde `503` y no intenta enviar.

`CONNECTION_STRING` es la URI de MongoDB.

## Id de compra

`purchaseId` es opcional en el JSON de `POST /api/buy`. Lo genera el cliente (un UUID sirve) antes del primer envío y lo guarda antes de llamar a la API. Tiene entre 8 y 80 caracteres: letras, números, guion o guion bajo.

Con el mismo id, un reintento devuelve la misma respuesta y no reenvía el correo. Si el SMTP falló, ese id se puede volver a usar. Dos pedidos a la vez con el mismo id producen un solo envío. Sin el campo, cada POST envía un correo.

El registro dura 24 horas. Un `409` significa que ese id todavía se está enviando: hay que reintentar el mismo valor, no crear otro.
