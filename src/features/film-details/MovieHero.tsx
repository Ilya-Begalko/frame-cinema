import { formatRating, formatRuntime, yearOf } from '../../lib/format'
import { tmdbImage } from '../../services/tmdb/images'
import type { TmdbMovieDetails } from '../../services/tmdb/movies.types'
import { Button } from '../../components/ui/Button'

interface MovieHeroProps {
  movie: TmdbMovieDetails
  director?: string
  favorite: boolean
  onWatchlist: boolean
  watched: boolean
  onFavorite: () => void
  onToggleWatchlist: () => void
  onToggleWatched: () => void
  onTrailer?: () => void
}

/** Верх страницы фильма: кадр, постер и решение, оставить ли его себе. */
export function MovieHero({
  movie,
  director,
  favorite,
  onWatchlist,
  watched,
  onFavorite,
  onToggleWatchlist,
  onToggleWatched,
  onTrailer,
}: MovieHeroProps) {
  const backdrop = tmdbImage(movie.backdrop_path, 'backdrop')
  const poster = tmdbImage(movie.poster_path, 'poster')
  const genres = movie.genres?.map((genre) => genre.name).join(' · ')

  return (
    <section className="relative -mx-5 overflow-hidden md:-mx-8">
      {backdrop ? <img src={backdrop} alt="" className="absolute inset-0 h-full w-full object-cover opacity-35" /> : null}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/75 to-background/25" />
      <div className="relative grid items-end gap-8 px-5 pt-16 pb-10 md:grid-cols-[220px_1fr] md:px-8 lg:grid-cols-[260px_1fr]">
        <div className="aspect-[2/3] max-w-[220px] overflow-hidden bg-surface lg:max-w-none">
          {poster ? <img src={poster} alt="" className="h-full w-full object-cover" /> : null}
        </div>
        <div className="max-w-3xl">
          <p className="eyebrow text-gold">{genres || 'Film'}</p>
          <h1 className="mt-3 font-display text-[40px] leading-none text-ink sm:text-6xl lg:text-[68px]">
            {movie.title}
          </h1>
          {movie.original_title && movie.original_title !== movie.title ? (
            <p className="mt-3 text-muted">{movie.original_title}</p>
          ) : null}
          <p className="eyebrow mt-5 text-[12px]">
            {yearOf(movie.release_date)}
            {movie.runtime ? ` · ${formatRuntime(movie.runtime)}` : ''}
            {typeof movie.vote_average === 'number' ? ` · TMDB ${formatRating(movie.vote_average)}` : ''}
            {director ? ` · ${director}` : ''}
          </p>
          {movie.tagline ? <p className="mt-6 max-w-xl font-display text-2xl text-ink/90 italic">{movie.tagline}</p> : null}
          <div className="mt-8 flex flex-wrap gap-3">
            <Button variant={onWatchlist ? 'primary' : 'ghost'} onClick={onToggleWatchlist}>
              {onWatchlist ? 'In watchlist' : 'Want to watch'}
            </Button>
            <Button variant={favorite ? 'primary' : 'ghost'} onClick={onFavorite}>
              {favorite ? 'In favorites' : 'Favorite'}
            </Button>
            <Button variant={watched ? 'primary' : 'ghost'} onClick={onToggleWatched}>
              {watched ? 'Watched' : 'Mark watched'}
            </Button>
            {onTrailer ? (
              <Button variant="text" onClick={onTrailer}>
                Play trailer
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}
