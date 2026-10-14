import { useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { discoverMovies } from '../../services/tmdb/movies.api'
import { asSummary } from '../../lib/movies'
import { useCinemaStore } from '../../stores/cinema.store'
import type { MoodId } from '../mood-matching/moods'
import { discoverGenreParam } from '../mood-matching/moods'
import { pickSurprise } from '../mood-matching/rank'
import type { ScoreInput } from '../mood-matching/rank'
import type { MovieSummary } from '../../services/tmdb/movies.types'

function summaryToScore(movie: MovieSummary): ScoreInput {
  return {
    id: movie.id,
    overview: movie.overview,
    genreIds: movie.genreIds,
    voteAverage: movie.voteAverage,
  }
}

/**
 * Берёт три страницы подходящих фильмов, выкидывает просмотренные
 * и открывает случайный из восьми сильнейших.
 */
export function useSurpriseMe() {
  const language = useCinemaStore((state) => state.language)
  const watched = useCinemaStore((state) => state.watched)
  // map внутри селектора Zustand каждый раз даёт новый массив.
  // React считает, что хранилище изменилось, и перерисовывает экран без конца.
  const watchedIds = useMemo(() => watched.map((movie) => movie.id), [watched])
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  async function surprise(moods: readonly MoodId[]) {
    setPending(true)
    setMessage(null)
    try {
      const genres = discoverGenreParam(moods, '', '')
      const pages = await Promise.all(
        [1, 2, 3].map((page) =>
          queryClient.fetchQuery({
            queryKey: ['surprise', language, genres ?? 'any', page],
            queryFn: () =>
              discoverMovies({
                language,
                page,
                sort_by: 'popularity.desc',
                include_adult: false,
                'vote_count.gte': 150,
                with_genres: genres,
              }),
          }),
        ),
      )
      const movies = pages.flatMap((page) => page.results.map(asSummary))
      const pick = pickSurprise(movies, summaryToScore, moods, '', watchedIds)
      if (!pick) {
        setMessage('Nothing unseen matches this feeling yet.')
        return
      }
      navigate(`/film/${pick.id}`)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Surprise me could not reach the catalogue.')
    } finally {
      setPending(false)
    }
  }

  return { surprise, pending, message }
}
