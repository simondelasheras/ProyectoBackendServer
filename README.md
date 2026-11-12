# Power Sport

API de la tienda simulada Power Sport. Un proceso de Express abre tres servidores y usa MongoDB a través de Mongoose.

Es una simulación. `POST /api/buy` solo envía el correo de confirmación. No descuenta stock ni vacía el carrito. Eso lo hace el cliente: al agregar, baja `countInStock`; después de un 200, vacía el carrito y repone el stock a propósito, para poder repetir la prueba.

El frontend está en [NuevoProyectoReact](https://github.com/simondelasheras/NuevoProyectoReact/blob/dev/README.md).

## Requisitos

- Node.js y npm. `package.json` no fija `engines`. Mongoose 8.24.8, la versión del lockfile, pide Node `>= 16.20.1`. Esta guía se comprobó con Node 22.23.4 y npm 10.9.9.
- MongoDB. Sirve uno local o cualquier URI que acepte Mongoose, incluida una de Atlas (`mongodb+srv://...`). El código no distingue Atlas de un servidor local: solo usa `CONNECTION_STRING`.

## Carpeta

Todos los comandos de este repo se corren en la raíz, la carpeta que contiene `package.json` y `app.js`.

```bash
git clone https://github.com/simondelasheras/ProyectoBackendServer
cd ProyectoBackendServer
```

## Configuración

```bash
cp .env.example .env
```

`.env` no se versiona. Completá al menos `CONNECTION_STRING`. El resto puede quedar vacío y usa el valor de la tabla.

| Variable | Obligatoria | Si se deja vacía |
| --- | --- | --- |
| `CONNECTION_STRING` | Sí, para arrancar | El proceso termina: `Falta configurar CONNECTION_STRING.` |
| `PORT` | No | `5050`, `8080` y `9090`. El ejemplo trae `PORT=5050`: productos usan 5050 y los otros dos siguen en 8080 y 9090. |
| `CORS_ORIGINS` | No | `http://localhost:3000`. Varios orígenes se separan con coma. |
| `JSON_BODY_LIMIT_BYTES` | No | `65536`. Un JSON más grande responde 413. |
| `BUY_RATE_LIMIT` | No | `10` solicitudes de compra por IP en la ventana. `0` desactiva el límite. |
| `BUY_RATE_WINDOW_MS` | No | `60000`. |
| `BREVO_SMTP_HOST` | No | `smtp-relay.brevo.com`. |
| `BREVO_SMTP_PORT` | No | `587` (STARTTLS). `2525` también negocia STARTTLS. `465` usa TLS implícito. |
| `BREVO_SMTP_LOGIN` | Sí, para enviar el correo | Sin login, clave o remitente, el servidor igual arranca. `POST /api/buy` responde 503 y no envía. |
| `BREVO_SMTP_KEY` | Sí, para enviar el correo | Es la clave SMTP, no la API key (`xkeysib-`) ni una clave de SendGrid (`SG.`). Esas formas también responden 503. |
| `BREVO_FROM_EMAIL` | Sí, para enviar el correo | Remitente. En Brevo tiene que estar autorizado. No es el usuario SMTP. |

No hay un modo de correo simulado. El envío usa el SMTP indicado por `BREVO_SMTP_HOST` y `BREVO_SMTP_PORT`.

## Base de datos y productos

No hay script ni JSON de carga. La base es el nombre que figure en la URI. Con el ejemplo, es `powersport_local`.

Mongoose crea las colecciones al guardar:

| Modelo | Colección |
| --- | --- |
| `Product` | `products` |
| `Cart` | `carts` |
| `PurchaseAttempt` | `purchaseattempts` |

El catálogo de ejemplo del frontend (`utils/db.json`, 24 productos) no lo lee este servidor. Un producto se crea con `POST /api/products`. La ruta exige `name` y `type`, como texto no vacío. El resto de campos del modelo son opcionales. `Content-Type` tiene que ser exactamente `application/json`, sin `; charset=...`: si no, la respuesta es 400 `Tipo de contenido no es JSON`.

El frontend solo muestra `gender` `Men` o `Women` y `category` `Top`, `Bottom` o `Shoes`. El `id` numérico de `db.json` no se envía: no está en el modelo.

No hay índice único en `name` ni en `slug`. Solo existe el índice de `_id`. Un segundo `POST` con los mismos datos responde 201 y crea otro documento. No hay `DELETE /api/products`.

Antes de cargar, mirá el listado. Si no es `[]`, no vuelvas a hacer el `POST`.

```bash
curl -s http://localhost:5050/api/products
```

Un producto, desde cualquier carpeta, con el backend ya escuchando. En bash, `curl` es el programa curl:

```bash
curl -s -X POST http://localhost:5050/api/products \
  -H 'Content-Type: application/json' \
  -d '{"name":"Jersey Boca Jrs","type":"Camiseta","price":"1500","category":"Top","gender":"Men","slug":"jersey-boca","countInStock":20,"inCart":0,"description":"Camiseta básica"}'
```

La respuesta 201 trae `newProduct._id`.

En Windows PowerShell 5.1, `curl` no es ese programa: es un alias de `Invoke-WebRequest`. No pegues ahí los comandos de bash. PowerShell 7 en Windows tampoco: usá `curl.exe` si querés el comando de bash, o el bloque de abajo. Este bloque sirve en 5.1 y en PowerShell 7. El cuerpo va en bytes UTF-8, porque si no los acentos se pueden deformar. No agregues `charset` al `Content-Type`.

Desde cualquier carpeta:

```powershell
$producto = @{
  name = "Jersey Boca Jrs"
  type = "Camiseta"
  price = "1500"
  category = "Top"
  gender = "Men"
  slug = "jersey-boca"
  countInStock = 20
  inCart = 0
  description = "Camiseta básica"
}
$json = $producto | ConvertTo-Json -Depth 4 -Compress
$bytes = [System.Text.Encoding]::UTF8.GetBytes($json)
Invoke-RestMethod -Uri http://localhost:5050/api/products -Method Post -ContentType "application/json" -Body $bytes
```

`-Depth 4` alcanza: el producto no tiene objetos anidados. En 5.1 el valor por defecto de `-Depth` es 2.

Los 24 productos se cargan desde la raíz de `NuevoProyectoReact`, que es donde está `utils/db.json`. Es el mismo `POST` que el script de Node del README de ese repo. Si el listado no está vacío, no se vuelve a cargar.

```powershell
$raw = (Invoke-WebRequest -Uri http://localhost:5050/api/products -UseBasicParsing).Content
if ($raw.Trim() -ne "[]") {
  $existing = @(ConvertFrom-Json -InputObject $raw)
  Write-Output ("Ya hay {0} productos. No se vuelve a cargar." -f $existing.Count)
  exit 0
}
$catalog = Get-Content -Raw -Encoding utf8 (Join-Path (Get-Location) "utils/db.json") | ConvertFrom-Json
foreach ($item in $catalog.products) {
  $copy = [ordered]@{}
  foreach ($prop in $item.PSObject.Properties) {
    if ($prop.Name -ne "id") { $copy[$prop.Name] = $prop.Value }
  }
  $json = $copy | ConvertTo-Json -Depth 4 -Compress
  $bytes = [System.Text.Encoding]::UTF8.GetBytes($json)
  Invoke-RestMethod -Uri http://localhost:5050/api/products -Method Post -ContentType "application/json" -Body $bytes | Out-Null
}
Write-Output ("Cargados {0} productos" -f @($catalog.products).Count)
```

Tiene que imprimir `Cargados 24 productos` la primera vez. La segunda, `Ya hay 24 productos. No se vuelve a cargar.`

Ese `if` compara el texto de la respuesta. En PowerShell 5.1, envolver `$null` con `@()` cuenta 1, así que no uses `@((Invoke-RestMethod ...))` para saber si el listado está vacío.

Solo en una base local de pruebas, y sabiendo que borra todos los productos de esa base (no solo los de ejemplo), se puede vaciar la colección con el shell de MongoDB:

```bash
mongosh "mongodb://127.0.0.1:27017/powersport_local" --eval 'db.products.deleteMany({})'
```

No hay un endpoint para hacer eso. `DELETE /api/carts/:id` borra un ítem del carrito, no un producto.

## Arranque

Con MongoDB accesible en `CONNECTION_STRING`:

```bash
npm install
npm start
```

`npm start` ejecuta `node app.js`. Espera la base y después escucha. Si MongoDB no responde, termina con `No se pudo conectar a la base de datos...` y no deja puertos abiertos. Un puerto ocupado también termina el proceso.

Son tres servidores en el mismo proceso, porque el frontend llama a cada recurso por separado:

| Puerto | Recurso |
| --- | --- |
| 5050 | `/api/products` |
| 8080 | `/api/carts` |
| 9090 | `/api/buy` |

Comprobación:

```bash
curl -s http://localhost:5050/api/products
curl -s http://localhost:8080/api/carts
curl -s http://localhost:9090/api/buy
```

El primero y el segundo responden un arreglo. El tercero responde `{"message":"GET request received on /api/buy"}`.

`npm test` no ejecuta pruebas. Imprime `No hay pruebas automatizadas.` y termina en 0.

## Simulación de compra

Sustituí `ID` por el `_id` del producto.

Al agregar una unidad, el cliente guarda el ítem en el carrito con el mismo `_id` y descuenta el stock:

```bash
curl -s -X POST http://localhost:8080/api/carts \
  -H 'Content-Type: application/json' \
  -d '{"_id":"ID","name":"Jersey Boca Jrs","type":"Camiseta","price":"1500","category":"Top","gender":"Men","slug":"jersey-boca","countInStock":19,"inCart":1}'

curl -s -X PATCH http://localhost:5050/api/products/ID \
  -H 'Content-Type: application/json' \
  -d '{"countInStock":19,"inCart":1}'
```

`POST /api/buy` envía el correo y nada más. El destinatario es `email`. El texto usa `name` e `inCart` de cada elemento de `products`.

```bash
curl -s -X POST http://localhost:9090/api/buy \
  -H 'Content-Type: application/json' \
  -d '{"email":"comprador@example.com","purchaseId":"compra-demo-1","products":[{"name":"Jersey Boca Jrs","inCart":1}]}'
```

Con el correo configurado, la respuesta 200 es `{"message":"Correo electrónico de confirmación enviado correctamente"}`.

`purchaseId` es opcional, de 8 a 80 caracteres (`letras`, números, `-` y `_`). Si viene, se guarda en `purchaseattempts` con índice único y TTL de 24 horas. Repetir el mismo id devuelve la misma respuesta y no reenvía. Si el SMTP falló, ese id se puede volver a intentar. Un `409` significa que ese id todavía se está enviando. Sin `purchaseId`, cada POST envía un correo.

El mismo POST cuenta para el límite por IP (`BUY_RATE_LIMIT` en `BUY_RATE_WINDOW_MS`). La IP es la de la conexión, no `X-Forwarded-For`. Al pasarse, responde 429.

Después del 200, el cliente vacía el carrito y repone el stock. Es deliberado:

```bash
curl -s -X DELETE http://localhost:8080/api/carts/ID
curl -s -X PATCH http://localhost:5050/api/products/ID \
  -H 'Content-Type: application/json' \
  -d '{"countInStock":20,"inCart":0}'
```

## Orden con el frontend

1. MongoDB en marcha y `CONNECTION_STRING` en este repo.
2. `npm install` y `npm start` en esta carpeta. Los tres curl de arriba tienen que responder.
3. Cargar al menos un producto con el `POST` de arriba. Sin eso, el shop queda vacío.
4. En el otro repo, desde su raíz: `npm ci` y `npm run dev`. Abrí http://localhost:3000. El origen por defecto del CORS es ese.

Los detalles del sitio están en su README.

## Pendiente para publicar

- `nodemailer` sigue en la versión 6. El arreglo publicado pide la versión 10, un salto mayor, y no se aplicó.
- Publicar tres puertos, o unir las rutas en uno. Un proveedor que inyecte un solo `PORT` mueve solo productos y deja carritos y compra en 8080 y 9090.
- Poner en `CORS_ORIGINS` el origen público cuando exista.
- Autenticar quién escribe productos, carritos y correos. El límite por IP no reemplaza eso.
- Si hay un proxy, decidir si la IP del límite es la del proxy o la del cliente.
