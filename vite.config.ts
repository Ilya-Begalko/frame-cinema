import { copyFileSync } from 'node:fs'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { loadEnv, type Plugin } from 'vite'
import { defineConfig } from 'vitest/config'

/**
 * На GitHub Pages проект открывается как /имя-репозитория/.
 * Локально base остаётся «/»: GITHUB_PAGES выставляет только workflow.
 */
function siteBase() {
  if (process.env.GITHUB_PAGES !== 'true') return '/'
  const repo = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? 'frame-cinema'
  return `/${repo}/`
}

/**
 * Pages не умеет отдавать index.html на /film/123.
 * Копия в 404.html сохраняет адрес, и роутер читает его сам.
 */
function githubPagesSpaFallback(): Plugin {
  return {
    name: 'github-pages-spa-fallback',
    apply: 'build',
    closeBundle() {
      if (process.env.GITHUB_PAGES !== 'true') return
      const dist = resolve('dist')
      copyFileSync(resolve(dist, 'index.html'), resolve(dist, '404.html'))
    },
  }
}

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
    base: siteBase(),
    plugins: [react(), tailwindcss(), tmdbDevProxy(env.TMDB_API_KEY ?? ''), githubPagesSpaFallback()],
    test: {
      environment: 'jsdom',
      setupFiles: './src/test/setup.ts',
      include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    },
  }
})
