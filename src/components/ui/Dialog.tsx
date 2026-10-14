import { useEffect, useId, type ReactNode } from 'react'
import { cn } from '../../lib/cn'

interface DialogProps {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
  className?: string
}

/**
 * Модальное окно для трейлера, фильтров на телефоне и подтверждения.
 * Если open ложно, компонент возвращает null — в DOM его просто нет.
 * Escape и клик по тёмному фону закрывают окно. Это эффект: подписка на клавиатуру
 * живёт, только пока окно открыто, и снимается в функции очистки.
 */
export function Dialog({ open, title, onClose, children, className }: DialogProps) {
  const titleId = useId()

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <div className="absolute inset-0 bg-background/80" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          'relative z-10 max-h-[90vh] w-full max-w-3xl overflow-y-auto border border-ink/15 bg-surface p-5 shadow-2xl sm:p-7',
          className,
        )}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <h2 id={titleId} className="font-display text-3xl text-ink">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="eyebrow text-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
          >
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
