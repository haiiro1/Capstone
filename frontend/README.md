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
VITE_GOOGLE_API_KEY=[KEY]
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
frontend
├─ public
│  └─ vite.svg
├─ src
│  ├─ api
│  │  └─ weatherPrefs.ts
│  ├─ assets
│  │  └─ react.svg
│  ├─ components
│  │  ├─ AuthPanel.tsx
│  │  ├─ Footer.tsx
│  │  ├─ GoogleMaps.tsx
│  │  ├─ MainContent.tsx
│  │  ├─ Navbar.tsx
│  │  ├─ ThemeToggleSwitch.tsx
│  │  └─ WeatherPrefs.tsx
│  ├─ contexts
│  │  ├─ LocationContext.tsx
│  │  └─ ThemeProvider.tsx
│  ├─ hooks
│  │  ├─ usePredictSummary.ts
│  │  └─ userWeatherAlerts.ts
│  ├─ Layouts
│  │  ├─ AuthLayout.tsx
│  │  ├─ MainLayout.tsx
│  │  └─ SimpleLayout.tsx
│  ├─ lib
│  │  ├─ AuthContext.tsx
│  │  ├─ api.ts
│  │  ├─ plantPredict.ts
│  │  ├─ predictHistory.ts
│  │  └─ predictSummary.ts
│  ├─ pages
│  │  ├─ Alerts.tsx
│  │  ├─ Analytics.tsx
│  │  ├─ Auth
│  │  │  ├─ ForgotPassword.tsx
│  │  │  ├─ Login.tsx
│  │  │  ├─ ReVerify.tsx
│  │  │  ├─ Register.tsx
│  │  │  ├─ ResetPassword.tsx
│  │  │  └─ Verify.tsx
│  │  ├─ ConfirmarMembresia.tsx
│  │  ├─ Faq.tsx
│  │  ├─ Help.tsx
│  │  ├─ History.tsx
│  │  ├─ Home.tsx
│  │  ├─ Membresia.tsx
│  │  ├─ MembresiaEstado.tsx
│  │  ├─ Privacy.tsx
│  │  ├─ Profile.tsx
│  │  ├─ Terms.tsx
│  │  └─ Upload.tsx
│  ├─ types
│  │  └─ weather.ts
│  ├─ utils
│  │  ├─ GoogleMaps.ts
│  │  └─ names.ts
│  ├─ validation
│  │  ├─ password.ts
│  │  └─ userSchemas.ts
│  ├─ App.css
│  ├─ App.tsx
│  ├─ index.css
│  ├─ main.tsx
│  └─ vite-env.d.ts
├─ README.md
├─ eslint.config.js
├─ index.html
├─ package-lock.json
├─ package.json
├─ tsconfig.app.json
├─ tsconfig.json
├─ tsconfig.node.json
├─ vercel.json
└─ vite.config.ts
```

## Integración con el backend
- `VITE_API_URL` debe apuntar a tu API (por defecto `http://localhost:8000`)

- Para despliegue, cambia `VITE_API_URL` a la URL pública del backend.
## Problemas comunes
- Variables `.env` no cargan: reinicia `npm run dev` y confirma el prefijo `VITE_`.

- CORS: habilita `http://localhost:5173` en el backend (`CORS_ORIGINS`).

- Puerto ocupado: ejecuta `npm run dev -- --port 5174` o libera el 5173.

## Rutas
### Auth
- `/register`
- `/forgot-password`
- `/reset-password`
- `/verify`
- `/verify/resend`

### Paginas principales
- `/` (Login/Home)
- `/home`
- `/analizar`
- `/historial`
- `/alertas`
- `/perfil`

### Membresía
- `/membresia`
- `/membresia/confirmar`
- `/membresia/estado`
