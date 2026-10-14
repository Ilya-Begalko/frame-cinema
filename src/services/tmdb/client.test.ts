import { describe, expect, it } from 'vitest'
import { tmdbUrl } from './client'

describe('tmdbUrl', () => {
  it('локально оставляет запрос на прокси Vite', () => {
    expect(tmdbUrl('/movie/843', { language: 'en-US' }, '')).toBe('/tmdb/movie/843?language=en-US')
  })

  it('в сборке Pages зовёт TMDB напрямую и добавляет ключ', () => {
    expect(tmdbUrl('/movie/843', { language: 'en-US' }, 'test-key')).toBe(
      'https://api.themoviedb.org/3/movie/843?language=en-US&api_key=test-key',
    )
  })
})
