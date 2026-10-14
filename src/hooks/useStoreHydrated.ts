import { useEffect, useState } from 'react'
import { useCinemaStore } from '../stores/cinema.store'

/**
 * localStorage читается сразу после первого кадра.
 * Пока чтение не закончилось, кнопки «в избранное» лучше не показывать:
 * клик мог бы записаться, а затем старые данные затёрли бы его при гидрации.
 */
export function useStoreHydrated() {
  const [hydrated, setHydrated] = useState(() => useCinemaStore.persist.hasHydrated())

  useEffect(() => {
    setHydrated(useCinemaStore.persist.hasHydrated())
    return useCinemaStore.persist.onFinishHydration(() => setHydrated(true))
  }, [])

  return hydrated
}
