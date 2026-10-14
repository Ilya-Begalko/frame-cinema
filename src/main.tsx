import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'
import { router } from './app/router'
import { Providers } from './app/providers'
import './index.css'

/**
 * Точка входа. Её подключает index.html.
 *
 * createRoot говорит React: «вот DOM-узел, дальше им управляешь ты».
 * Мы больше не правим HTML вручную — React сравнивает новое описание
 * экрана со старым и обновляет только изменившиеся узлы.
 *
 * StrictMode в разработке дважды запускает некоторые эффекты.
 * Так всплывают ошибки вроде забытой отмены подписки. В production этого нет.
 */
const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Root element #root is missing')
}

createRoot(rootElement).render(
  <StrictMode>
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  </StrictMode>,
)
