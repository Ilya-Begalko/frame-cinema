import { MOODS, type MoodId } from './moods'
import { cn } from '../../lib/cn'

interface MoodSelectorProps {
  value: readonly MoodId[]
  onChange: (next: MoodId[]) => void
}

/**
 * Управляемый компонент: выбранные настроения хранит родитель.
 * На главной родитель — useState. На Explore родитель — адрес страницы.
 * Сама кнопка не знает, куда потом денется выбор. Это и есть переиспользование.
 */
export function MoodSelector({ value, onChange }: MoodSelectorProps) {
  function toggle(id: MoodId) {
    onChange(value.includes(id) ? value.filter((mood) => mood !== id) : [...value, id])
  }

  return (
    <ul className="flex flex-wrap gap-3">
      {MOODS.map((mood) => {
        const active = value.includes(mood.id)
        return (
          <li key={mood.id}>
            <button
              type="button"
              aria-pressed={active}
              onClick={() => toggle(mood.id)}
              className={cn(
                'min-w-36 border px-4 py-3 text-left transition duration-200',
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold',
                active ? 'border-gold bg-gold/10' : 'border-ink/15 hover:border-gold/70',
              )}
            >
              <span className="block font-display text-xl text-ink">{mood.label}</span>
              <span className="eyebrow mt-1 block text-[11px]">{mood.subtitle}</span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
