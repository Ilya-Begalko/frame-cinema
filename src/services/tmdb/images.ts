const SIZES = {
  poster: 'w500',
  backdrop: 'w1280',
  profile: 'w185',
} as const

/**
 * Картинки TMDB отдаются с публичного адреса и не требуют ключа.
 * path из API выглядит как `/abc.jpg` и уже содержит ведущий слэш.
 */
export function tmdbImage(path: string | null | undefined, size: keyof typeof SIZES) {
  if (!path) return null
  return `https://image.tmdb.org/t/p/${SIZES[size]}${path}`
}
