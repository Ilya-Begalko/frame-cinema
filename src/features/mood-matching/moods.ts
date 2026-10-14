/**
 * Настроение — это не жанр TMDB, а наше правило.
 * genres дают основной вес (они есть и у русского, и у английского ответа).
 * signals ищутся в английском описании и ключевых словах как дополнительный бонус.
 * avoid снижает фильмы, которые обычно спорят с этим ощущением.
 */
export interface TasteRule {
  id: string
  label: string
  subtitle: string
  genres: readonly number[]
  signals: readonly string[]
  avoid: readonly number[]
}

export const MOODS = [
  {
    id: 'melancholic',
    label: 'Melancholic',
    subtitle: 'Тихая грусть',
    genres: [18, 10749, 10402],
    signals: ['loss', 'grief', 'lonely', 'loneliness', 'farewell', 'apart', 'mourning', 'bittersweet'],
    avoid: [35, 28],
  },
  {
    id: 'dreamlike',
    label: 'Dreamlike',
    subtitle: 'Сонная атмосфера',
    genres: [14, 878, 16],
    signals: ['dream', 'surreal', 'sleep', 'fairy', 'wonder', 'floating', 'myth'],
    avoid: [28, 10751],
  },
  {
    id: 'uneasy',
    label: 'Uneasy',
    subtitle: 'Тревожное напряжение',
    genres: [53, 27, 9648],
    signals: ['paranoia', 'dread', 'fear', 'tension', 'nightmare', 'guilt', 'uneasy'],
    avoid: [35, 10751],
  },
  {
    id: 'hopeful',
    label: 'Hopeful',
    subtitle: 'Светлая надежда',
    genres: [10751, 12, 35],
    signals: ['hope', 'redeem', 'friend', 'courage', 'together', 'forgive', 'kindness'],
    avoid: [27],
  },
  {
    id: 'mind-bending',
    label: 'Mind-bending',
    subtitle: 'Слом реальности',
    genres: [878, 9648, 53],
    signals: ['reality', 'identity', 'twist', 'simulation', 'loop', 'memory', 'consciousness'],
    avoid: [10751, 35],
  },
  {
    id: 'nostalgic',
    label: 'Nostalgic',
    subtitle: 'Ностальгия',
    genres: [36, 10749, 18, 10751],
    signals: ['childhood', 'memory', 'hometown', 'summer', 'youth', 'letter', 'past'],
    avoid: [27, 53],
  },
] as const satisfies readonly TasteRule[]

export const VISUAL_STYLES = [
  {
    id: 'noir',
    label: 'Noir',
    subtitle: 'Тень и долг',
    genres: [80, 53],
    signals: ['noir', 'detective', 'shadow', 'crime', 'rain'],
    avoid: [16, 10751],
  },
  {
    id: 'neon',
    label: 'Neon',
    subtitle: 'Ночной город',
    genres: [878, 53],
    signals: ['neon', 'cyber', 'future', 'night', 'city'],
    avoid: [36, 37],
  },
  {
    id: 'pastoral',
    label: 'Pastoral',
    subtitle: 'Тихая земля',
    genres: [18, 10749],
    signals: ['village', 'countryside', 'nature', 'rural', 'farm', 'sea'],
    avoid: [878, 28],
  },
  {
    id: 'gritty',
    label: 'Gritty',
    subtitle: 'Шероховатый город',
    genres: [80, 18],
    signals: ['street', 'poverty', 'violence', 'urban', 'prison'],
    avoid: [14, 10751],
  },
  {
    id: 'lyrical',
    label: 'Lyrical',
    subtitle: 'Медленный кадр',
    genres: [18, 10749, 10402],
    signals: ['poetic', 'quiet', 'love', 'dance', 'music', 'silence'],
    avoid: [28, 53],
  },
] as const satisfies readonly TasteRule[]

export type MoodId = (typeof MOODS)[number]['id']
export type VisualStyleId = (typeof VISUAL_STYLES)[number]['id']

const MOOD_IDS = new Set<string>(MOODS.map((mood) => mood.id))
const STYLE_IDS = new Set<string>(VISUAL_STYLES.map((style) => style.id))

/** Узкий тип после проверки строки из URL. */
export function isMoodId(value: string): value is MoodId {
  return MOOD_IDS.has(value)
}

export function isVisualStyle(value: string): value is VisualStyleId {
  return STYLE_IDS.has(value)
}

export function moodById(id: MoodId) {
  const mood = MOODS.find((item) => item.id === id)
  if (!mood) throw new Error(`Unknown mood: ${id}`)
  return mood
}

export function styleById(id: VisualStyleId) {
  const style = VISUAL_STYLES.find((item) => item.id === id)
  if (!style) throw new Error(`Unknown style: ${id}`)
  return style
}

/**
 * Жанры для discover.
 * Явный жанр пользователя — жёсткий фильтр.
 * Настроения и стиль без явного жанра объединяются через «или» (символ | в TMDB).
 */
export function discoverGenreParam(moods: readonly MoodId[], style: VisualStyleId | '', explicitGenre: string) {
  if (explicitGenre) return explicitGenre
  const ids = new Set<number>()
  for (const moodId of moods) {
    for (const genreId of moodById(moodId).genres) ids.add(genreId)
  }
  if (style) {
    for (const genreId of styleById(style).genres) ids.add(genreId)
  }
  return ids.size > 0 ? [...ids].join('|') : undefined
}

/** Имена сортировок экрана Explore и соответствующие значения TMDB. */
export const TMDB_SORT = {
  popularity: 'popularity.desc',
  rating: 'vote_average.desc',
  release: 'primary_release_date.desc',
} as const
