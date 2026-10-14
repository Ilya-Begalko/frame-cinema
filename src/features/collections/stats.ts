import { genreName } from '../../lib/genres'
import type { LibraryData } from './types'

export interface GenreStat {
  id: number
  name: string
  count: number
}

export interface DirectorStat {
  name: string
  count: number
}

export interface CinemaStats {
  watchedCount: number
  favoriteCount: number
  watchlistCount: number
  averageRating: number | null
  topGenres: GenreStat[]
  topDirectors: DirectorStat[]
}

function topCounts(entries: Map<string, number>, limit: number) {
  return [...entries.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .slice(0, limit)
}

/**
 * Статистика считается на месте из локальной коллекции.
 * Серверу она не нужна: все цифры уже лежат в браузере.
 * Режиссёр появляется, только если пользователь открывал страницу фильма
 * и фильм попал в один из списков — в каталоге TMDB режиссёра нет.
 */
export function computeStats(state: Pick<LibraryData, 'watched' | 'favorites' | 'watchlist' | 'ratings'>): CinemaStats {
  const genreCounts = new Map<number, number>()
  const directorCounts = new Map<string, number>()

  for (const movie of state.watched) {
    for (const genreId of movie.genreIds) {
      genreCounts.set(genreId, (genreCounts.get(genreId) ?? 0) + 1)
    }
    if (movie.director) {
      directorCounts.set(movie.director, (directorCounts.get(movie.director) ?? 0) + 1)
    }
  }

  const ratingValues = state.watched
    .map((movie) => state.ratings[String(movie.id)])
    .filter((value): value is number => typeof value === 'number')

  return {
    watchedCount: state.watched.length,
    favoriteCount: state.favorites.length,
    watchlistCount: state.watchlist.length,
    averageRating:
      ratingValues.length > 0 ? ratingValues.reduce((sum, value) => sum + value, 0) / ratingValues.length : null,
    topGenres: topCounts(
      new Map([...genreCounts.entries()].map(([id, count]) => [String(id), count])),
      3,
    ).map(([id, count]) => ({
      id: Number(id),
      name: genreName(Number(id)),
      count,
    })),
    topDirectors: topCounts(directorCounts, 3).map(([name, count]) => ({ name, count })),
  }
}
