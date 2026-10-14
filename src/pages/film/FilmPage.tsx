import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { useShallow } from 'zustand/react/shallow'
import { Button } from '../../components/ui/Button'
import { EmptyState } from '../../components/ui/EmptyState'
import { SkeletonCard } from '../../components/ui/SkeletonCard'
import { controlClass, Field } from '../../components/ui/Field'
import { MovieGrid } from '../../components/movie-card/MovieGrid'
import { MovieHero } from '../../features/film-details/MovieHero'
import { TrailerDialog } from '../../features/film-details/TrailerDialog'
import { useMovieDetails } from '../../hooks/useCatalog'
import { usePageTitle } from '../../hooks/usePageTitle'
import { asSummary, toSavedMovie } from '../../lib/movies'
import { tmdbImage } from '../../services/tmdb/images'
import { useCinemaStore } from '../../stores/cinema.store'

/**
 * Страница фильма читает id из адреса (`/film/843` → "843").
 * Запрос к TMDB делает хук useMovieDetails. Кнопки коллекции пишут в Zustand.
 * Это два разных источника данных на одном экране, и они не смешиваются.
 */
export function FilmPage() {
  const params = useParams()
  const id = Number(params.id)
  const details = useMovieDetails(id)
  const movie = details.data
  usePageTitle(movie ? `${movie.title} — FRAME` : 'Film — FRAME')

  const flags = useCinemaStore(
    useShallow((state) => ({
      favorite: state.favorites.some((item) => item.id === id),
      watchlist: state.watchlist.some((item) => item.id === id),
      watched: state.watched.some((item) => item.id === id),
      rating: state.ratings[String(id)] ?? null,
      note: state.notes[String(id)] ?? '',
      collections: state.collections,
    })),
  )
  const toggleFavorite = useCinemaStore((state) => state.toggleFavorite)
  const toggleWatchlist = useCinemaStore((state) => state.toggleWatchlist)
  const toggleWatched = useCinemaStore((state) => state.toggleWatched)
  const remember = useCinemaStore((state) => state.remember)
  const setRating = useCinemaStore((state) => state.setRating)
  const setNote = useCinemaStore((state) => state.setNote)
  const addToCollection = useCinemaStore((state) => state.addToCollection)

  const directors = unique(
    movie?.credits?.crew.filter((person) => person.job === 'Director').map((person) => person.name) ?? [],
  )
  const directorLabel = directors.join(', ')
  const trailer = movie?.videos?.results.find(
    (video) => video.site === 'YouTube' && (video.type === 'Trailer' || video.type === 'Teaser'),
  )
  const [trailerOpen, setTrailerOpen] = useState(false)
  const [note, setNoteDraft] = useState(flags.note)

  useEffect(() => {
    setNoteDraft(flags.note)
  }, [flags.note])

  useEffect(() => {
    if (!movie || (!flags.favorite && !flags.watchlist && !flags.watched)) return
    remember(toSavedMovie(movie, directorLabel || undefined))
  }, [movie, directorLabel, flags.favorite, flags.watchlist, flags.watched, remember])

  if (!Number.isFinite(id) || id <= 0) {
    return <EmptyState title="This frame is empty." body="The address does not point at a film." />
  }

  if (details.isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-[220px_1fr]">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    )
  }

  if (details.isError || !movie) {
    return (
      <EmptyState
        title="This film could not be opened."
        body={details.error instanceof Error ? details.error.message : 'TMDB did not return this title.'}
        action={
          <Button variant="ghost" onClick={() => void details.refetch()}>
            Try again
          </Button>
        }
      />
    )
  }

  const snapshot = toSavedMovie(movie, directorLabel || undefined)
  const cast = movie.credits?.cast.slice(0, 10) ?? []
  const similar = (movie.similar?.results ?? []).slice(0, 8).map(asSummary)

  return (
    <article className="space-y-16">
      <MovieHero
        movie={movie}
        director={directorLabel || undefined}
        favorite={flags.favorite}
        onWatchlist={flags.watchlist}
        watched={flags.watched}
        onFavorite={() => toggleFavorite(snapshot)}
        onToggleWatchlist={() => toggleWatchlist(snapshot)}
        onToggleWatched={() => toggleWatched(snapshot)}
        onTrailer={trailer ? () => setTrailerOpen(true) : undefined}
      />

      <section className="grid gap-12 lg:grid-cols-[1.4fr_0.8fr]">
        <div>
          <p className="eyebrow">Synopsis</p>
          <p className="mt-4 max-w-2xl text-base leading-7 text-ink/90">
            {movie.overview || 'TMDB has no synopsis for this title in the current language.'}
          </p>
          {directors.length > 0 ? (
            <p className="mt-6 text-sm text-muted">
              Directed by <span className="text-ink">{directorLabel}</span>
            </p>
          ) : null}
        </div>
        <div className="space-y-5 border border-ink/10 bg-surface p-5">
          <Field label="Your rating">
            <select
              className={controlClass}
              value={flags.rating ?? ''}
              onChange={(event) => setRating(id, event.target.value ? Number(event.target.value) : null)}
            >
              <option value="">No rating</option>
              {Array.from({ length: 10 }, (_, index) => index + 1).map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Private note">
            <textarea
              className={`${controlClass} min-h-28 resize-y`}
              value={note}
              onChange={(event) => setNoteDraft(event.target.value)}
              onBlur={() => setNote(id, note)}
              placeholder="A line for yourself, not for the public."
            />
          </Field>
          <Field label="Add to a list" hint="Lists are yours. A share link carries a copy, not a public page.">
            {flags.collections.length === 0 ? (
              <Link to="/my-cinema" className="text-sm text-gold">
                Create a list in My Cinema
              </Link>
            ) : (
              <select
                className={controlClass}
                value=""
                onChange={(event) => {
                  if (!event.target.value) return
                  addToCollection(event.target.value, snapshot)
                }}
              >
                <option value="">Choose a list</option>
                {flags.collections.map((collection) => (
                  <option key={collection.id} value={collection.id}>
                    {collection.name}
                  </option>
                ))}
              </select>
            )}
          </Field>
        </div>
      </section>

      {cast.length > 0 ? (
        <section>
          <h2 className="font-display text-3xl text-ink">Cast</h2>
          <ul className="mt-6 flex gap-4 overflow-x-auto pb-2">
            {cast.map((person) => {
              const photo = tmdbImage(person.profile_path, 'profile')
              return (
                <li key={`${person.id}-${person.character}`} className="w-28 shrink-0">
                  <div className="aspect-[2/3] bg-surface">
                    {photo ? <img src={photo} alt="" className="h-full w-full object-cover" /> : null}
                  </div>
                  <p className="mt-2 text-sm text-ink">{person.name}</p>
                  <p className="text-xs text-muted">{person.character}</p>
                </li>
              )
            })}
          </ul>
        </section>
      ) : null}

      {similar.length > 0 ? (
        <section>
          <h2 className="mb-6 font-display text-3xl text-ink">If this stayed with you</h2>
          <MovieGrid movies={similar} />
        </section>
      ) : null}

      {trailer ? (
        <TrailerDialog
          open={trailerOpen}
          title={trailer.name || `${movie.title} trailer`}
          youtubeKey={trailer.key}
          onClose={() => setTrailerOpen(false)}
        />
      ) : null}
    </article>
  )
}

function unique(values: string[]) {
  return [...new Set(values)]
}
