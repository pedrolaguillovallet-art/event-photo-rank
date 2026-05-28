# Event Photo Rank

Aplicacion web para eventos donde los asistentes entran con un apodo, suben fotos, votan sus favoritas y ven rankings en vivo.

## Ejecutar en local

```bash
npm install
npm run dev
```

Abre `http://localhost:3000`.

## Variables de entorno

Copia `.env.example` a `.env.local` y completa tus credenciales de Supabase:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_DEMO_MODE=true
NEXT_PUBLIC_EVENT_SLUG=fiesta-aurora
NEXT_PUBLIC_MAX_UPLOAD_MB=8
NEXT_PUBLIC_ADMIN_PASSWORD=eventrank-demo
```

Con `NEXT_PUBLIC_DEMO_MODE=true`, la app usa datos locales para poder probar el MVP sin conectar Supabase.

## Supabase

Ejecuta el SQL de `supabase/schema.sql` en tu proyecto de Supabase y crea un bucket publico llamado `event-photos`.
El SQL tambien intenta crear el bucket y sus politicas; si tu proyecto no permite gestionarlo desde SQL, crealo desde Storage con ese mismo nombre.

Para produccion, desactiva el modo demo:

```bash
NEXT_PUBLIC_DEMO_MODE=false
```

## Despliegue en Vercel

1. Sube el proyecto a GitHub.
2. Importa el repositorio en Vercel.
3. Copia las variables de `.env.example` en Project Settings > Environment Variables.
4. Usa `NEXT_PUBLIC_DEMO_MODE=false` y el slug del evento en `NEXT_PUBLIC_EVENT_SLUG`.
5. Despliega y comparte la URL o un QR.
