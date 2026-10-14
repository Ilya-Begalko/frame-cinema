import { describe, expect, it } from 'vitest'
import { computeStats } from './stats'
import type { WatchedMovie } from './types'

const watched: WatchedMovie[] = [
  {
    id: 1,
    title: 'Pastoral',
    posterPath: null,
    releaseDate: '2010-01-01',
    voteAverage: 7,
    genreIds: [18, 10749],
    overview: '',
    director: 'Agnès Varda',
    watchedAt: '2026-01-01',
  },
  {
    id: 2,
    title: 'Another',
    posterPath: null,
    releaseDate: '2011-01-01',
    voteAverage: 8,
    genreIds: [18],
    overview: '',
    director: 'Agnès Varda',
    watchedAt: '2026-02-01',
  },
]

describe('computeStats', () => {
  it('считает просмотренное, жанры, режиссёров и среднюю оценку', () => {
    const stats = computeStats({
      watched,
      favorites: [watched[0]!],
      watchlist: [],
      ratings: { '1': 9, '2': 7, '99': 1 },
    })

    expect(stats.watchedCount).toBe(2)
    expect(stats.favoriteCount).toBe(1)
    expect(stats.averageRating).toBe(8)
    expect(stats.topGenres[0]).toEqual({ id: 18, name: 'Drama', count: 2 })
    expect(stats.topDirectors[0]).toEqual({ name: 'Agnès Varda', count: 2 })
  })

  it('не выдумывает среднюю оценку, если оценок у просмотренных нет', () => {
    const stats = computeStats({
      watched: [],
      favorites: [],
      watchlist: [],
      ratings: { '1': 10 },
    })
    expect(stats.averageRating).toBeNull()
  })
})
