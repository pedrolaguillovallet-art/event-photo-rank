# Despliegue en Vercel

## 1. Importar el proyecto

1. Entra en Vercel.
2. Pulsa **Add New Project**.
3. Importa el repositorio de GitHub:
   `pedrolaguillovallet-art/event-photo-rank`
4. Vercel deberia detectar **Next.js** automaticamente.

## 2. Ajustes de build

- Framework Preset: `Next.js`
- Build Command: `npm run build`
- Output Directory: dejar vacio / valor por defecto
- Install Command: dejar valor por defecto

No configures `NEXT_PUBLIC_ASSET_PREFIX` en Vercel.

## 3. Variables de entorno

Anade estas variables en **Project Settings > Environment Variables**:

```txt
NEXT_PUBLIC_SUPABASE_URL=https://apljrbygdyijwmoofmtt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=TU_CLAVE_ANON_DE_SUPABASE
NEXT_PUBLIC_DEMO_MODE=false
NEXT_PUBLIC_EVENT_SLUG=fiesta-aurora
NEXT_PUBLIC_MAX_UPLOAD_MB=8
NEXT_PUBLIC_ADMIN_PASSWORD=3004
```

La clave `NEXT_PUBLIC_SUPABASE_ANON_KEY` es la clave publica anon/publishable de Supabase.

## 4. Desplegar

Pulsa **Deploy**. Si cambias variables de entorno despues del primer despliegue, vuelve a lanzar **Redeploy**.

## 5. Comprobar

Despues del despliegue revisa:

- Entrar al evento.
- Subir una foto desde el movil.
- Votar una foto.
- Ver tus fotos en Perfil.
- Entrar en Admin con la clave `3004`.
- Cerrar y reabrir el evento desde Admin.
