import { Link } from 'react-router'
import { formatRating, yearOf } from '../../lib/format'
import { cn } from '../../lib/cn'
import { tmdbImage } from '../../services/tmdb/images'
import type { MovieSummary } from '../../services/tmdb/movies.types'

interface MovieCardProps {
  movie: MovieSummary
  kicker?: string
  size?: 'regular' | 'feature'
}

/**
 * Карточка — чистый компонент: она получает фильм через props и ничего не запрашивает.
 * Наведение увеличено слегка, картинка масштабируется отдельно, снизу проявляется синопсис.
 * Заголовок виден и без наведения, чтобы на телефоне фильм не остался безымянным.
 */
export function MovieCard({ movie, kicker, size = 'regular' }: MovieCardProps) {
  const poster = tmdbImage(movie.posterPath, 'poster')

  return (
    <article className={cn('group transition duration-300 hover:scale-[1.02]', size === 'feature' && 'md:max-w-sm')}>
      <Link to={`/film/${movie.id}`} className="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold">
        <div className="relative aspect-[2/3] overflow-hidden bg-surface">
          {poster ? (
            <img
              src={poster}
              alt=""
              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-end bg-wine/50 p-4">
              <span className="font-display text-3xl text-ink">{movie.title}</span>
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 translate-y-2 bg-gradient-to-t from-background via-background/85 to-transparent p-4 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <p className="eyebrow text-[11px] text-gold">
              {yearOf(movie.releaseDate)} · {formatRating(movie.voteAverage)}
            </p>
            {movie.overview ? <p className="mt-2 line-clamp-3 text-sm leading-5 text-ink">{movie.overview}</p> : null}
          </div>
        </div>
        <div className="mt-3">
          {kicker ? <p className="eyebrow mb-1 text-[11px] text-gold">{kicker}</p> : null}
          <h3 className={cn('font-display text-ink', size === 'feature' ? 'text-3xl' : 'text-lg')}>{movie.title}</h3>
          <p className="eyebrow mt-1 text-[11px]">
            {yearOf(movie.releaseDate)} · {formatRating(movie.voteAverage)}
          </p>
        </div>
      </Link>
    </article>
  )
}
