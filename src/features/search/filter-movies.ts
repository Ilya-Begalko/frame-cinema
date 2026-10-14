import type { MovieSummary } from '../../services/tmdb/movies.types'
import type { ExploreParams } from './explore-params'

/**
 * Вторая, уже клиентская, проходка по результатам.
 * Для discover TMDB часто отфильтровал список сам. Для текстового поиска —
 * нет: год, жанр, рейтинг и страну приходится проверить здесь.
 * Если страна у фильма не пришла, мы его не прячем: иначе поиск стал бы пустым.
 */
export function filterMovies<T extends MovieSummary>(
  movies: readonly T[],
  params: Pick<ExploreParams, 'genre' | 'year' | 'country' | 'rating'>,
) {
  return movies.filter((movie) => {
    if (params.genre && !movie.genreIds.includes(Number(params.genre))) return false
    if (params.year && !movie.releaseDate.startsWith(params.year)) return false
    if (params.rating && movie.voteAverage < Number(params.rating)) return false
    if (
      params.country &&
      movie.originCountry &&
      movie.originCountry.length > 0 &&
      !movie.originCountry.includes(params.country)
    ) {
      return false
    }
    return true
  })
}
