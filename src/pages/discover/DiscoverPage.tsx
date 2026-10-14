import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '../../components/ui/Button'
import { EmptyState } from '../../components/ui/EmptyState'
import { SkeletonCard } from '../../components/ui/SkeletonCard'
import { MovieCard } from '../../components/movie-card/MovieCard'
import { MoodSelector } from '../../features/mood-matching/MoodSelector'
import type { MoodId } from '../../features/mood-matching/moods'
import { PROGRAMME, tonightsPair } from '../../features/discovery/programme'
import { useSurpriseMe } from '../../features/discovery/useSurprise'
import { usePageTitle } from '../../hooks/usePageTitle'
import { asSummary } from '../../lib/movies'
import { getMoviesByIds } from '../../services/tmdb/movies.api'
import { useCinemaStore } from '../../stores/cinema.store'

/**
 * Главная собирает чужие данные (подборку TMDB) и местный выбор настроения.
 * Настроение здесь — обычный useState: оно нужно, только пока человек на этой странице.
 * Кнопка Explore уносит выбор в URL уже следующего экрана.
 */
const PROGRAMME_IDS = PROGRAMME.map((item) => item.id)

export function DiscoverPage() {
  usePageTitle('FRAME — Find films by feeling')
  const language = useCinemaStore((state) => state.language)
  const [moods, setMoods] = useState<MoodId[]>([])
  const { surprise, pending, message } = useSurpriseMe()
  const pair = tonightsPair()

  // Опции запроса нельзя собирать заново на каждом кадре.
  // Иначе TanStack Query видит новый queryKey и перезапускает загрузку без конца.
  const programmeQuery = useMemo(
    () => ({
      queryKey: ['programme', PROGRAMME_IDS, language] as const,
      queryFn: () => getMoviesByIds(PROGRAMME_IDS, language),
    }),
    [language],
  )
  const doubleFeatureQuery = useMemo(
    () => ({
      queryKey: ['double-feature', pair.ids, language] as const,
      queryFn: () => getMoviesByIds(pair.ids, language),
    }),
    [language, pair],
  )
  const programme = useQuery(programmeQuery)
  const doubleFeature = useQuery(doubleFeatureQuery)

  const programmeMovies = programme.data?.map(asSummary) ?? []
  const feature = programmeMovies[0]
  const rest = programmeMovies.slice(1)
  const featureKicker = PROGRAMME.find((item) => item.id === feature?.id)?.kicker
  const exploreTo = moods.length > 0 ? `/explore?moods=${moods.join(',')}` : '/explore'

  return (
    <div className="space-y-20">
      <section className="grid items-end gap-12 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <p className="eyebrow text-gold">Frame · Cinema Club</p>
          <h1 className="mt-4 max-w-4xl font-display text-[40px] leading-[0.95] text-ink sm:text-6xl lg:text-[76px]">
            Find films by the way <span className="text-gold italic">they make you feel.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-muted">
            A private screening room organised by mood. The catalogue comes from TMDB. Your lists stay in this browser.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button to={exploreTo}>Explore by mood</Button>
            <Button variant="ghost" onClick={() => void surprise(moods)} disabled={pending}>
              {pending ? 'Looking…' : 'Surprise me'}
            </Button>
          </div>
          {message ? <p className="mt-4 text-sm text-gold">{message}</p> : null}
        </div>
        <div className="lg:col-span-5">
          {programme.isLoading ? <SkeletonCard /> : null}
          {feature ? <MovieCard movie={feature} kicker={featureKicker} size="feature" /> : null}
        </div>
      </section>

      <section>
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">What are you in the mood for?</p>
            <h2 className="mt-2 font-display text-3xl text-ink md:text-4xl">Six feelings, not a genre menu.</h2>
          </div>
        </div>
        <MoodSelector value={moods} onChange={setMoods} />
      </section>

      <section>
        <p className="eyebrow">The programme</p>
        <h2 className="mt-2 max-w-xl font-display text-3xl text-ink md:text-4xl">Films worth starting the evening with.</h2>
        {programme.isError ? (
          <div className="mt-8">
            <EmptyState
              title="The programme is dark tonight."
              body={programme.error instanceof Error ? programme.error.message : 'TMDB could not be reached.'}
              action={
                <Button variant="ghost" onClick={() => void programme.refetch()}>
                  Try again
                </Button>
              }
            />
          </div>
        ) : null}
        {programme.isLoading ? (
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        ) : null}
        {rest.length > 0 ? (
          <div className="mt-8 grid gap-8 md:grid-cols-2 xl:grid-cols-4">
            {rest.map((movie, index) => (
              <div key={movie.id} className={index === 0 ? 'md:col-span-2 xl:col-span-2' : undefined}>
                <MovieCard
                  movie={movie}
                  kicker={PROGRAMME.find((item) => item.id === movie.id)?.kicker}
                  size={index === 0 ? 'feature' : 'regular'}
                />
              </div>
            ))}
          </div>
        ) : null}
      </section>

      <section className="border-t border-ink/10 pt-16">
        <p className="eyebrow">Tonight&apos;s double feature</p>
        <h2 className="mt-2 font-display text-3xl text-ink md:text-4xl">{pair.title}</h2>
        <p className="mt-3 max-w-xl text-muted">{pair.note}</p>
        {doubleFeature.isLoading ? (
          <div className="mt-8 grid gap-8 md:grid-cols-2">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : null}
        {doubleFeature.data ? (
          <div className="mt-8 grid gap-10 md:grid-cols-2">
            {doubleFeature.data.map(asSummary).map((movie) => (
              <MovieCard key={movie.id} movie={movie} size="feature" />
            ))}
          </div>
        ) : null}
      </section>
    </div>
  )
}
