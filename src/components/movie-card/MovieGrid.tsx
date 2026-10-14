import type { MovieSummary } from '../../services/tmdb/movies.types'
import { MovieCard } from './MovieCard'

/**
 * Сетка сама перестраивается по ширине:
 * до 767px — две колонки, от 768 — три, от 1280 — четыре, на очень широком экране — пять.
 */
export function MovieGrid({ movies }: { movies: MovieSummary[] }) {
  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
      {movies.map((movie) => (
        <li key={movie.id}>
          <MovieCard movie={movie} />
        </li>
      ))}
    </ul>
  )
}
