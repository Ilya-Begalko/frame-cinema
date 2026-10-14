import type { SavedMovie } from '../features/collections/types'
import type { MovieSummary, TmdbMovie } from '../services/tmdb/movies.types'

/** Приводит разные ответы TMDB к одной форме, с которой работает карточка. */
export function asSummary(movie: TmdbMovie): MovieSummary {
  return {
    id: movie.id,
    title: movie.title,
    originalTitle: movie.original_title,
    overview: movie.overview ?? '',
    posterPath: movie.poster_path,
    backdropPath: movie.backdrop_path,
    releaseDate: movie.release_date ?? '',
    voteAverage: movie.vote_average ?? 0,
    genreIds: movie.genre_ids ?? movie.genres?.map((genre) => genre.id) ?? [],
    originCountry: movie.origin_country,
  }
}

/**
 * Снимок фильма для localStorage.
 * Мы сохраняем постер и название сразу, чтобы «Мой кинотеатр»
 * открывался без нового запроса к TMDB.
 */
export function toSavedMovie(movie: TmdbMovie, director?: string): SavedMovie {
  return {
    id: movie.id,
    title: movie.title,
    posterPath: movie.poster_path,
    releaseDate: movie.release_date ?? '',
    voteAverage: movie.vote_average ?? 0,
    genreIds: movie.genre_ids ?? movie.genres?.map((genre) => genre.id) ?? [],
    overview: movie.overview ?? '',
    director,
  }
}

/** Обратное превращение: карточка коллекции использует тот же MovieCard, что и каталог. */
export function savedToSummary(movie: SavedMovie): MovieSummary {
  return {
    id: movie.id,
    title: movie.title,
    overview: movie.overview,
    posterPath: movie.posterPath,
    backdropPath: null,
    releaseDate: movie.releaseDate,
    voteAverage: movie.voteAverage,
    genreIds: movie.genreIds,
  }
}
