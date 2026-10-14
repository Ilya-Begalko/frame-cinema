/**
 * Клиент ходит только на свой сервер разработки: `/tmdb/...`.
 * Ключ подставляет прокси в vite.config.ts. В этом файле ключа нет специально.
 */

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

/** Общий GET к TMDB через локальный прокси. */
export async function tmdbGet<T>(path: string, params: Record<string, QueryValue> = {}): Promise<T> {
  const response = await fetch(`/tmdb${path}${toQuery(params)}`)
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
