# ReservaFlow — despliegue del frontend en Vercel

## 1. Antes de subir
- Proyecto: React + Vite + TypeScript. **Vercel aloja el frontend, no las API Spring Boot**.
- No subir `node_modules`, `dist`, `.env.local`, credenciales ni tokens.
- Ejecutar en VS Code: `npm ci` y `npm run build`. Opcional: `npm run lint`.
- Para probar localmente: copiar `.env.example` a `.env.local` y ajustar URLs.

## 2. Subir a GitHub
Desde la carpeta `frontend-reservas`, crear un repositorio Git y subir el código (sin `node_modules` ni `.env.local`). Si ya hay repositorio, crear una rama y hacer pull request.

## 3. Importar en Vercel
1. Entrar a https://vercel.com/new y conectar GitHub.
2. Importar el repositorio del frontend.
3. Framework Preset: **Vite**; Root Directory: carpeta que contiene `package.json` (si el repo contiene solo el frontend, usar `./`).
4. Build Command: `npm run build`; Output Directory: `dist`.
5. Agregar variables de entorno en Project Settings > Environment Variables:
   - `VITE_AUTH_URL`: URL pública HTTPS de WebAuth, sin barra final.
   - `VITE_MASTERS_URL`: URL pública HTTPS de Masters, sin barra final.
   - `VITE_BUSINESS_URL`: URL pública HTTPS de Business, sin barra final.
   - `VITE_MODO_DEMO`: `true` mientras se muestra la demo, `false` al conectar las API reales.
6. Deploy. Después de cambiar variables, hacer **Redeploy**: Vite las inserta durante la compilación.

## 4. Si las API aún no están desplegadas
- Se puede publicar el frontend con `VITE_MODO_DEMO=true` para las pantallas que ya implementan simulación.
- Login y Registro **no tienen simulación real de autenticación**; requieren API accesibles. La consola puede servir para pruebas de UI, no para autenticación.
- No usar `http://localhost:8081` / `8082` / `8083` como URLs de producción: en un visitante apuntarían a su propia computadora.
- Evitar URLs HTTP con una página HTTPS: el navegador puede bloquearlas por contenido mixto.
- **No configurar dominios de ejemplo** como si fueran API disponibles.

## 5. CORS (lo configura cada backend)
Cada API debe permitir el origen exacto `https://TU-PROYECTO.vercel.app` y, si se usan previews, los orígenes de preview autorizados. Permitir métodos necesarios (GET, POST, PUT, PATCH, DELETE, OPTIONS) y encabezados `Content-Type` y `Authorization`. Si hay Spring Security, comprobar el manejo de OPTIONS/preflight. No usar `*` con credenciales. Configurar CORS no sustituye la autorización del backend.

## 6. Comprobaciones tras publicar
- Abrir `/`, `/login`, `/registro`, `/cliente`, `/proveedor` y refrescar con F5; `vercel.json` evita 404 de rutas SPA.
- Verificar Claro, Oscuro y Confort.
- Abrir DevTools > Network: inspeccionar URLs, respuestas y mensajes CORS.
- Probar registro/login con API real cuando estén desplegadas.
- Confirmar que `/servicios` no esté accesible para Proveedor/Cliente desde navegación, y que el backend valide permisos.
- Validar los datos de demo separadamente de los persistidos en BD.

## 7. Limitaciones pendientes
- Integración real de horarios y asignaciones del proveedor, sujeto a contratos finales.
- Cliente: perfil y exploración de demo; reservas pendientes.
- El frontend guarda la sesión en sessionStorage, lo cual no constituye seguridad suficiente por sí solo.
- Los endpoints y los esquemas de respuesta se deben validar con las versiones finales de las tres API.
