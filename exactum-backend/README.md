# Exactum Backend

API REST de **Exactum** (finanzas personales y de emprendimiento) construida con **Node.js**, **Express** y **Sequelize** (ORM) sobre **SQL Server**.

Gestiona tres recursos: **usuarios**, **movimientos** (ingresos y gastos) y **presupuestos**.

## Tecnologías

| Tecnología | Uso |
|---|---|
| Node.js + Express 4 | Servidor y rutas |
| Sequelize 6 + tedious | ORM y conexión a SQL Server |
| bcryptjs | Cifrado de contraseñas |
| cors, morgan, dotenv | CORS, logs de peticiones y variables de entorno |

## Estructura del proyecto

```
exactum-backend/
├── src/
│   ├── config/db.js              # Conexión a SQL Server (Sequelize)
│   ├── models/                   # Modelos y relaciones (Usuario, Movimiento, Presupuesto)
│   ├── services/                 # Lógica de negocio y acceso a datos
│   ├── controllers/              # Reciben la petición y responden
│   ├── routes/                   # Definición de endpoints
│   ├── middlewares/              # Validaciones y manejo de errores
│   ├── utils/                    # AppError, asyncHandler, generador de ids
│   ├── app.js                    # Configuración de Express
│   └── server.js                 # Arranque: conecta a la BD y levanta el servidor
├── postman/                      # Colección de Postman con pruebas
├── .env
└── package.json
```

Flujo de una petición: `routes → middlewares (validación) → controllers → services → models → SQL Server`.

## Requisitos

- Node.js 18 o superior
- SQL Server (con TCP/IP habilitado en el puerto 1433 y autenticación mixta)

## Instalación y ejecución

**1. Crear la base de datos** (en SSMS, con autenticación de Windows):

```sql
CREATE DATABASE ExactumAPI;
GO
USE ExactumAPI;
GO
CREATE USER node_user FOR LOGIN node_user;
ALTER ROLE db_owner ADD MEMBER node_user;
```

> Las tablas las crea Sequelize automáticamente al iniciar el servidor.

**2. Instalar dependencias**

```bash
npm install
```

**3. Configurar variables de entorno**: copialo `.env` completa la contraseña.

```env
PORT=3000
DB_HOST=localhost
DB_PORT=1433
DB_NAME=ExactumAPI
DB_USER=node_user
DB_PASSWORD=tu_contraseña
```

**4. Iniciar el servidor**

```bash
npm start        # producción
npm run dev      # desarrollo (reinicia al guardar cambios)
```

Debe mostrar:

```
Conexión a SQL Server establecida
Tablas sincronizadas
API de Exactum escuchando en http://localhost:3000
```

## Modelo de datos

```
usuarios (id, name, email*, password, createdAt, updatedAt)
   │ 1
   ├──< movimientos  (id, type, date, description, value, category, space, userId, ...)
   └──< presupuestos (id, name, limite, category, startDate, endDate, space, userId, ...)
```

Si se elimina un usuario, se eliminan en cascada sus movimientos y presupuestos. `*` = único.

## Endpoints

URL base: `http://localhost:3000`

### Usuarios

| Método | Ruta | Descripción | Éxito |
|---|---|---|---|
| GET | `/usuarios` | Listar usuarios | 200 |
| GET | `/usuarios/:id` | Obtener un usuario | 200 |
| POST | `/usuarios` | Registrar usuario | 201 |
| POST | `/usuarios/login` | Iniciar sesión | 200 |
| PUT | `/usuarios/:id` | Reemplazar datos (todos los campos) | 200 |
| PATCH | `/usuarios/:id` | Actualizar parcialmente | 200 |
| DELETE | `/usuarios/:id` | Eliminar usuario y sus datos | 204 |

### Movimientos

| Método | Ruta | Descripción | Éxito |
|---|---|---|---|
| GET | `/movimientos` | Listar. Filtros: `userId`, `space`, `type`, `category` | 200 |
| GET | `/movimientos/:id` | Obtener uno | 200 |
| POST | `/movimientos` | Crear | 201 |
| PUT | `/movimientos/:id` | Reemplazar (todos los campos menos `userId`) | 200 |
| PATCH | `/movimientos/:id` | Actualizar parcialmente | 200 |
| DELETE | `/movimientos/:id` | Eliminar | 204 |

### Presupuestos

| Método | Ruta | Descripción | Éxito |
|---|---|---|---|
| GET | `/presupuestos` | Listar. Filtros: `userId`, `space`, `category` | 200 |
| GET | `/presupuestos/:id` | Obtener uno | 200 |
| POST | `/presupuestos` | Crear | 201 |
| PUT | `/presupuestos/:id` | Reemplazar (todos los campos menos `userId`) | 200 |
| PATCH | `/presupuestos/:id` | Actualizar parcialmente | 200 |
| DELETE | `/presupuestos/:id` | Eliminar | 204 |

### Otros

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/health` | Verifica que la API está funcionando |

## Reglas de validación

| Recurso | Campo | Regla |
|---|---|---|
| Usuario | `name` | Texto, 2 a 100 caracteres |
| Usuario | `email` | Correo válido, único |
| Usuario | `password` | Texto, mínimo 6 caracteres |
| Movimiento | `type` | `Ingreso` o `Gasto` |
| Movimiento | `date` | Fecha `YYYY-MM-DD` válida |
| Movimiento | `value` | Número mayor que 0 |
| Movimiento | `category` | Texto, obligatorio |
| Movimiento | `space` | `Personal` o `Emprendimiento` |
| Movimiento | `description` | Texto opcional, máx. 255 |
| Movimiento | `userId` | Id de un usuario existente |
| Presupuesto | `name`, `category` | Texto, obligatorios |
| Presupuesto | `limit` | Número mayor que 0 |
| Presupuesto | `startDate`, `endDate` | Fechas `YYYY-MM-DD`; la final no puede ser anterior a la inicial |
| Presupuesto | `space`, `userId` | Igual que en movimientos |

Los campos no definidos (por ejemplo `id`) se ignoran. La contraseña nunca se devuelve en las respuestas.

## Ejemplos

### Registrar usuario

`POST /usuarios`

```json
{ "name": "Santiago Henao", "email": "santiago@mail.com", "password": "secreto1" }
```

Respuesta `201 Created`:

```json
{
  "id": "krrtG11FFZ8",
  "name": "Santiago Henao",
  "email": "santiago@mail.com",
  "createdAt": "2026-10-24T23:00:00.000Z",
  "updatedAt": "2026-10-24T23:00:00.000Z"
}
```

### Iniciar sesión

`POST /usuarios/login`

```json
{ "email": "santiago@mail.com", "password": "secreto1" }
```

Respuesta `200 OK`: el usuario (sin contraseña). Con credenciales incorrectas responde `401`.

### Crear movimiento

`POST /movimientos`

```json
{
  "type": "Ingreso",
  "date": "2026-10-20",
  "description": "Venta",
  "value": 150000,
  "category": "Alimentación",
  "space": "Personal",
  "userId": "krrtG11FFZ8"
}
```

Respuesta `201 Created`:

```json
{
  "id": "WQsIFsEZgU4",
  "type": "Ingreso",
  "date": "2026-10-20",
  "description": "Venta",
  "value": 150000,
  "category": "Alimentación",
  "space": "Personal",
  "userId": "krrtG11FFZ8"
}
```

### Listar movimientos de un usuario

`GET /movimientos?userId=krrtG11FFZ8`

### Actualizar parcialmente

`PATCH /movimientos/WQsIFsEZgU4`

```json
{ "value": 175000 }
```

### Crear presupuesto

`POST /presupuestos`

```json
{
  "name": "Presupuesto octubre",
  "limit": 300000,
  "category": "Alimentación",
  "startDate": "2026-10-01",
  "endDate": "2026-10-31",
  "space": "Personal",
  "userId": "krrtG11FFZ8"
}
```

### Eliminar

`DELETE /movimientos/WQsIFsEZgU4` → `204 No Content` (sin cuerpo).

## Manejo de errores

Todos los errores tienen el mismo formato:

```json
{
  "status": "error",
  "message": "Datos inválidos",
  "details": ["El campo \"value\" debe ser mayor que 0"]
}
```

| Código | Cuándo ocurre |
|---|---|
| 400 | Datos inválidos, JSON malformado, `userId` inexistente, fechas incoherentes |
| 401 | Credenciales incorrectas en el login |
| 404 | Recurso o ruta inexistente |
| 409 | Correo ya registrado |
| 500 | Error interno del servidor |

## Pruebas con Postman

1. Abre Postman → **Import** → selecciona `postman/Exactum-API.postman_collection.json`.
2. Con el servidor corriendo, abre la colección → **Run collection** → **Run Exactum API**.
3. Se ejecutan 28 peticiones en orden (usuarios, movimientos, presupuestos, errores) con 37 verificaciones automáticas. Las pruebas crean un usuario temporal y lo eliminan al final.

Las capturas del resultado sirven como evidencia de las pruebas.

## Conexión con el frontend

El backend usa el puerto **3000** y las mismas rutas que el frontend consumía antes con json-server (`/usuarios`, `/movimientos`, `/presupuestos`).

Las contraseñas se guardan cifradas y la API no las devuelve, por eso el login del frontend (`loginUser` en `src/services/authService.js`) valida las credenciales en el backend con `POST /usuarios/login`.

## Autores

Proyecto Exactum, Equipo 02 — Tecnológico de Antioquia.
