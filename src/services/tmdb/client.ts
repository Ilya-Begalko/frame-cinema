/**
 * Локально браузер ходит на `/tmdb/...`, а ключ добавляет прокси Vite.
 * На GitHub Pages сервера нет, поэтому сборка Pages передаёт VITE_TMDB_API_KEY
 * и запрос идёт прямо на api.themoviedb.org. Этот ключ оказывается в скачанном JavaScript.
 */

const pagesKey = import.meta.env.VITE_TMDB_API_KEY

export class TmdbError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'TmdbError'
    this.status = status
  }
}

type QueryValue = string | number | boolean | undefined

/** Собирает query string и выкидывает пустые параметры, чтобы URL оставался читаемым. */
function toQuery(params: Record<string, QueryValue>) {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === '') continue
    search.set(key, String(value))
  }
  const query = search.toString()
  return query ? `?${query}` : ''
}

/** Локальный прокси или прямой адрес TMDB, если сборка Pages передала ключ. */
export function tmdbUrl(path: string, params: Record<string, QueryValue> = {}, apiKey = pagesKey) {
  if (apiKey) {
    return `https://api.themoviedb.org/3${path}${toQuery({ ...params, api_key: apiKey })}`
  }
  return `/tmdb${path}${toQuery(params)}`
}

/** Общий GET к TMDB. */
export async function tmdbGet<T>(path: string, params: Record<string, QueryValue> = {}): Promise<T> {
  const response = await fetch(tmdbUrl(path, params))
  if (!response.ok) {
    let message = `TMDB responded with ${response.status}`
    try {
      const body = (await response.json()) as { status_message?: string }
      if (body.status_message) message = body.status_message
    } catch {
      // Тело ошибки бывает пустым. Тогда остаётся статус.
    }
    throw new TmdbError(message, response.status)
  }
  return (await response.json()) as T
}
