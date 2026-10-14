/** Фильм, который мы умеем показать без повторного запроса к TMDB. */
export interface SavedMovie {
  id: number
  title: string
  posterPath: string | null
  releaseDate: string
  voteAverage: number
  genreIds: number[]
  overview: string
  director?: string
}

export interface WatchedMovie extends SavedMovie {
  watchedAt: string
}

export interface UserCollection {
  id: string
  name: string
  description: string
  movieIds: number[]
  createdAt: string
}

export type CinemaLanguage = 'en-US' | 'ru-RU'

/**
 * Срез данных, который уходит в localStorage.
 * Функции хранилища сюда не входят: JSON не умеет хранить функции.
 */
export interface LibraryData {
  favorites: SavedMovie[]
  watchlist: SavedMovie[]
  watched: WatchedMovie[]
  ratings: Record<string, number>
  notes: Record<string, string>
  collections: UserCollection[]
  library: Record<string, SavedMovie>
  language: CinemaLanguage
}

export interface CinemaSnapshot {
  version: 1
  exportedAt: string
  favorites: SavedMovie[]
  watchlist: SavedMovie[]
  watched: WatchedMovie[]
  ratings: Record<string, number>
  notes: Record<string, string>
  collections: UserCollection[]
}

export interface SharedCollection {
  name: string
  description: string
  movies: SavedMovie[]
}
