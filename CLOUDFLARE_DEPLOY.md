# Subir a Cloudflare Pages

En la pantalla de Cloudflare donde aparece "Upload and deploy", sube este archivo:

`cloudflare-upload/event-photo-rank-cloudflare.zip`

No subas `node_modules`, `.next`, `out` completo dentro de otra carpeta, ni el proyecto entero. El ZIP ya contiene los archivos estaticos necesarios en la raiz.

## Para usarlo con gente real

Antes de generar el ZIP definitivo, configura `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
NEXT_PUBLIC_DEMO_MODE=false
NEXT_PUBLIC_EVENT_SLUG=fiesta-aurora
NEXT_PUBLIC_MAX_UPLOAD_MB=8
NEXT_PUBLIC_ADMIN_PASSWORD=tu_clave_admin
```

Despues ejecuta:

```bash
npm run build
```

Y vuelve a crear el ZIP desde el contenido de `out`.

Si subes el ZIP actual, funcionara como previsualizacion/demo. Para produccion, las variables de Supabase deben estar configuradas antes de hacer el build porque el sitio exportado es estatico.
