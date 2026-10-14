import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router'
import { motion, useReducedMotion } from 'motion/react'
import { useStoreHydrated } from '../../hooks/useStoreHydrated'
import { AppHeader } from './AppHeader'
import { SiteFooter } from './SiteFooter'

/**
 * Оболочка всех страниц. Outlet — дырка, в которую роутер кладёт текущий экран.
 * Пока коллекция не прочитана из localStorage, показываем только фон:
 * иначе избранное на миг выглядит пустым и клик может потеряться.
 */
export function AppShell() {
  const hydrated = useStoreHydrated()
  const location = useLocation()
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-gold focus:px-3 focus:py-2 focus:text-background"
      >
        Skip to content
      </a>
      <AppHeader />
      <main id="content" className="mx-auto w-full max-w-[1440px] flex-1 px-5 py-10 md:px-8 md:py-14">
        {hydrated ? (
          <motion.div
            key={location.pathname}
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
          >
            <Outlet />
          </motion.div>
        ) : (
          <div className="min-h-[50vh]" />
        )}
      </main>
      <SiteFooter />
    </div>
  )
}
