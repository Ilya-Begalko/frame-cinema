import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'

/**
 * QueryClient хранит серверные данные: ответы TMDB, их возраст и статус загрузки.
 * Это не место для избранного. Избранное — данные пользователя, они лежат в Zustand.
 *
 * staleTime: минуту ответ считается свежим и не запрашивается снова.
 * retry: одна повторная попытка, если сеть мигнула.
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

/**
 * Provider — компонент, который кладёт значение в контекст для всех потомков.
 * Сам по себе он ничего не рисует: children — это всё приложение внутри него.
 */
export function Providers({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
