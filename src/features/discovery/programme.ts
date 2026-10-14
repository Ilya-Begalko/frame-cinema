/**
 * Редакционная полка — конкретные фильмы, а не «популярное сегодня».
 * id стабильны в TMDB. Подписи рядом с постером задаём мы, не API.
 */
export const PROGRAMME = [
  { id: 843, kicker: 'Longing' },
  { id: 153, kicker: 'Distance' },
  { id: 376867, kicker: 'Tenderness' },
  { id: 531428, kicker: 'Gaze' },
  { id: 666277, kicker: 'Return' },
  { id: 194, kicker: 'Wonder' },
] as const

export const DOUBLE_FEATURES = [
  {
    ids: [153, 843] as const,
    title: 'Almost, but not quite',
    note: 'Two films about a feeling that never quite becomes a life together.',
  },
  {
    ids: [335984, 78] as const,
    title: 'Cities that dream',
    note: 'Rain, neon, and the question of who gets to be real.',
  },
  {
    ids: [1417, 129] as const,
    title: 'The door in the dark',
    note: 'Fairy tales that refuse to make the world safer.',
  },
  {
    ids: [38, 152601] as const,
    title: 'Love, after the machine',
    note: 'Memory and software start to feel like the same room.',
  },
] as const

/** Пара на вечер зависит от даты, а не от случайности: вечером она не прыгает при обновлении. */
export function tonightsPair(now = new Date()) {
  const day = Math.floor(now.getTime() / 86_400_000)
  const pair = DOUBLE_FEATURES[day % DOUBLE_FEATURES.length]
  if (!pair) return DOUBLE_FEATURES[0]
  return pair
}
