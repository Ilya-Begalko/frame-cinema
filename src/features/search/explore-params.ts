import type { MoodId, VisualStyleId } from '../mood-matching/moods'
import { isMoodId, isVisualStyle } from '../mood-matching/moods'

export const SORTS = ['popularity', 'rating', 'release'] as const
export type SortId = (typeof SORTS)[number]

/** Всё, что экран Explore хранит в адресе. Обновление страницы не сбрасывает фильтры. */
export interface ExploreParams {
  q: string
  moods: MoodId[]
  style: VisualStyleId | ''
  genre: string
  year: string
  country: string
  rating: string
  sort: SortId
  page: number
}

export function emptyExploreParams(): ExploreParams {
  return {
    q: '',
    moods: [],
    style: '',
    genre: '',
    year: '',
    country: '',
    rating: '',
    sort: 'popularity',
    page: 1,
  }
}

/** Читает фильтры из URL. Незнакомые значения настроения тихо отбрасываются. */
export function parseExploreParams(search: URLSearchParams): ExploreParams {
  const sort = search.get('sort')
  const page = Number(search.get('page') ?? '1')
  const style = search.get('style') ?? ''
  return {
    q: search.get('q') ?? '',
    moods: (search.get('moods') ?? '')
      .split(',')
      .map((item) => item.trim())
      .filter(isMoodId),
    style: isVisualStyle(style) ? style : '',
    genre: search.get('genre') ?? '',
    year: search.get('year') ?? '',
    country: search.get('country') ?? '',
    rating: search.get('rating') ?? '',
    sort: sort === 'rating' || sort === 'release' || sort === 'popularity' ? sort : 'popularity',
    page: Number.isInteger(page) && page > 0 ? page : 1,
  }
}

/** Пишет в URL только то, что отличается от значений по умолчанию. */
export function toSearchParams(params: ExploreParams) {
  const search = new URLSearchParams()
  if (params.q) search.set('q', params.q)
  if (params.moods.length > 0) search.set('moods', params.moods.join(','))
  if (params.style) search.set('style', params.style)
  if (params.genre) search.set('genre', params.genre)
  if (params.year) search.set('year', params.year)
  if (params.country) search.set('country', params.country)
  if (params.rating) search.set('rating', params.rating)
  if (params.sort !== 'popularity') search.set('sort', params.sort)
  if (params.page > 1) search.set('page', String(params.page))
  return search
}
