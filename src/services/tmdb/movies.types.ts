/** Форма фильма, которой достаточно карточке, сетке и алгоритму настроения. */
export interface MovieSummary {
  id: number
  title: string
  originalTitle?: string
  overview: string
  posterPath: string | null
  backdropPath: string | null
  releaseDate: string
  voteAverage: number
  genreIds: number[]
  originCountry?: string[]
}

export interface TmdbGenre {
  id: number
  name: string
}

/** Ответ списка TMDB. Поля названы как в API, чтобы было видно границу с нашим кодом. */
export interface TmdbMovie {
  id: number
  title: string
  original_title?: string
  overview?: string
  poster_path: string | null
  backdrop_path: string | null
  release_date?: string
  vote_average?: number
  vote_count?: number
  popularity?: number
  genre_ids?: number[]
  genres?: TmdbGenre[]
  origin_country?: string[]
}

export interface TmdbPaged<T> {
  page: number
  total_pages: number
  total_results: number
  results: T[]
}

export interface TmdbCastMember {
  id: number
  name: string
  character: string
  profile_path: string | null
  order: number
}

export interface TmdbCrewMember {
  id: number
  name: string
  job: string
  department: string
}

export interface TmdbVideo {
  key: string
  name: string
  site: string
  type: string
}

export interface TmdbKeyword {
  id: number
  name: string
}

/** Полная карточка фильма. append_to_response собирает её одним запросом. */
export interface TmdbMovieDetails extends TmdbMovie {
  runtime?: number
  tagline?: string
  genres?: TmdbGenre[]
  credits?: {
    cast: TmdbCastMember[]
    crew: TmdbCrewMember[]
  }
  videos?: { results: TmdbVideo[] }
  similar?: { results: TmdbMovie[] }
  keywords?: { keywords: TmdbKeyword[] }
}

export interface TmdbPerson {
  id: number
  name: string
  known_for_department: string
}

export interface TmdbCrewCredit extends TmdbMovie {
  job?: string
}

export interface DiscoverQuery {
  language: string
  page: number
  sort_by: string
  include_adult: boolean
  with_genres?: string
  primary_release_year?: string
  with_origin_country?: string
  'vote_average.gte'?: string
  'vote_count.gte'?: number
}
