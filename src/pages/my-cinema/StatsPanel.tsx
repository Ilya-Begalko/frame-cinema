import { useMemo } from 'react'
import { computeStats } from '../../features/collections/stats'
import { useCinemaStore } from '../../stores/cinema.store'

/**
 * Цифры не хранятся отдельно: они считаются из списков.
 * Считать нужно после селектора. Новый объект прямо в useCinemaStore
 * заставляет React перерисовывать панель бесконечно.
 */
export function StatsPanel() {
  const watched = useCinemaStore((state) => state.watched)
  const favorites = useCinemaStore((state) => state.favorites)
  const watchlist = useCinemaStore((state) => state.watchlist)
  const ratings = useCinemaStore((state) => state.ratings)
  const stats = useMemo(
    () => computeStats({ watched, favorites, watchlist, ratings }),
    [watched, favorites, watchlist, ratings],
  )

  return (
    <div className="space-y-10">
      <dl className="grid gap-6 sm:grid-cols-3">
        <Stat value={String(stats.watchedCount)} label="Watched" />
        <Stat value={String(stats.favoriteCount)} label="Favorites" />
        <Stat value={stats.averageRating === null ? '—' : stats.averageRating.toFixed(1)} label="Your average" />
      </dl>
      <div className="grid gap-10 md:grid-cols-2">
        <section>
          <h2 className="font-display text-3xl text-ink">Genres you stay with</h2>
          {stats.topGenres.length === 0 ? (
            <p className="mt-3 text-sm text-muted">Mark a few films as watched and the pattern will show up.</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {stats.topGenres.map((genre) => (
                <li key={genre.id} className="flex justify-between border-b border-ink/10 py-2 text-sm">
                  <span>{genre.name}</span>
                  <span className="text-muted">{genre.count}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section>
          <h2 className="font-display text-3xl text-ink">Directors</h2>
          {stats.topDirectors.length === 0 ? (
            <p className="mt-3 text-sm text-muted">
              Open a watched film so FRAME can remember who directed it. The catalogue list does not include that name.
            </p>
          ) : (
            <ul className="mt-4 space-y-2">
              {stats.topDirectors.map((director) => (
                <li key={director.name} className="flex justify-between border-b border-ink/10 py-2 text-sm">
                  <span>{director.name}</span>
                  <span className="text-muted">{director.count}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="border-t border-gold/60 pt-4">
      <dt className="eyebrow">{label}</dt>
      <dd className="mt-2 font-display text-5xl text-ink">{value}</dd>
    </div>
  )
}
