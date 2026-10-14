import { useMemo, useState } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router'
import { Button } from '../../components/ui/Button'
import { Dialog } from '../../components/ui/Dialog'
import { EmptyState } from '../../components/ui/EmptyState'
import { SearchInput } from '../../components/ui/SearchInput'
import { SkeletonCard } from '../../components/ui/SkeletonCard'
import { MovieGrid } from '../../components/movie-card/MovieGrid'
import { filterMovies } from '../../features/search/filter-movies'
import { parseExploreParams, toSearchParams, type ExploreParams } from '../../features/search/explore-params'
import { FilterPanel } from '../../features/search/FilterPanel'
import { rankByMood, type ScoreInput } from '../../features/mood-matching/rank'
import { usePageTitle } from '../../hooks/usePageTitle'
import { asSummary } from '../../lib/movies'
import { exploreCatalog } from '../../services/tmdb/movies.api'
import type { MovieSummary } from '../../services/tmdb/movies.types'
import { useCinemaStore } from '../../stores/cinema.store'

function toScore(movie: MovieSummary): ScoreInput {
  return {
    id: movie.id,
    overview: movie.overview,
    genreIds: movie.genreIds,
    voteAverage: movie.voteAverage,
  }
}

/**
 * Фильтры живут в URL, а не в useState.
 * Обновление страницы и ссылка другу сохраняют тот же каталог.
 * setSearchParams — способ React Router записать новый адрес без перезагрузки.
 */
export function ExplorePage() {
  usePageTitle('Explore — FRAME')
  const [searchParams, setSearchParams] = useSearchParams()
  const [filtersOpen, setFiltersOpen] = useState(false)
  const params = parseExploreParams(searchParams)
  const language = useCinemaStore((state) => state.language)

  const catalog = useQuery({
    queryKey: ['explore', language, params],
    queryFn: () => exploreCatalog(params, language),
    placeholderData: keepPreviousData,
  })

  function update(partial: Partial<ExploreParams>) {
    const next = { ...params, ...partial, page: partial.page ?? 1 }
    setSearchParams(toSearchParams(next), { replace: true })
  }

  const movies = useMemo(() => {
    const summaries = (catalog.data?.movies ?? []).map(asSummary)
    return rankByMood(filterMovies(summaries, params), toScore, params.moods, params.style)
  }, [catalog.data, params])

  const directed = useMemo(() => {
    const summaries = (catalog.data?.directed ?? []).map(asSummary)
    return rankByMood(filterMovies(summaries, params), toScore, params.moods, params.style)
  }, [catalog.data, params])

  const hasFilters =
    params.moods.length > 0 ||
    Boolean(params.style || params.genre || params.year || params.country || params.rating || params.q)

  return (
    <div>
      <p className="eyebrow text-gold">02 · Explore</p>
      <h1 className="mt-3 max-w-3xl font-display text-4xl text-ink md:text-6xl">Search the room, not just the title.</h1>
      <div className="mt-8">
        <SearchInput
          label="Search by title or director"
          placeholder="Title or director"
          value={params.q}
          onChange={(q) => update({ q })}
        />
      </div>

      <div className="mt-8 lg:hidden">
        <Button variant="ghost" onClick={() => setFiltersOpen(true)}>
          Filters
        </Button>
        <Dialog open={filtersOpen} title="Filters" onClose={() => setFiltersOpen(false)}>
          <FilterPanel params={params} onChange={update} />
        </Dialog>
      </div>

      <div className="mt-10 grid gap-12 lg:grid-cols-[280px_1fr]">
        <aside className="hidden lg:block">
          <FilterPanel params={params} onChange={update} />
          {hasFilters ? (
            <button type="button" className="eyebrow mt-6 text-gold" onClick={() => setSearchParams(new URLSearchParams())}>
              Clear filters
            </button>
          ) : null}
        </aside>

        <div className="space-y-12">
          {catalog.isLoading ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {Array.from({ length: 6 }, (_, index) => (
                <SkeletonCard key={index} />
              ))}
            </div>
          ) : null}

          {catalog.isError ? (
            <EmptyState
              title="The catalogue did not answer."
              body={catalog.error instanceof Error ? catalog.error.message : 'Check the TMDB key and try again.'}
              action={
                <Button variant="ghost" onClick={() => void catalog.refetch()}>
                  Try again
                </Button>
              }
            />
          ) : null}

          {catalog.data && movies.length === 0 && directed.length === 0 ? (
            <EmptyState
              title="No films in this frame."
              body="Try another title, loosen the year, or pick a different mood."
            />
          ) : null}

          {movies.length > 0 ? (
            <section>
              <h2 className="mb-6 font-display text-3xl text-ink">{params.q ? 'Titles' : 'In the catalogue'}</h2>
              <MovieGrid movies={movies} />
            </section>
          ) : null}

          {catalog.data?.director && directed.length > 0 ? (
            <section>
              <h2 className="mb-6 font-display text-3xl text-ink">Directed by {catalog.data.director.name}</h2>
              <MovieGrid movies={directed} />
            </section>
          ) : null}

          {catalog.data && catalog.data.totalPages > 1 ? (
            <div className="flex items-center justify-between border-t border-ink/10 pt-6">
              <Button variant="ghost" disabled={params.page <= 1} onClick={() => update({ page: params.page - 1 })}>
                Previous
              </Button>
              <p className="eyebrow">
                Page {params.page} / {catalog.data.totalPages}
              </p>
              <Button
                variant="ghost"
                disabled={params.page >= catalog.data.totalPages}
                onClick={() => update({ page: params.page + 1 })}
              >
                Next
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
