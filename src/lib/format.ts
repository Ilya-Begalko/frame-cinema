/** Год из даты TMDB вида 1999-10-15. */
export function yearOf(date: string | null | undefined) {
  if (!date) return '—'
  return date.slice(0, 4) || '—'
}

/** 139 минут превращает в «2h 19m». */
export function formatRuntime(minutes: number) {
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  if (hours <= 0) return `${rest}m`
  return `${hours}h ${rest}m`
}

/** Рейтинг TMDB с одним знаком после запятой. */
export function formatRating(value: number) {
  return value.toFixed(1)
}
