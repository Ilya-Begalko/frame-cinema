import { describe, expect, it } from 'vitest'
import {
  addCollection,
  emptyLibrary,
  mergeLibrary,
  setNote,
  setRating,
  toggleFavorite,
  toggleWatched,
  toggleWatchlist,
} from './library'
import type { SavedMovie } from './types'

const her: SavedMovie = {
  id: 152601,
  title: 'Her',
  posterPath: null,
  releaseDate: '2013-12-18',
  voteAverage: 7.9,
  genreIds: [10749, 878],
  overview: 'A man falls in love with a voice.',
  director: 'Spike Jonze',
}

describe('library', () => {
  it('кладёт фильм в избранное и убирает повторным вызовом', () => {
    const added = toggleFavorite(emptyLibrary(), her)
    expect(added.favorites.map((movie) => movie.id)).toEqual([152601])
    expect(added.library['152601']?.title).toBe('Her')

    const removed = toggleFavorite(added, her)
    expect(removed.favorites).toEqual([])
  })

  it('снимает фильм со списка «Посмотреть», когда он отмечен просмотренным', () => {
    const waiting = toggleWatchlist(emptyLibrary(), her)
    const seen = toggleWatched(waiting, her, '2026-10-13T12:00:00.000Z')

    expect(seen.watchlist).toEqual([])
    expect(seen.watched[0]?.watchedAt).toBe('2026-10-13T12:00:00.000Z')
  })

  it('повторная отметка не возвращает фильм в список ожидания', () => {
    const waiting = toggleWatchlist(emptyLibrary(), her)
    const seen = toggleWatched(waiting, her, '2026-10-13T12:00:00.000Z')
    const undone = toggleWatched(seen, her, '2026-10-13T13:00:00.000Z')

    expect(undone.watched).toEqual([])
    expect(undone.watchlist).toEqual([])
  })

  it('пустая заметка и пустая оценка удаляются из снимка', () => {
    const rated = setRating(setNote(emptyLibrary(), her.id, '  quiet  '), her.id, 9)
    expect(rated.notes[String(her.id)]).toBe('  quiet  ')
    expect(rated.ratings[String(her.id)]).toBe(9)

    const cleared = setRating(setNote(rated, her.id, '   '), her.id, null)
    expect(cleared.notes).toEqual({})
    expect(cleared.ratings).toEqual({})
  })

  it('не создаёт подборку без названия', () => {
    const next = addCollection(emptyLibrary(), { name: '   ', description: 'night' }, 'list-1', '2026-10-13')
    expect(next.collections).toEqual([])
  })

  it('импорт дополняет коллекцию и не стирает уже сохранённое', () => {
    const local = toggleFavorite(emptyLibrary(), her)
    const imported = mergeLibrary(local, {
      favorites: [
        {
          ...her,
          title: 'Her',
          overview: 'Updated overview',
        },
        {
          id: 843,
          title: 'Lost in Translation',
          posterPath: null,
          releaseDate: '2003-09-12',
          voteAverage: 7.4,
          genreIds: [18],
          overview: 'Two strangers in Tokyo.',
        },
      ],
      watchlist: [],
      watched: [],
      ratings: { '843': 8 },
      notes: {},
      collections: [],
    })

    expect(imported.favorites).toHaveLength(2)
    expect(imported.library['152601']?.overview).toBe('Updated overview')
    expect(imported.ratings['843']).toBe(8)
  })
})
