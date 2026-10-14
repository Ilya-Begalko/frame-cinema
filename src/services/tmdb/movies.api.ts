import { tmdbGet } from './client'
import type {
  DiscoverQuery,
  TmdbCrewCredit,
  TmdbMovie,
  TmdbMovieDetails,
  TmdbPaged,
  TmdbPerson,
} from './movies.types'
import type { ExploreParams } from '../../features/search/explore-params'
import { discoverGenreParam, TMDB_SORT } from '../../features/mood-matching/moods'

export interface ExploreResult {
  movies: TmdbMovie[]
  totalPages: number
  director: TmdbPerson | null
  directed: TmdbMovie[]
}

/** Поиск по названию. Режиссёра этот эндпоинт сам не понимает — его ищем отдельно. */
export function searchMovies(query: string, page: number, language: string) {
  return tmdbGet<TmdbPaged<TmdbMovie>>('/search/movie', {
    query,
    page,
    language,
    include_adult: false,
  })
}

/** Поиск человека. Дальше оставляем только тех, кто известен как режиссёр. */
export function searchPeople(query: string, language: string) {
  return tmdbGet<TmdbPaged<TmdbPerson>>('/search/person', { query, language })
}

export function getPersonCredits(personId: number, language: string) {
  return tmdbGet<{ crew: TmdbCrewCredit[] }>(`/person/${personId}/movie_credits`, { language })
}

/** Каталог без текстового запроса: жанр, год, страна, рейтинг и сортировка уходят в TMDB. */
export function discoverMovies(query: DiscoverQuery) {
  return tmdbGet<TmdbPaged<TmdbMovie>>('/discover/movie', { ...query })
}

/** Одна карточка плюс актёры, трейлер, похожие и ключевые слова. */
export function getMovieDetails(id: number, language: string) {
  return tmdbGet<TmdbMovieDetails>(`/movie/${id}`, {
    language,
    append_to_response: 'credits,videos,similar,keywords',
  })
}

/** Несколько точечных фильмов для редакционной подборки. Сбой одного id не гасит остальные. */
export async function getMoviesByIds(ids: readonly number[], language: string) {
  const settled = await Promise.allSettled(ids.map((id) => getMovieDetails(id, language)))
  const movies = settled.flatMap((item) => (item.status === 'fulfilled' ? [item.value] : []))
  if (movies.length === 0) {
    const reason = settled.find((item) => item.status === 'rejected')
    if (reason?.status === 'rejected') throw reason.reason
    throw new Error('Could not load the programme.')
  }
  return movies
}

/**
 * Экран Explore.
 * Пустой запрос идёт в discover. Текст ищет и фильмы, и режиссёра.
 * Настроение здесь не отправляется в TMDB: его применит клиентский ранжировщик.
 */
export async function exploreCatalog(params: ExploreParams, language: string): Promise<ExploreResult> {
  const query = params.q.trim()
  if (query) {
    const [movies, people] = await Promise.all([
      searchMovies(query, params.page, language),
      params.page === 1 ? searchPeople(query, language) : Promise.resolve({ results: [] as TmdbPerson[] }),
    ])
    const director =
      people.results.find(
        (person) =>
          person.known_for_department === 'Directing' && personNameMatches(person.name, query),
      ) ?? null
    const directed = director ? await directedFilms(director.id, language) : []
    return {
      movies: movies.results,
      totalPages: movies.total_pages,
      director,
      directed,
    }
  }

  const discovered = await discoverMovies({
    language,
    page: params.page,
    sort_by: TMDB_SORT[params.sort],
    include_adult: false,
    'vote_count.gte': 50,
    with_genres: discoverGenreParam(params.moods, params.style, params.genre),
    primary_release_year: params.year || undefined,
    with_origin_country: params.country || undefined,
    'vote_average.gte': params.rating || undefined,
  })

  return {
    movies: discovered.results,
    totalPages: discovered.total_pages,
    director: null,
    directed: [],
  }
}

function personNameMatches(name: string, query: string) {
  const person = name.toLowerCase()
  const text = query.trim().toLowerCase()
  return person.includes(text) || text.includes(person)
}

async function directedFilms(personId: number, language: string) {
  const credits = await getPersonCredits(personId, language)
  return credits.crew
    .filter((credit) => credit.job === 'Director' && credit.title)
    .sort((a, b) => (b.release_date ?? '').localeCompare(a.release_date ?? ''))
    .slice(0, 12)
}
