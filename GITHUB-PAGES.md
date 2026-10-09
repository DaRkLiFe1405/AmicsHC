# Publicar en GitHub Pages

El workflow `.github/workflows/deploy-pages.yml` publica la web en GitHub Pages al actualizar `main` y vuelve a generar los calendarios cada hora.

GitHub Pages solo sirve archivos estáticos. Por eso, cada publicación consulta iSquad y guarda una copia de los calendarios en el sitio. La web conserva los equipos, partidos y resultados, pero los datos se actualizan cuando termina la siguiente ejecución del workflow.

Para generar el sitio localmente, ejecuta `npm ci` y `npm run build:pages` desde `amics-handbol-la-canonja`. La publicación de Cloudflare Worker sigue disponible con `npm run deploy` y consulta los datos en directo.
