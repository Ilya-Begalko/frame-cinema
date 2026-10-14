import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { MovieShelf } from '../pages/my-cinema/MovieShelf'
import { emptyLibrary } from '../features/collections/library'
import type { SavedMovie } from '../features/collections/types'
import { useCinemaStore } from './cinema.store'

const portrait: SavedMovie = {
  id: 194,
  title: 'Amélie',
  posterPath: null,
  releaseDate: '2001-04-25',
  voteAverage: 7.9,
  genreIds: [35, 10749],
  overview: 'A young woman decides to change the lives around her.',
}

/** Как на странице My Cinema: полка получает список из хранилища, а не держит его сама. */
function FavoritesShelf() {
  const favorites = useCinemaStore((state) => state.favorites)
  return (
    <MovieShelf kind="favorites" movies={favorites} emptyTitle="No favorites yet." emptyBody="Nothing here." />
  )
}

beforeEach(() => {
  localStorage.clear()
  useCinemaStore.setState(emptyLibrary())
})

describe('cinema store', () => {
  it('сохраняет избранное в localStorage', () => {
    useCinemaStore.getState().toggleFavorite(portrait)
    const raw = localStorage.getItem('frame-cinema')
    expect(raw).toContain('Amélie')
  })

  it('кнопка полки убирает фильм из избранного', async () => {
    useCinemaStore.getState().toggleFavorite(portrait)
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <FavoritesShelf />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: 'Remove' }))
    expect(useCinemaStore.getState().favorites).toEqual([])
    expect(screen.getByText('No favorites yet.')).toBeInTheDocument()
  })
})
