import { createBrowserRouter } from 'react-router'
import { AppShell } from '../components/layout/AppShell'
import { DiscoverPage } from '../pages/discover/DiscoverPage'
import { ExplorePage } from '../pages/explore/ExplorePage'
import { FilmPage } from '../pages/film/FilmPage'
import { MyCinemaPage } from '../pages/my-cinema/MyCinemaPage'
import { NotFoundPage } from '../pages/not-found/NotFoundPage'
import { SharedCollectionPage } from '../pages/shared/SharedCollectionPage'

/**
 * На GitHub Pages сайт лежит в подкаталоге. BASE_URL приходит из Vite
 * и уже содержит ведущий и завершающий слэш. Роутеру завершающий не нужен.
 * Локально BASE_URL равен «/», и basename не передаём.
 */
function pagesBasename() {
  const base = import.meta.env.BASE_URL
  if (base === '/') return undefined
  return base.replace(/\/$/, '')
}

/**
 * Маршруты описывают, какой экран показать для какого адреса.
 * Роутер создаётся один раз вне компонентов: ему не нужно пересоздаваться
 * при каждом обновлении экрана.
 *
 * AppShell — общая рамка (шапка и подвал). Outlet внутри него меняется
 * в зависимости от адреса, а шапка остаётся.
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <DiscoverPage /> },
      { path: 'explore', element: <ExplorePage /> },
      { path: 'film/:id', element: <FilmPage /> },
      { path: 'my-cinema', element: <MyCinemaPage /> },
      { path: 'share', element: <SharedCollectionPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
], { basename: pagesBasename() })
