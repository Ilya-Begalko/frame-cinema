import { describe, expect, it } from 'vitest'
import { filterMovies } from './filter-movies'
import { parseExploreParams, toSearchParams } from './explore-params'
import type { MovieSummary } from '../../services/tmdb/movies.types'

describe('explore params', () => {
  it('читает фильтры из адреса и выбрасывает неизвестное настроение', () => {
    const params = parseExploreParams(
      new URLSearchParams('q=her&moods=dreamlike,nope&style=neon&sort=rating&page=2'),
    )

    expect(params.q).toBe('her')
    expect(params.moods).toEqual(['dreamlike'])
    expect(params.style).toBe('neon')
    expect(params.sort).toBe('rating')
    expect(params.page).toBe(2)
  })

  it('не пишет в адрес значения по умолчанию', () => {
    const search = toSearchParams({
      q: '',
      moods: [],
      style: '',
      genre: '',
      year: '',
      country: '',
      rating: '',
      sort: 'popularity',
      page: 1,
    })
    expect(search.toString()).toBe('')
  })
})

describe('filterMovies', () => {
  const movies: MovieSummary[] = [
    {
      id: 1,
      title: 'Tokyo',
      overview: '',
      posterPath: null,
      backdropPath: null,
      releaseDate: '2003-09-12',
      voteAverage: 7.4,
      genreIds: [18],
      originCountry: ['JP'],
    },
    {
      id: 2,
      title: 'Later',
      overview: '',
      posterPath: null,
      backdropPath: null,
      releaseDate: '2019-01-01',
      voteAverage: 6,
      genreIds: [35],
      originCountry: ['US'],
    },
  ]

  it('оставляет фильмы, которые подходят году, жанру и рейтингу', () => {
    const kept = filterMovies(movies, { genre: '18', year: '2003', country: 'JP', rating: '7' })
    expect(kept.map((movie) => movie.id)).toEqual([1])
  })
})
