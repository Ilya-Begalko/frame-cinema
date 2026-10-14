import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router'
import { cn } from '../../lib/cn'

const LINKS = [
  { to: '/', label: 'Discover', index: '01', end: true },
  { to: '/explore', label: 'Explore', index: '02', end: false },
  { to: '/my-cinema', label: 'My Cinema', index: '03', end: false },
] as const

/**
 * Шапка — общий layout, не отдельная страница.
 * open живёт в useState: меню нужно только пока оно на экране,
 * после перезагрузки оно всё равно должно быть закрыто.
 */
export function AppHeader() {
  const [open, setOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-6 px-5 py-4 md:px-8">
        <NavLink to="/" end className="group block">
          <span className="block font-display text-2xl leading-none tracking-wide text-ink">FRAME</span>
          <span className="eyebrow mt-1 block text-[10px] text-gold">Cinema Club</span>
        </NavLink>

        <button
          type="button"
          className="eyebrow md:hidden"
          aria-expanded={open}
          aria-controls="site-nav"
          onClick={() => setOpen((current) => !current)}
        >
          {open ? 'Close' : 'Menu'}
        </button>

        <nav
          id="site-nav"
          className={cn(
            'gap-6 md:flex md:items-center',
            open
              ? 'absolute inset-x-0 top-full flex flex-col items-start border-b border-ink/10 bg-background px-5 py-4 md:static md:flex-row md:border-0 md:bg-transparent md:p-0'
              : 'hidden',
          )}
        >
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                cn(
                  'flex items-baseline gap-2 text-sm text-muted transition duration-200 hover:text-ink',
                  isActive && 'text-gold',
                )
              }
            >
              <span className="text-[10px] tracking-[0.18em]">{link.index}</span>
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}
