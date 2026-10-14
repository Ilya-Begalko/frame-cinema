import { describe, expect, it } from 'vitest'
import { buildSnapshot, decodeSharedCollection, encodeSharedCollection, parseSnapshot, shareUrl } from './transfer'
import type { SavedMovie } from './types'

const movie: SavedMovie = {
  id: 78,
  title: 'Blade Runner',
  posterPath: '/poster.jpg',
  releaseDate: '1982-06-25',
  voteAverage: 7.9,
  genreIds: [878, 53],
  overview: 'A blade runner hunts replicants.',
}

describe('transfer', () => {
  it('принимает собственный экспорт и отвергает чужой файл', () => {
    const snapshot = buildSnapshot(
      {
        favorites: [movie],
        watchlist: [],
        watched: [],
        ratings: { '78': 10 },
        notes: { '78': 'rain' },
        collections: [],
      },
      '2026-10-13T00:00:00.000Z',
    )

    expect(parseSnapshot(snapshot).favorites[0]?.title).toBe('Blade Runner')
    expect(() => parseSnapshot({ version: 2 })).toThrow(/FRAME collection export/)
  })

  it('прячет подборку в ссылку и читает её обратно', () => {
    const encoded = encodeSharedCollection({
      name: 'Night cities',
      description: 'Rain and neon',
      movies: [movie],
    })
    const decoded = decodeSharedCollection(encoded)

    expect(decoded.name).toBe('Night cities')
    expect(decoded.movies[0]?.id).toBe(78)
  })

  it('отказывается от ссылки, если подборка не влезает в адрес', () => {
    const huge = shareUrl('https://frame.test', {
      name: 'Too long',
      description: 'x'.repeat(5000),
      movies: [movie],
    })
    expect(huge).toBeNull()
  })
})
