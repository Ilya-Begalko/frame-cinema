import { Link } from 'react-router'
import { Button } from '../../components/ui/Button'
import { EmptyState } from '../../components/ui/EmptyState'
import { controlClass, Field } from '../../components/ui/Field'
import type { SavedMovie } from '../../features/collections/types'
import { yearOf } from '../../lib/format'
import { tmdbImage } from '../../services/tmdb/images'
import { useCinemaStore } from '../../stores/cinema.store'

interface MovieShelfProps {
  movies: SavedMovie[]
  kind: 'watchlist' | 'watched' | 'favorites'
  emptyTitle: string
  emptyBody: string
}

/**
 * Полка личных фильмов. Оценка и заметка пишутся в то же хранилище,
 * что и на странице фильма: id общий, поэтому текст не раздваивается.
 */
export function MovieShelf({ movies, kind, emptyTitle, emptyBody }: MovieShelfProps) {
  const ratings = useCinemaStore((state) => state.ratings)
  const notes = useCinemaStore((state) => state.notes)
  const setRating = useCinemaStore((state) => state.setRating)
  const setNote = useCinemaStore((state) => state.setNote)
  const toggleFavorite = useCinemaStore((state) => state.toggleFavorite)
  const toggleWatchlist = useCinemaStore((state) => state.toggleWatchlist)
  const toggleWatched = useCinemaStore((state) => state.toggleWatched)

  if (movies.length === 0) {
    return <EmptyState title={emptyTitle} body={emptyBody} action={<Button to="/explore">Explore</Button>} />
  }

  return (
    <ul>
      {movies.map((movie) => {
        const poster = tmdbImage(movie.posterPath, 'poster')
        return (
          <li key={movie.id} className="grid gap-5 border-t border-ink/10 py-6 md:grid-cols-[112px_1fr]">
            <Link to={`/film/${movie.id}`} className="block aspect-[2/3] bg-surface">
              {poster ? <img src={poster} alt="" className="h-full w-full object-cover" /> : null}
            </Link>
            <div>
              <Link to={`/film/${movie.id}`} className="font-display text-2xl text-ink">
                {movie.title}
              </Link>
              <p className="eyebrow mt-1 text-[11px]">
                {yearOf(movie.releaseDate)}
                {movie.director ? ` · ${movie.director}` : ''}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {kind !== 'favorites' ? (
                  <Button variant="ghost" onClick={() => toggleFavorite(movie)}>
                    Favorite
                  </Button>
                ) : (
                  <Button variant="ghost" onClick={() => toggleFavorite(movie)}>
                    Remove
                  </Button>
                )}
                {kind === 'watchlist' ? (
                  <Button variant="ghost" onClick={() => toggleWatched(movie)}>
                    Mark watched
                  </Button>
                ) : null}
                {kind === 'watched' ? (
                  <Button variant="ghost" onClick={() => toggleWatched(movie)}>
                    Unmark
                  </Button>
                ) : null}
                {kind === 'watchlist' ? (
                  <Button variant="text" onClick={() => toggleWatchlist(movie)}>
                    Remove
                  </Button>
                ) : null}
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-[140px_1fr]">
                <Field label="Your rating">
                  <select
                    className={controlClass}
                    value={ratings[String(movie.id)] ?? ''}
                    onChange={(event) =>
                      setRating(movie.id, event.target.value ? Number(event.target.value) : null)
                    }
                  >
                    <option value="">—</option>
                    {Array.from({ length: 10 }, (_, index) => index + 1).map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Note">
                  <textarea
                    className={`${controlClass} min-h-20`}
                    defaultValue={notes[String(movie.id)] ?? ''}
                    key={`${movie.id}-${notes[String(movie.id)] ?? ''}`}
                    onBlur={(event) => setNote(movie.id, event.target.value)}
                  />
                </Field>
              </div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
