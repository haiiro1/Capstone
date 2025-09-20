# PlantGuard - Frontend (React + TSX + Vite)

### Frontend de PlantGuard desarrollado con React y TypeScript (TSX) usando Vite. Este proyecto no usa Docker en frontend; se ejecuta localmente con Node.js.

## Requisitos

- Node.js 18+

- npm (o yarn/pnpm)

## Variables de entorno

### Crear frontend/.env con:

```
VITE_API_URL=http://localhost:8000
VITE_APP_NAME=PlantGuard
```
 En Vite, las variables deben comenzar con VITE_ para estar disponibles en el cliente.

## Ejecución local

### Instalar dependencias:
```
cd frontend
npm install
```
### Desarrollo (hot reload):
```
npm run dev
```
### Aplicación en:
```
http://localhost:5173
```
### Build de producción:
```
npm run build
```
### Previsualizar build localmente:
```
npm run preview
```

## Scripts (package.json)

### Asegúrate de tener:
```
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview --host 0.0.0.0 --port 4173"
  }
}
```

## Estructura del proyecto

```
frontend/
├─ public/
├─ src/
│  ├─ assets/
│  │  └─ react.svg
│  ├─ components/
│  │  ├─ AuthPanel.tsx
│  │  ├─ Footer.tsx
│  │  ├─ MainContent.tsx
│  │  └─ NavBars.tsx
│  ├─ Layouts/
│  │  ├─ AuthLayout.tsx
│  │  └─ MainLayout.tsx
│  ├─ lib/
│  │  ├─ api.ts
│  │  └─ AuthContext.tsx
│  ├─ pages/
│  │  ├─ Auth/
│  │  ├─ Alerts.tsx
│  │  ├─ Analytics.tsx
│  │  ├─ History.tsx
│  │  ├─ Home.tsx
│  │  ├─ Profile.tsx
│  │  └─ Upload.tsx
│  ├─ utils/
│  │  └─ names.ts
│  └─ validation/
│     └─ userSchemas.ts
├─ App.tsx
├─ App.css
├─ index.css
├─ main.tsx
├─ vite-env.d.ts
├─ index.html
├─ package.json
├─ tsconfig.json
├─ tsconfig.app.json
├─ tsconfig.node.json
└─ vite.config.ts
```

## Integración con el backend
- `VITE_API_URL` debe apuntar a tu API (por defecto `http://localhost:8000`)

- Para despliegue, cambia `VITE_API_URL` a la URL pública del backend.
## Problemas comunes
- Variables `.env` no cargan: reinicia `npm run dev` y confirma el prefijo `VITE_`.

- CORS: habilita `http://localhost:5173` en el backend (`CORS_ORIGINS`).

- Puerto ocupado: ejecuta `npm run dev -- --port 5174` o libera el 5173.

## Rutas principales
- `/` → Dashboard/Home

- `/login` y `/register` (dentro de `pages/Auth/`)

- `/alerts`, `/analytics`, `/history`, `/profile`, `/upload`

