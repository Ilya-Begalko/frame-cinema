import { useQuery } from '@tanstack/react-query'
import { useCinemaStore } from '../stores/cinema.store'
import { getMovieDetails, getMoviesByIds } from '../services/tmdb/movies.api'

/**
 * Хуки ниже связывают экран с TMDB.
 * queryKey — адрес данных в кэше. Если язык или id меняется, это уже другой запрос.
 */
export function useMovieDetails(id: number) {
  const language = useCinemaStore((state) => state.language)
  return useQuery({
    queryKey: ['movie', id, language],
    queryFn: () => getMovieDetails(id, language),
    enabled: Number.isFinite(id) && id > 0,
  })
}

export function useProgramme(ids: readonly number[]) {
  const language = useCinemaStore((state) => state.language)
  return useQuery({
    queryKey: ['programme', ids, language],
    queryFn: () => getMoviesByIds(ids, language),
  })
}
