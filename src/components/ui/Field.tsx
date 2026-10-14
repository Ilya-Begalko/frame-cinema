import type { ReactNode } from 'react'

export const controlClass =
  'w-full border border-ink/15 bg-background px-3 py-2 text-sm text-ink outline-none transition duration-200 focus:border-gold'

interface FieldProps {
  label: string
  children: ReactNode
  hint?: string
}

/** Подпись над полем. Дети — сам input или select, их передаёт родитель. */
export function Field({ label, children, hint }: FieldProps) {
  return (
    <label className="block">
      <span className="eyebrow mb-2 block">{label}</span>
      {children}
      {hint ? <span className="mt-2 block text-xs leading-5 text-muted">{hint}</span> : null}
    </label>
  )
}
