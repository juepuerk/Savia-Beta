# Savia (beta)

Plataforma en español para evaluar productos digitales y servicios con métodos guiados de UX e investigación: modelo iceberg, evaluación heurística, customer journey, SUS, card sorting, WCAG, matriz impacto/esfuerzo, service blueprint y encuestas. Cada método registra evidencia, la convierte en hallazgos aprobados y genera un informe ejecutivo. Una síntesis opcional con Gemini propone hallazgos para revisión humana.

## Estado de la beta

- **Los datos viven en el navegador** (`localStorage`). Cada persona ve solo lo que crea en su propio navegador; no hay colaboración en tiempo real ni sincronización entre dispositivos.
- **El acceso por perfil no es autenticación real.** Cualquiera con la URL puede entrar con cualquier perfil. No uses datos sensibles en esta versión.
- **Los endpoints de IA son públicos.** Configura un límite de gasto para la clave de Gemini.

## Correr en local

Requisitos: Node 20+ (o Bun).

```bash
npm install
cp .env.example .env   # añade tu GEMINI_API_KEY (opcional)
npm run dev            # http://localhost:3000
```

Sin `GEMINI_API_KEY` la app funciona igual; el botón **Síntesis IA** aparece desactivado.

Comprobaciones:

```bash
npm run lint    # TypeScript
npm run build   # build de producción en dist/
```

## Desplegar en Vercel

1. En Vercel: **Add New → Project** e importa este repositorio.
2. Vercel detecta la configuración de `vercel.json` (build con Vite, salida en `dist/`).
3. En **Settings → Environment Variables** añade `GEMINI_API_KEY` (y opcionalmente `GEMINI_MODEL`).
4. Despliega. Cada push a `main` publica una nueva versión y cada pull request genera una URL de previsualización.

## Estructura

| Ruta | Qué contiene |
| --- | --- |
| `src/` | Frontend React (Vite + Tailwind) |
| `api/` | Funciones serverless de Vercel (`/api/session/ip`, `/api/ai/*`) |
| `lib/` | Lógica compartida por `api/` y el servidor local (Gemini, IP) |
| `server.ts` | Servidor Express para desarrollo local |

## Navegación

Las secciones tienen URL propia, así que el botón Atrás del navegador, recargar la página y compartir enlaces funcionan:

- `#/panel`, `#/proyectos`, `#/metodos`, `#/informes`, `#/admin`
- `#/proyectos/<id>` y `#/proyectos/<id>/<método>` (por ejemplo `heuristic_evaluation`, `resumen` o `hallazgos`)
- Enlace de encuesta para participantes: `?participante=true&proyecto=<id>`
