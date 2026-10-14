import { useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router'
import { Button } from '../../components/ui/Button'
import { EmptyState } from '../../components/ui/EmptyState'
import { MovieGrid } from '../../components/movie-card/MovieGrid'
import { decodeSharedCollection } from '../../features/collections/transfer'
import { savedToSummary } from '../../lib/movies'
import { usePageTitle } from '../../hooks/usePageTitle'
import { useCinemaStore } from '../../stores/cinema.store'

/**
 * Публичность без сервера: подборка закодирована в hash после #.
 * Hash не отправляется на сервер, даже если сайт позже получит backend.
 */
export function SharedCollectionPage() {
  usePageTitle('Shared list — FRAME')
  const location = useLocation()
  const importShared = useCinemaStore((state) => state.importShared)
  const [saved, setSaved] = useState(false)
  const payload = location.hash.startsWith('#') ? location.hash.slice(1) : ''

  const result = useMemo(() => {
    if (!payload) return { error: 'This address has no list attached to it.' }
    try {
      return { collection: decodeSharedCollection(payload) }
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'This link could not be read.' }
    }
  }, [payload])

  if (!result.collection) {
    return <EmptyState title="The link did not open." body={result.error ?? 'Try exporting JSON instead.'} />
  }

  const collection = result.collection

  return (
    <div>
      <p className="eyebrow text-gold">Shared list</p>
      <h1 className="mt-3 font-display text-4xl text-ink md:text-6xl">{collection.name}</h1>
      {collection.description ? <p className="mt-4 max-w-2xl text-muted">{collection.description}</p> : null}
      <div className="mt-6 flex flex-wrap gap-3">
        <Button
          onClick={() => {
            importShared(collection)
            setSaved(true)
          }}
        >
          {saved ? 'Saved in this browser' : 'Save in this browser'}
        </Button>
        <Button to="/my-cinema" variant="ghost">
          My Cinema
        </Button>
      </div>
      {saved ? (
        <p className="mt-4 text-sm text-gold">
          The list is now in <Link to="/my-cinema">My Cinema</Link>. It is a copy, not a live connection.
        </p>
      ) : null}
      <div className="mt-10">
        <MovieGrid movies={collection.movies.map(savedToSummary)} />
      </div>
    </div>
  )
}
