# PlantGuard — Backend

Backend del proyecto PlantGuard, desarrollado con FastAPI, PostgreSQL y Alembic.
Este servicio expone una API REST que permite:

- Autenticación de usuarios (JWT)
- Análisis de imágenes (sana / plaga) y almacenamiento de resultados
- Alertas climáticas vía proxy a proveedores externos
- Historial de análisis por usuario
- Servir archivos subidos (media)

Stack: FastAPI · Uvicorn · SQLAlchemy · Alembic · PostgreSQL · Docker · Render · Neon

---

## Estructura del proyecto


```
backend/
├─ alembic/ # Migraciones
│ ├─ versions/ # Archivos de migración
│ ├─ env.py # Config Alembic (lee DATABASE_URL)
│ └─ script.py.mako
│
├─ app/
│ ├─ api/
│ │ └─ routers/
│ │ ├─ auth.py # Rutas de autenticación
│ │ ├─ users.py # Rutas de usuarios
│ │ └─ routes.py # Registro de routers
│ ├─ core/
│ │ ├─ config.py # Configuración (lee .env)
│ │ ├─ rate_limit.py # Limitación de peticiones
│ │ └─ security.py # JWT y hashing
│ ├─ db/
│ │ ├─ base.py # Base declarativa
│ │ ├─ init_db.py # Inicialización de datos
│ │ ├─ models.py # Modelos ORM
│ │ └─ session.py # Sesión de DB
│ ├─ schemas/
│ │ ├─ auth.py # Schemas de autenticación
│ │ └─ user.py # Schemas de usuario
│ ├─ services/
│ │ └─ auth_service.py # Lógica de autenticación
│ ├─ utils/
│ │ └─ time.py # Helpers de tiempo
│ ├─ main.py # Punto de entrada FastAPI
│ └─ init.py
│
├─ Docs/ # Documentación (ej. clima)
├─ storage/uploads/ # Archivos subidos
│
├─ deploy/ # Infraestructura y dependencias
│ ├─ Dockerfile # Imagen backend
│ ├─ docker-compose.yml # Orquestación local (API + DB)
│ └─ requirements.txt # Dependencias Python
│
├─ .env # Variables de entorno
├─ alembic.ini # Config Alembic
├─ test_bdd.py # Tests básicos
└─ README.md # Este archivo
```
---
## Variables de entorno

### Crear el archivo `backend/.env` con las siguientes variables:

```env
# CORS
CORS_ORIGINS = ["http://localhost:5173", etc]
ALLOW_ORIGIN_REGEX = ^https:\/\/capstone-[a-z0-9-]+-haiiro1s-projects\.vercel\.app$

# Model Params
MAX_IMAGE_MB = 10
MIN_IMAGE_PX = 256
MODEL_VERSION = v0.1.0

# DB (docker y remota)
POSTGRES_DB = [DB name]
POSTGRES_USER = [DB user]
POSTGRES_PASSWORD = [DB password]
DATABASE_URL = [remote DB URL]

# Weather y Google Maps API
OPENWEATHER_URL = "https://api.openweathermap.org/data/2.5/weather"
OPENWEATHER_URL_FORECAST = "https://api.openweathermap.org/data/2.5/forecast"
GEOCODE_URL = "https://maps.googleapis.com/maps/api/geocode/json"
GOOGLE_MAPS_API_KEY = [key]
WEATHER_API_KEY = [key]

# Media
MEDIA_DIR = storage/uploads
MEDIA_URL_PREFIX = /media

# Cookie
SECRET_KEY = super-super-secret
ALGORITHM = HS256
ACCESS_TOKEN_EXPIRE_MINUTES = 1440

# SMTP
ITDS_SECRET_KEY = [key]
MAIL_FROM = [the e-mail that will be sending the automatic mails]
MAIL_PASSWORD = [SMTP user password]
MAIL_PORT = [SMTP Port, 465/587/2525/etc]
MAIL_SERVER = [SMTP server url]
MAIL_USERNAME = [SMTP user]

# Misc
FRONTEND_BASE_URL = [URL to frontend, "https://capstone-nu-cyan.vercel.app"/"http://localhost:5173", etc] # cannot be an array, must be a singular value/link
VITE_FRONTEND_URL = [URL to frontend, "https://capstone-nu-cyan.vercel.app"/"http://localhost:5173", etc] # cannot be an array, must be a singular value/link

```

---

## Ejecución local

### Con Docker (recomendado)

Los archivos de despliegue están en backend/deploy/.

Ejemplo de docker-compose.yml:

```
version: "3.9"

services:
  db:
    image: postgres:16-alpine
    container_name: plantguard_db
    restart: always
    environment:
      POSTGRES_DB: plantguard
      POSTGRES_USER: plantguard
      POSTGRES_PASSWORD: plantguard
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  api:
    build:
      context: ..
      dockerfile: deploy/Dockerfile
    container_name: plantguard_api
    restart: always
    depends_on:
      - db
    env_file:
      - ../.env
    volumes:
      - ../storage/uploads:/app/storage/uploads
    ports:
      - "8000:8000"
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

volumes:
  pgdata:
```
Para levantar todo:
```
cd backend/deploy
docker compose up --build
```

- API disponible en: http://localhost:8000

- Documentación interactiva: http://localhost:8000/docs

### Sin Docker (entorno virtual)

```
cd backend/deploy
pip install -r requirements.txt

cd ..
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Migraciones (Alembic)

```
cd backend
alembic revision --autogenerate -m "init tables"
alembic upgrade head
```

---

## Despliegue en Producción
### Base de datos — Neon

- Crear proyecto y base (ejemplo: PlantGuard_DB).

- Usar el connection pooler con SSL requerido.

- Guardar la cadena DATABASE_URL en las variables de entorno de Render.

### Backend — Render (FastAPI)

- Root del servicio: backend/

- Build Command:
```
pip install -r deploy/requirements.txt
```

- Start Command:

```
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

### Variables de entorno


### Frontend — Vercel (React/Vite)

- En Vercel → Project → Settings → Environment Variables:
```
VITE_API_URL = https://<tu-servicio-en-render>.onrender.com/api
VITE_APP_NAME = PlantGuard
VITE_GOOGLE_API_KEY = [key]
```

---

## Endpoints

#### Debug
- `GET /db-check`

- `GET /api/ping`

- `POST /api/debug/trigger-expiry-check`

#### Plant
- `POST /api/plant/predict`

- `GET /api/plant/predict/history`

- `GET /api/plant/predict/summary`

#### Weather
- `GET /api/alerts/weather/now`

- `GET /api/alerts/weather/forecast`

- `GET /api/alerts/events`

#### Auth
- `POST /api/auth/register`

- `GET /api/auth/verify`

- `POST /api/auth/verify/resend`

- `POST /api/auth/login`

- `POST /api/auth/refresh`

- `POST /api/auth/logout`

- `GET /api/auth/me`

- `POST /api/auth/password/reset/init`

- `POST /api/auth/password/reset/confirm`

#### Users
- `PATCH /api/users/me`

- `PATCH /api/users/me/theme`

- `POST /api/users/me/avatar`

- `GET /api/users/me/prefs`

- `PUT /api/users/me/prefs`

- `PATCH /api/users/me/prefs`

#### Payment
- `POST /api/transaction/start`

- `GET /api/transaction/return/{order_id}`

- `GET /api/transaction/status/{order_id}`

#### Subscription
- `GET /api/subscription/status`

---
## Documentación - Endpoints

### Weather
Dentro de esta sección tenemos 3 endpoints, empezando por:

`GET /api/alerts/weather/now?address=`

Tomando el parametro '*address*', con este endpoint podemos conseguir la predicción del tiempo actual dependiendo de la dirección que se haya ingresado.

Hacemos uso de Geocoding API y Place Autocomplete API de Google Maps Platform. Una vez que el usuario ingresa su dirección, esta se convierte a latitud y longitud con Geocoding API, lo cual se pasa a la Current Weather Data API de OWM, ya que esta requiere lat/lon para poder entregar su predicción del tiempo, y esta finalmente nos entrega la temperatura actual de la dirección ingresada.

`GET /api/alerts/weather/forecast?address=`

Similar a `/now`, toma el parametro de 'address', y lo utiliza para conseguir un pronostico de 4 dias (contando el actual).

Lamentablemente por la manera en que OWM entrega estos datos (en bloques de 3 horas), los resultados no son 100% precisos, teniendo una ligera variación cuando se compara con pronosticos de otros servicios, como Google Weather.


`GET /api/alerts/events?address=`

Este endpoint hace uso del forecast entregado por `/forecast`, por lo que toma el mismo parametro de 'address', con el cual entrega a el usuario una lista de las alertas detectadas dentro de los 4 dias, esto dependiendo de las user_weather_prefs del mismo usuario.

### Subscription
En esta sección podremos ver el unico endpoint directamente asociado a la tabla de *Subscription*:

`GET /api/subscription/status`

Toma el usuario actual como parametro (automaticamente) para poder devolver si es que tipo de plan tiene el usuario, como tambien si es que esta activo actualmente o cuando este expiraria. En caso de que el usuario no tenga un Subscription object linked (ya que nunca se ha suscrito a PlantGuard Premium), se crea una default response que indica que este usuario tiene un plan 'Free'.
##### Response Example
```
{
  "plan_name": "string",
  "is_active": true,
  "expiry_date": "string"
}
```

------
### Plant
En esta sección veremos de manera más profunda los endpoints relacionados con el modelo de predicción, y la manera en que utilizamos los datos entregados por este modelo.

`POST /api/plant/predict`

El endpoint principal de esta sección, permite a el usuario acceder a nuestro modelo de predicción de enfermedades.

Tomando como parametro '*file*', la cual tiene que ser una imagen. Utilizando esto, se realiza una call hacia el modelo (esta hosteado en una url diferente a el resto de la API) para poder realizar la predicción, y una vez recibido el JSON que el modelo entrega, se realiza un procesamiento de estos datos para poder ser utilizados por Front End.

A su vez, tambien se guardan los datos relevantes de este JSON como un PredicitionRecord, el cual quedara asociado al usuario.

Algo a considerar con este endpoint, es que los usuarios que no son parte del plan 'PlantGuard Premium' solo pueden hacer uso de este modelo 5 veces al dia antes de ser rate-limited.

#### Example response
```
{
  "model_version": "string",
  "top_k": 0, // cantidad de predicciones
  "lang": "string",
  "date_created": "2025-11-24T20:25:55.880Z",
  "predictions": [
    {
      "title": "string",
      "severity": "string",
      "advice": [
        "string"
      ],
      "probability": 1
    }
  ],
  "disclaimer": "string"
}
```
`GET /api/plant/predict/history`

Este endpoint toma el usuario actual, y devuelve todos los registros de predicciónes que  asociados al usuario y los ordena de manera descendente por su fecha de creación.

##### Example response
```
[
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "date_created": "2025-11-24T20:18:20.760Z",
    "title": "string",
    "probability": 0,
    "severity": "string",
    "advice": []
  }
]
```
`GET /api/plant/predict/summary`

Tomando el usuario actual de manera automatica como parametro, este endpoint entrega un resumen del historial de analisis que ha realizado el usuario. Esto es utilizado para la dashboard en `/home`.

##### Example response
```
{
  "last_analysis": "string",
  "last_title": "string",
  "last_probability": 0,
  "total_count": 0,
  "healthy_count": 0,
  "diseased_count": 0,
  "avg_confidence": 0,
  "healthy_pct": 0,
  "diseased_pct": 0
}
```
------
### Users
`PATCH /api/users/me`

Este endpoint permite actualizar parcialmente el perfil del usuario autenticado.
Toma el *current_user* desde el token JWT y recibe un cuerpo JSON con los campos que se quieran modificar.

Campos soportados (todos opcionales):
```json
{
  "company": "string",
  "location": "string",
  "crops": ["tomate", "arándano"],
  "theme": "light | dark | system"
}

```

- Solo se actualizan los campos presentes en el payload.

- El email y el id no pueden cambiarse desde este endpoint.

- Devuelve el usuario actualizado en el mismo schema que GET /api/auth/me.

```json

{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "email": "user@example.com",
  "first_name": "Sofía",
  "last_name": "Alfaro",
  "theme": "dark",
  "company": "Mi campo",
  "location": "Santiago, Chile",
  "crops": ["tomate", "frutilla"],
  "avatar_url": "/media/avatars/uuid.png"
}

```

`PATCH /api/users/me/theme`

Este endpoint toma 'theme' como parametro, esto para configurar el tipo de paleta de colores que el usuario requiera.

`POST /api/users/me/avatar`

Este endpoint permite subir o actualizar el avatar del usuario.

- Método: `multipart/form-data`
- Parámetro: `file` (imagen)
- Requiere autenticación (JWT)

#### Validaciones
- Solo se aceptan archivos de tipo imagen (jpg, jpeg, png, webp, etc.)
- El tamaño máximo permitido está definido por la variable de entorno `MAX_IMAGE_MB`
  **Por defecto: 10 MB**
- El archivo se guarda temporalmente en `MEDIA_DIR` (`storage/uploads/avatars/`)

#### Importante (NeonDB — plan gratuito)
La base de datos Neon en su plan gratuito **purga los archivos temporales en ~5 minutos**, por lo tanto:

- El archivo del avatar **solo se mantiene aprox. 5 minutos** accesible desde la URL.
- Después de ese tiempo, la entrada `avatar_url` sigue existiendo en la base de datos,
  **pero el archivo ya no está disponible** en el storage remoto.
- La URL queda como referencia, pero ya no apunta a un archivo real.

##### Flujo
1. El backend valida el archivo y su tamaño.
2. Guarda la imagen en `MEDIA_DIR` con un nombre único (UUID).
3. Actualiza `avatar_url` del usuario con `/media/avatars/<archivo>.png`.
4. Devuelve el perfil del usuario con la nueva URL.

###### Example response
```json
"id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
"email": "user@example.com",
"first_name": "Sofía",
"last_name": "Alfaro",
"theme": "dark",
"company": "Mi campo",
"location": "Santiago, Chile",
"crops": ["tomate"],
"avatar_url": "/media/avatars/3fa85f64-5717-4562-b3fc-2c963f66afa6.png"
```

`GET /api/users/me/prefs`

Tomando a el usuario actual como parametro, este endpoint devuelve las 'user_weather_prefs' del usuario.

##### Example response
```
{
  "dangerous_frost_threshold": 1,
  "dangerous_temp_threshold": 32,
  "rain_mm_threshold": 2,
  "wind_kph_threshold": 40,
  "user_id": "string"
}
```
`PUT /api/users/me/prefs` |
`PATCH /api/users/me/prefs`

Continuando con los endpoints relacionadas a las 'user_weather_prefs', estos dos endpoints reciben las nuevas user_weather_prefs que el usuario quiera cambiar, ya sea todas (PUT) o de manera parcial (PATCH), y devuelve las nuevas reglas como response.

#### Example response
```
{
  "dangerous_frost_threshold": 0,
  "dangerous_temp_threshold": 12,
  "rain_mm_threshold": 1,
  "wind_kph_threshold": 20,
  "user_id": "string"
}
```
------
### Payment
`POST /api/transaction/start`

Este endpoint se encarga de iniciar el proceso de pago para las subscripciones de PlantGuard Premium. Como parametro toma a el usuario de manera automatica por *current_user*.

Primero que todo, se realizara una verificación en caso de que el usuario *ya* este suscrito, para evitar que usuarios que ya tengan una subscripción puedan comprar *otra*, asi evitando problemas con la fecha que exista en expiry_date (la fecha en la que la subscripción expiraria).

Tambien se verifica que no exista una PurchaseOrder que tenga un estado como 'pending', y el caso de que exista, esta se asigna como 'expired' y se continua el proceso.

No podemos reusar los tokens entregados por TBK para entrar a el portal, debido a que estos son '*single-use tokens*', y no se pueden reutilizar.

Luego de pasar por estos *checks*, se creara la PurchaseOrder con un estado de '*pending*', y se crea el *'payment_url*', juntado el URL y el token entregado por TBK.

Como response, esta API devuelve los datos entregados por TBK, payment_url y token.

##### Example response
```
{
  "payment_url": "string",
  "token": "string"
}
```

`GET /api/transaction/return/{order_id}`

Continuando el proceso de pago iniciado en el endpoint `/transaction/start`, ahora pasaremos a la verificación del pago y la actualización de la PurchaseOrder dependiendo del resultado de esto.

Toma como parametros order_id como obligatorio, token_ws y TBK_TOKEN como opcional dependiendo de lo que devuelva Webpay.

Se verifica inicialmente que la orden exista, y se devuelve la url hacia `.../membresia/estado?status=`, con el status como *failed*.

Luego de este check simple, pasamos a verificar los tokens entregados a la hora de retornar por el portal de pago, pasando a el usuario a el mismo URL indicando anteriormente entregado, junto con el estado (ya sea *failed* en caso de no ser validos) y su order_id, formado el 'url' como `.../membresia/estado?status=&order_id=`.

En caso del token ser valido, pasamos hacer un check simple en caso de que el PurchaseOrder.status no sea 'pending' o 'processing', lo cual retornara un 'url' con el status de la orden, y su id correspondiente.

Y finalmente, en caso de que se pasen todas verificaciones, se pasa a activar la subscripción del usuario, asociando un Subscription object a el usuario y enviando un e-mail a el usuario indicando que su subscripción esta activa hasta una fecha especifica (30 dias desde la subscripción a esta).

En el caso de que tenga una subscripcion como expirada, se pone como activa y se extiende su expiry_date.

En todos estos casos, se devuelve el usuario el url correspondiente por RedirectResponse.

`GET /api/transaction/status/{order_id}`

Tomara la order_id como parametro de manera automatica, ya que se toma a el current_user y se realiza una query de la PurchaseOrder más reciente.

Como response, este endpoint devolvera el estado actual de la orden indicada, como tambien el metadata que TBK entrega.

En este endpoint tambien se realiza un check en caso de que el pago se haya concretado, y se realiza el cambio de status de la orden a 'AUTHORIZED' si es que esta se detecta como pagada por TBK.

##### Example response
```
{
  "status": str,
  "metadata": JSONB
}
```

------
#### Auth
`POST /api/auth/register`

En este endpoint el usuario puede iniciar su proceso de registro, tomando como parametros;
```
{
  "email": "user@example.com",
  "password": "string",
  "first_name": "string",
  "last_name": "string"
}
```
Utilizando estos datos, el endpoint los guarda de manera temporal y envia un mail al usuario, donde este podra realizar el proceso de validación de su cuenta, a traves del endpoint `/verify`.

Como response, simplemente se le indica a el usuario que recibira un mail en breve para continuar con su proceso de registro.

```
{"message": "Recibiras un correo de validación en breve."}
```

`GET /api/auth/verify`

Continuando el proceso de registro, este endpoint toma el token que `/register` envia al usuario a su e-mail correspondiente, y verifica que este sea valido.

Si es que la cuenta ya se encuentra validada, se para el proceso y se devuelve un mensaje indicando que el usuario ya esta validado.

En caso de que el token no exista, o que sea invalido, el proceso de creación de cuenta se cancela, y se devuelve una 400 HTTP Exception junto con el error que se encontro.

Una vez confirmado el token como valido, el proceso de registro se finaliza y la cuenta finalmente se crea en la DB. Se devuelve un mensaje como response donde se indica que la cuenta fue validada.

`POST /api/auth/verify/resend`

En caso de que el token fuera invalido durante `/verify`, el usuario puede acceder a este endpoint si desea, donde se toma el mail del usuario como parametro para nuevamente enviar un mail de validación, donde se encontrara un nuevo token que el usuario podra utilizar en `/verify` nuevamente.

Como response, simplemente se devuelve un mensaje generico que indica que se recibira un mail nuevamente.
##### Example response
```
{
  "message": "Recibirás un correo de verificación en breve. Revisa tu carpeta de SPAM en caso de no encontrarlo en tu inbox."
}
```

`POST /api/auth/login`

Endpoint para iniciar sesión y obtener tokens JWT.

- Método: POST

- Cuerpo esperado (JSON):

```json
{
  "email": "user@example.com",
  "password": "string"
}
```

Flujo general:

1. Busca al usuario por email.

2. Verifica la contraseña usando el sistema de hashing definido en core/security.py.

3. Verifica que la cuenta esté verificada/activa.

4. Genera un access token (JWT de corta duración) y un refresh token (mayor duración).

5. Devuelve el token de acceso y la información básica del usuario.
Dependiendo de la implementación, el refresh token puede devolverse en el cuerpo o setearse como cookie HTTP-only.

Este access token se utiliza luego en los headers como:
```
Authorization: Bearer <access_token>
```
para acceder a los endpoints protegidos.

##### Example response

```json
{
  "access_token": "jwt-access-token",
  "token_type": "bearer",
  "user": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "email": "user@example.com",
    "first_name": "Sofía",
    "last_name": "Alfaro",
    "theme": "dark",
    "company": "Mi campo",
    "location": "Santiago, Chile",
    "crops": ["tomate"],
    "avatar_url": "/media/avatars/uuid.png"
}
```

`POST /api/auth/refresh`

Permite obtener un nuevo access token a partir de un refresh token válido.

- El refresh token se obtiene en el login (ya sea por cookie o en el body, según la implementación concreta).

- El endpoint valida que el refresh token:

  - No esté expirado.

  - No haya sido invalidado/revocado.

- Si es válido, genera un nuevo access token y lo devuelve al usuario.

#### example response

```json
{
  "access_token": "nuevo-jwt-access-token",
  "token_type": "bearer"
}
```

Sirve para mantener la sesión del usuario sin pedirle credenciales nuevamente mientras el refresh token siga siendo válido.

`POST /api/auth/logout`

Endpoint para cerrar sesión de forma explícita.

Flujo general:

1. Toma el usuario autenticado y/o el refresh token asociado.

2. Marca el refresh token como inválido o lo elimina del almacenamiento donde se lleve el registro (si aplica).

3. En caso de usar cookies, limpia la cookie de refresh en la respuesta.

4. Devuelve un mensaje confirmando el cierre de sesión.

#### Example response

```json
{
  "message": "Sesión cerrada correctamente."
}
```

Tras llamar a este endpoint, el usuario debe volver a loguearse para obtener nuevos tokens.

`GET /api/auth/me`

Tomando el usuario actual de manera automatica, este endpoint devuelve todos los datos de aquel usuario.

`POST /api/auth/password/reset/init`

Similar al proceso de validación de cuenta, en este endpoint se puede inciar el proceso de cambio de contraseña.

Se toma el mail ingresado por el usuario como parametro, y se envia un mail para realizar este proceso, pero solo si el usuario *si existe*, en caso de que no, no se envia el mail.

En ambos casos se devolvera un mensaje generico como response, donde se indica que *si* la cuenta existe, se enviara un e-mail.

```
{
  "message": "Si corresponde, recibirás un correo para restablecer tu contraseña."
}
```

`POST /api/auth/password/reset/confirm`

Continuando el proceso de `/password/reset/init`, este endpoint tomara el token que el user recibio en su correo, y le permitara pasar a un formulario donde podra realizar su cambio de contraseña.


En caso de que el token este expirado o invalido, no se realiza ningun cambio y se devuelve un 400 HTTP Exception junto a el codigo del error  que se causo.
#### Example response
```
{"message": "updated_password"}
```
------
#### Debug
Aqui podemos ver algunos endpoints que utilizamos para verificar si es que ciertas funciones estan activas/funcionando de manera correcta.

`GET /db-check`

Con este endpoint, podemos ver si es que la DB esta funcionando de manera correcta.

`GET /api/ping`

Este endpoint es usado simplemente para verificar si es que la API esta activa o no.

`POST /api/debug/trigger-expiry-check`

Con este endpoint podemos activar de manera manual, una 'background task' que normalmente corre de manera automatica cada hora.
El punto de esta función es realizar un chequeo del estado de las subscripciones, verificando que estas no esten expiradas, y si es que fueran a estarlo, a asignarlas como '*is_active=False*' y enviar un mail al usuario afectado para informarles sobre el estado de su subscripción.

------
## Licencia