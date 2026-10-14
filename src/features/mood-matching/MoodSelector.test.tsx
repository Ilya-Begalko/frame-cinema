import { useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { MoodSelector } from './MoodSelector'
import type { MoodId } from './moods'

/** Мини-родитель: селектор сам состояние не хранит, его держит тот, кто его вызвал. */
function Harness() {
  const [value, setValue] = useState<MoodId[]>([])
  return <MoodSelector value={value} onChange={setValue} />
}

describe('MoodSelector', () => {
  it('включает и выключает настроение', async () => {
    const user = userEvent.setup()
    render(<Harness />)

    const dreamlike = screen.getByRole('button', { name: /Dreamlike/ })
    expect(dreamlike).toHaveAttribute('aria-pressed', 'false')

    await user.click(dreamlike)
    expect(dreamlike).toHaveAttribute('aria-pressed', 'true')

    await user.click(dreamlike)
    expect(dreamlike).toHaveAttribute('aria-pressed', 'false')
  })
})
