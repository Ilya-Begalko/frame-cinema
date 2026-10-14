import { useEffect, useRef, useState } from 'react'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  label: string
}

/**
 * Контролируемый ввод с задержкой.
 * draft — то, что человек печатает прямо сейчас.
 * value — уже подтверждённый запрос из URL.
 * Таймер ждёт 300 мс тишины и только потом зовёт onChange,
 * чтобы не бить TMDB на каждую букву.
 *
 * onChangeRef хранит свежую функцию без перезапуска таймера.
 * Иначе новый onChange на каждом рендере сбрасывал бы задержку.
 */
export function SearchInput({ value, onChange, placeholder, label }: SearchInputProps) {
  const [draft, setDraft] = useState(value)
  const onChangeRef = useRef(onChange)

  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  useEffect(() => {
    setDraft(value)
  }, [value])

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      if (draft !== value) onChangeRef.current(draft)
    }, 300)
    return () => window.clearTimeout(timeout)
  }, [draft, value])

  return (
    <label className="block">
      <span className="sr-only">{label}</span>
      <input
        role="searchbox"
        aria-label={label}
        value={draft}
        placeholder={placeholder}
        onChange={(event) => setDraft(event.target.value)}
        className="w-full border-b border-ink/20 bg-transparent py-3 font-display text-3xl text-ink outline-none placeholder:text-muted/50 focus:border-gold md:text-5xl"
      />
    </label>
  )
}
