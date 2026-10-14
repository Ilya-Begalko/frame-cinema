import { describe, expect, it } from 'vitest'
import { pickSpotlight, rollSpotlight, SPOTLIGHT_PAGE_COUNT } from './spotlight'

describe('rollSpotlight', () => {
  it('берёт первую страницу и первый фильм, если случайность нулевая', () => {
    expect(rollSpotlight(() => 0)).toEqual({ page: 1, slot: 0 })
  })

  it('берёт последнюю страницу жеребьёвки, если случайность почти единица', () => {
    expect(rollSpotlight(() => 0.999).page).toBe(SPOTLIGHT_PAGE_COUNT)
  })
})

describe('pickSpotlight', () => {
  it('возвращает фильм по доле и ничего, если страница пустая', () => {
    expect(pickSpotlight(['a', 'b', 'c'], 0)).toBe('a')
    expect(pickSpotlight(['a', 'b', 'c'], 0.999)).toBe('c')
    expect(pickSpotlight([], 0.4)).toBeNull()
  })
})
