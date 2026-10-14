import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

/**
 * Vitest не включает глобальный afterEach сам.
 * cleanup снимает предыдущий экран, чтобы следующий тест не видел чужие кнопки.
 */
afterEach(() => {
  cleanup()
})
