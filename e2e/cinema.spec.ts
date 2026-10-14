import { expect, test } from '@playwright/test'

const inception = {
  id: 27205,
  title: 'Inception',
  original_title: 'Inception',
  overview: 'A thief who steals secrets from dreams.',
  poster_path: null,
  backdrop_path: null,
  release_date: '2010-07-15',
  vote_average: 8.4,
  genre_ids: [878, 28],
  origin_country: ['US'],
}

test('поиск, избранное и перезагрузка сохраняют фильм в этом браузере', async ({ page }) => {
  await page.route('**/tmdb/**', async (route) => {
    const path = new URL(route.request().url()).pathname
    // Исходники тоже лежат в src/services/tmdb. Их нужно отдать Vite, а не заглушке.
    if (!path.startsWith('/tmdb/')) {
      await route.continue()
      return
    }

    if (path.endsWith('/search/movie')) {
      await route.fulfill({
        json: { page: 1, total_pages: 1, total_results: 1, results: [inception] },
      })
      return
    }

    if (path.endsWith('/search/person') || path.endsWith('/discover/movie')) {
      await route.fulfill({ json: { page: 1, total_pages: 1, total_results: 0, results: [] } })
      return
    }

    if (path.includes('/movie/27205')) {
      await route.fulfill({
        json: {
          ...inception,
          runtime: 148,
          tagline: 'Your mind is the scene of the crime.',
          genres: [
            { id: 878, name: 'Science Fiction' },
            { id: 28, name: 'Action' },
          ],
          credits: { cast: [], crew: [{ id: 525, name: 'Christopher Nolan', job: 'Director', department: 'Directing' }] },
          videos: { results: [] },
          similar: { results: [] },
          keywords: { keywords: [{ id: 1, name: 'dream' }] },
        },
      })
      return
    }

    await route.fulfill({ status: 404, json: { status_message: 'Not mocked' } })
  })

  await page.goto('/explore')
  await page.getByRole('searchbox', { name: 'Search by title or director' }).fill('Inception')
  await page.getByRole('link', { name: /Inception/ }).click()

  await expect(page.getByRole('heading', { name: 'Inception' })).toBeVisible()
  await page.getByRole('button', { name: 'Favorite', exact: true }).click()
  await expect(page.getByRole('button', { name: 'In favorites' })).toBeVisible()

  await page.reload()
  await expect(page.getByRole('button', { name: 'In favorites' })).toBeVisible()

  await page.getByRole('link', { name: '03 My Cinema' }).click()
  await page.getByRole('tab', { name: 'Favorites' }).click()
  await expect(page.getByRole('link', { name: 'Inception', exact: true })).toBeVisible()
})
