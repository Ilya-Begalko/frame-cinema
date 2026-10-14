import { describe, expect, it } from 'vitest'
import { discoverGenreParam } from './moods'
import { pickSurprise, rankByMood, scoreMovie, type ScoreInput } from './rank'

function film(partial: Partial<ScoreInput> & Pick<ScoreInput, 'id'>): ScoreInput {
  return {
    overview: '',
    genreIds: [],
    voteAverage: 7,
    ...partial,
  }
}

describe('scoreMovie', () => {
  it('оставляет рейтинг TMDB, если настроение не выбрано', () => {
    const movie = film({ id: 1, voteAverage: 8.2 })
    expect(scoreMovie(movie, [], '')).toBe(8.2)
  })

  it('поднимает фантастику для Dreamlike и опускает комедию', () => {
    const dream = film({
      id: 1,
      genreIds: [14, 878],
      overview: 'A dream that feels like a myth.',
      voteAverage: 7,
    })
    const comedy = film({ id: 2, genreIds: [35], overview: 'A loud party.', voteAverage: 7 })

    expect(scoreMovie(dream, ['dreamlike'], '')).toBeGreaterThan(scoreMovie(comedy, ['dreamlike'], ''))
  })

  it('учитывает визуальный стиль вместе с настроением', () => {
    const noir = film({ id: 1, genreIds: [80], overview: 'Rain and a detective.', voteAverage: 6 })
    const plain = film({ id: 2, genreIds: [18], overview: 'A quiet room.', voteAverage: 6 })

    expect(scoreMovie(noir, ['uneasy'], 'noir')).toBeGreaterThan(scoreMovie(plain, ['uneasy'], 'noir'))
  })
})

describe('rankByMood', () => {
  it('не перемешивает каталог без настроения', () => {
    const items = [film({ id: 1, voteAverage: 5 }), film({ id: 2, voteAverage: 9 })]
    expect(rankByMood(items, (item) => item, [], '').map((item) => item.id)).toEqual([1, 2])
  })

  it('ставит более подходящий фильм первым', () => {
    const items = [
      film({ id: 1, genreIds: [35], voteAverage: 8 }),
      film({ id: 2, genreIds: [878, 9648], overview: 'A loop inside a simulation.', voteAverage: 7 }),
    ]
    const ranked = rankByMood(items, (item) => item, ['mind-bending'], '')
    expect(ranked[0]?.id).toBe(2)
  })
})

describe('pickSurprise', () => {
  it('берёт непросмотренный фильм из верхней восьмёрки', () => {
    const items = Array.from({ length: 10 }, (_, index) =>
      film({ id: index + 1, genreIds: [18], voteAverage: 10 - index }),
    )
    const picked = pickSurprise(items, (item) => item, ['melancholic'], '', [1], () => 0)
    expect(picked?.id).toBe(2)
  })

  it('возвращает null, если смотреть уже нечего', () => {
    const items = [film({ id: 4, genreIds: [18] })]
    expect(pickSurprise(items, (item) => item, [], '', [4], () => 0)).toBeNull()
  })
})

describe('discoverGenreParam', () => {
  it('объединяет жанры настроений через или', () => {
    expect(discoverGenreParam(['dreamlike'], '', '')).toBe('14|878|16')
  })

  it('явный жанр важнее настроения', () => {
    expect(discoverGenreParam(['dreamlike'], 'noir', '18')).toBe('18')
  })
})
