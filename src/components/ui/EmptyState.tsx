import type { ReactNode } from 'react'

/** Пустой список, ошибка сети или подсказка, что делать дальше. */
export function EmptyState({
  title,
  body,
  action,
}: {
  title: string
  body: string
  action?: ReactNode
}) {
  return (
    <div className="border border-ink/10 px-6 py-16 text-center">
      <h2 className="font-display text-3xl text-ink">{title}</h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted">{body}</p>
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  )
}
