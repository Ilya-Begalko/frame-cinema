import type { IncomingMessage, ServerResponse } from 'node:http'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { loadEnv, type Plugin } from 'vite'
import { defineConfig } from 'vitest/config'

/**
 * Прокси нужен, чтобы ключ TMDB жил только в процессе Vite.
 * Браузер ходит на свой адрес `/tmdb/...`, а ключ добавляется здесь
 * и не попадает в собранный JavaScript. Поэтому переменная называется
 * TMDB_API_KEY — без префикса VITE_, который Vite вшивает в клиент.
 */
function tmdbDevProxy(apiKey: string): Plugin {
  const handler = (req: IncomingMessage, res: ServerResponse, next: (error?: unknown) => void) => {
    const url = req.url ?? ''
    if (!url.startsWith('/tmdb')) {
      next()
      return
    }

    void forwardTmdb(url, apiKey, res).catch((error: unknown) => {
      const message = error instanceof Error ? error.message : 'TMDB proxy failed'
      if (res.headersSent) return
      res.statusCode = 502
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ status_code: 502, status_message: message }))
    })
  }

  return {
    name: 'tmdb-dev-proxy',
    configureServer(server) {
      server.middlewares.use(handler)
    },
    configurePreviewServer(server) {
      server.middlewares.use(handler)
    },
  }
}

async function forwardTmdb(url: string, apiKey: string, res: ServerResponse) {
  if (!apiKey) {
    res.statusCode = 503
    res.setHeader('Content-Type', 'application/json')
    res.end(
      JSON.stringify({
        status_code: 503,
        status_message:
          'Add TMDB_API_KEY to the .env file. The dev server reads it; the browser bundle does not.',
      }),
    )
    return
  }

  const incoming = new URL(url, 'http://127.0.0.1')
  const pathname = incoming.pathname.replace(/^\/tmdb/, '') || '/'
  const target = new URL(`https://api.themoviedb.org/3${pathname}`)
  incoming.searchParams.forEach((value, key) => {
    target.searchParams.append(key, value)
  })
  target.searchParams.set('api_key', apiKey)

  const response = await fetch(target)
  const body = Buffer.from(await response.arrayBuffer())
  res.statusCode = response.status
  const contentType = response.headers.get('content-type')
  if (contentType) res.setHeader('Content-Type', contentType)
  res.end(body)
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), tailwindcss(), tmdbDevProxy(env.TMDB_API_KEY ?? '')],
    test: {
      environment: 'jsdom',
      setupFiles: './src/test/setup.ts',
      include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    },
  }
})
