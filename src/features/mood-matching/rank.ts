import type { MoodId, TasteRule, VisualStyleId } from './moods'
import { moodById, styleById } from './moods'

/**
 * Вход алгоритма специально маленький.
 * Так его можно проверить тестом без React, сети и Zustand.
 */
export interface ScoreInput {
  id: number
  overview: string
  genreIds: readonly number[]
  voteAverage: number
  keywords?: readonly string[]
}

/**
 * Считает, насколько фильм подходит выбранным настроениям.
 * Без настроения и стиля остаётся только оценка TMDB — каталог не перемешивается зря.
 * Жанр весит больше слова: русское описание не содержит английских signals.
 */
export function scoreMovie(movie: ScoreInput, moods: readonly MoodId[], style: VisualStyleId | '') {
  if (moods.length === 0 && !style) return movie.voteAverage

  const text = `${movie.overview} ${(movie.keywords ?? []).join(' ')}`.toLowerCase()
  let score = movie.voteAverage * 0.2
  const rules: TasteRule[] = [...moods.map((id) => moodById(id)), ...(style ? [styleById(style)] : [])]

  for (const rule of rules) {
    for (const genreId of movie.genreIds) {
      if (rule.genres.includes(genreId)) score += 5
      if (rule.avoid.includes(genreId)) score -= 3
    }
    for (const signal of rule.signals) {
      if (text.includes(signal)) score += 1.5
    }
  }

  return score
}

/** Возвращает новый массив. Исходный список не мутируется — это проще рассуждать в React. */
export function rankByMood<T>(
  items: readonly T[],
  toInput: (item: T) => ScoreInput,
  moods: readonly MoodId[],
  style: VisualStyleId | '',
) {
  if (moods.length === 0 && !style) return [...items]
  return [...items].sort(
    (left, right) => scoreMovie(toInput(right), moods, style) - scoreMovie(toInput(left), moods, style),
  )
}

/**
 * «Удиви меня»: случайный фильм из восьми лучших непросмотренных.
 * random передаётся снаружи, чтобы тест не зависел от удачи.
 */
export function pickSurprise<T>(
  items: readonly T[],
  toInput: (item: T) => ScoreInput,
  moods: readonly MoodId[],
  style: VisualStyleId | '',
  watchedIds: readonly number[],
  random: () => number = Math.random,
) {
  const watched = new Set(watchedIds)
  const unseen = items.filter((item) => !watched.has(toInput(item).id))
  const pool = rankByMood(unseen, toInput, moods, style).slice(0, 8)
  if (pool.length === 0) return null
  const index = Math.min(pool.length - 1, Math.floor(random() * pool.length))
  return pool[index] ?? null
}
