/** Сколько первых страниц каталога участвуют в жеребьёвке. */
export const SPOTLIGHT_PAGE_COUNT = 20

export interface SpotlightRoll {
  page: number
  /** Доля от 0 до 1: на какой позиции страницы остановиться. */
  slot: number
}

/**
 * Страница и место на ней выбираются один раз за заход.
 * random передаётся снаружи, чтобы тест не зависел от удачи.
 */
export function rollSpotlight(random: () => number = Math.random): SpotlightRoll {
  return {
    page: 1 + Math.floor(random() * SPOTLIGHT_PAGE_COUNT),
    slot: random(),
  }
}

export function pickSpotlight<T>(items: readonly T[], slot: number): T | null {
  if (items.length === 0) return null
  const index = Math.min(items.length - 1, Math.floor(slot * items.length))
  return items[index] ?? null
}
