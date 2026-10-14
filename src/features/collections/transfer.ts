import type { CinemaSnapshot, SavedMovie, SharedCollection, UserCollection, WatchedMovie } from './types'

const EXPORT_VERSION = 1 as const

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isMovie(value: unknown): value is SavedMovie {
  if (!isRecord(value)) return false
  return (
    typeof value.id === 'number' &&
    typeof value.title === 'string' &&
    (value.posterPath === null || typeof value.posterPath === 'string') &&
    typeof value.releaseDate === 'string' &&
    typeof value.voteAverage === 'number' &&
    Array.isArray(value.genreIds) &&
    value.genreIds.every((id) => typeof id === 'number') &&
    typeof value.overview === 'string'
  )
}

function isCollection(value: unknown): value is UserCollection {
  if (!isRecord(value)) return false
  return (
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.description === 'string' &&
    Array.isArray(value.movieIds) &&
    value.movieIds.every((id) => typeof id === 'number') &&
    typeof value.createdAt === 'string'
  )
}

function readMovies(value: unknown, label: string) {
  if (!Array.isArray(value) || !value.every(isMovie)) {
    throw new Error(`${label} is not a list of films.`)
  }
  return value
}

/** Старый экспорт мог не содержать дату просмотра. Тогда берём дату файла. */
function readWatchedAt(movie: SavedMovie, exportedAt: string) {
  const record = movie as unknown as Record<string, unknown>
  return typeof record.watchedAt === 'string' ? record.watchedAt : exportedAt
}

function readWatched(value: unknown, exportedAt: string): WatchedMovie[] {
  const movies = readMovies(value, 'Watched')
  return movies.map((movie) => ({
    ...movie,
    watchedAt: readWatchedAt(movie, exportedAt),
  }))
}

function readStringRecord(value: unknown) {
  if (!isRecord(value)) return {}
  const notes: Record<string, string> = {}
  for (const [key, note] of Object.entries(value)) {
    if (typeof note === 'string') notes[key] = note
  }
  return notes
}

function readRatings(value: unknown) {
  if (!isRecord(value)) return {}
  const ratings: Record<string, number> = {}
  for (const [key, rating] of Object.entries(value)) {
    if (typeof rating === 'number' && rating >= 1 && rating <= 10) ratings[key] = rating
  }
  return ratings
}

/** Снимок для файла. Версия нужна, чтобы будущий импорт узнал старый формат. */
export function buildSnapshot(
  state: Pick<CinemaSnapshot, 'favorites' | 'watchlist' | 'watched' | 'ratings' | 'notes' | 'collections'>,
  exportedAt = new Date().toISOString(),
): CinemaSnapshot {
  return {
    version: EXPORT_VERSION,
    exportedAt,
    favorites: state.favorites,
    watchlist: state.watchlist,
    watched: state.watched,
    ratings: state.ratings,
    notes: state.notes,
    collections: state.collections,
  }
}

/** Проверяет файл перед тем, как пустить его в хранилище. */
export function parseSnapshot(value: unknown): CinemaSnapshot {
  if (!isRecord(value) || value.version !== EXPORT_VERSION) {
    throw new Error('This file is not a FRAME collection export.')
  }
  const exportedAt = typeof value.exportedAt === 'string' ? value.exportedAt : new Date().toISOString()
  if (!Array.isArray(value.collections) || !value.collections.every(isCollection)) {
    throw new Error('Collections in this file are unreadable.')
  }
  return {
    version: EXPORT_VERSION,
    exportedAt,
    favorites: readMovies(value.favorites, 'Favorites'),
    watchlist: readMovies(value.watchlist, 'Watchlist'),
    watched: readWatched(value.watched, exportedAt),
    ratings: readRatings(value.ratings),
    notes: readStringRecord(value.notes),
    collections: value.collections,
  }
}

function toBase64Url(value: string) {
  const bytes = new TextEncoder().encode(value)
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/g, '')
}

function fromBase64Url(value: string) {
  const padLength = (4 - (value.length % 4)) % 4
  const base64 = value.replaceAll('-', '+').replaceAll('_', '/') + '='.repeat(padLength)
  const binary = atob(base64)
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

/** Ссылка без сервера: подборка целиком лежит в hash и не уходит на чужой backend. */
export function encodeSharedCollection(collection: SharedCollection) {
  return toBase64Url(JSON.stringify(collection))
}

export function decodeSharedCollection(value: string): SharedCollection {
  let parsed: unknown
  try {
    parsed = JSON.parse(fromBase64Url(value))
  } catch {
    throw new Error('This share link is damaged.')
  }
  if (!isRecord(parsed) || typeof parsed.name !== 'string' || typeof parsed.description !== 'string') {
    throw new Error('This share link does not contain a FRAME list.')
  }
  return {
    name: parsed.name,
    description: parsed.description,
    movies: readMovies(parsed.movies, 'Shared films'),
  }
}

/**
 * Длинная подборка не влезает в адрес. Тогда остаётся JSON-файл:
 * localStorage сам между устройствами не путешествует.
 */
export function shareUrl(origin: string, collection: SharedCollection) {
  const url = `${origin}/share#${encodeSharedCollection(collection)}`
  return url.length > 4000 ? null : url
}
