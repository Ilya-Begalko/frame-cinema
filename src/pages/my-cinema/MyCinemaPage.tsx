import { useState } from 'react'
import { MovieShelf } from './MovieShelf'
import { CollectionsPanel } from './CollectionsPanel'
import { StatsPanel } from './StatsPanel'
import { TransferPanel } from './TransferPanel'
import { usePageTitle } from '../../hooks/usePageTitle'
import { cn } from '../../lib/cn'
import { useCinemaStore } from '../../stores/cinema.store'

const TABS = [
  { id: 'watchlist', label: 'To watch' },
  { id: 'watched', label: 'Watched' },
  { id: 'favorites', label: 'Favorites' },
  { id: 'collections', label: 'Lists' },
  { id: 'stats', label: 'Statistics' },
] as const

type TabId = (typeof TABS)[number]['id']

/**
 * Личный зал. Вкладка — временное состояние экрана (useState).
 * Сами списки берутся из Zustand и переживают закрытие вкладки браузера.
 */
export function MyCinemaPage() {
  usePageTitle('My Cinema — FRAME')
  const [tab, setTab] = useState<TabId>('watchlist')
  const watchlist = useCinemaStore((state) => state.watchlist)
  const watched = useCinemaStore((state) => state.watched)
  const favorites = useCinemaStore((state) => state.favorites)

  return (
    <div>
      <p className="eyebrow text-gold">03 · My Cinema</p>
      <h1 className="mt-3 font-display text-4xl text-ink md:text-6xl">The films you kept.</h1>
      <div className="mt-8 flex gap-4 overflow-x-auto border-b border-ink/10" role="tablist">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            onClick={() => setTab(item.id)}
            className={cn(
              'shrink-0 border-b-2 px-1 pb-3 text-sm tracking-[0.12em] uppercase',
              tab === item.id ? 'border-gold text-gold' : 'border-transparent text-muted',
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="mt-8" role="tabpanel">
        {tab === 'watchlist' ? (
          <MovieShelf
            kind="watchlist"
            movies={watchlist}
            emptyTitle="Nothing waiting."
            emptyBody="When a film should be tonight, or some other night, put it on this list."
          />
        ) : null}
        {tab === 'watched' ? (
          <MovieShelf
            kind="watched"
            movies={watched}
            emptyTitle="The seats are empty."
            emptyBody="Mark a film as watched and it will count toward your genres and directors."
          />
        ) : null}
        {tab === 'favorites' ? (
          <MovieShelf
            kind="favorites"
            movies={favorites}
            emptyTitle="No favorites yet."
            emptyBody="A favorite is not a plan to watch. It is a film you want to be able to find again."
          />
        ) : null}
        {tab === 'collections' ? <CollectionsPanel /> : null}
        {tab === 'stats' ? <StatsPanel /> : null}
      </div>
      <div className="mt-16">
        <TransferPanel />
      </div>
    </div>
  )
}
