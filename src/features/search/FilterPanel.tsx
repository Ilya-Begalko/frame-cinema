import { COUNTRIES } from '../../lib/countries'
import { GENRES } from '../../lib/genres'
import { MoodSelector } from '../mood-matching/MoodSelector'
import { VISUAL_STYLES, type VisualStyleId } from '../mood-matching/moods'
import type { ExploreParams, SortId } from './explore-params'
import { cn } from '../../lib/cn'
import { controlClass, Field } from '../../components/ui/Field'

interface FilterPanelProps {
  params: ExploreParams
  onChange: (partial: Partial<ExploreParams>) => void
}

const SORT_LABELS: Record<SortId, string> = {
  popularity: 'Popularity',
  rating: 'Rating',
  release: 'Release date',
}

/**
 * Панель фильтров ничего не грузит сама. Она сообщает родителю, что изменилось,
 * а родитель записывает это в URL. Поэтому панель одинаково работает в колонке
 * и внутри мобильного окна.
 */
export function FilterPanel({ params, onChange }: FilterPanelProps) {
  return (
    <div className="space-y-6">
      <Field label="Mood">
        <MoodSelector value={params.moods} onChange={(moods) => onChange({ moods })} />
        <span className="mt-2 block text-xs leading-5 text-muted">
          Mood reorders the current page. It is a heuristic, not a feeling detector.
        </span>
      </Field>

      <Field label="Visual style">
        <div className="flex flex-wrap gap-2">
          {VISUAL_STYLES.map((style) => {
            const active = params.style === style.id
            return (
              <button
                key={style.id}
                type="button"
                aria-pressed={active}
                onClick={() => onChange({ style: active ? '' : (style.id as VisualStyleId) })}
                className={cn(
                  'border px-3 py-2 text-left text-sm transition duration-200',
                  active ? 'border-gold text-gold' : 'border-ink/15 text-ink hover:border-gold/70',
                )}
              >
                {style.label}
              </button>
            )
          })}
        </div>
      </Field>

      <Field label="Genre">
        <select
          className={controlClass}
          value={params.genre}
          onChange={(event) => onChange({ genre: event.target.value })}
        >
          <option value="">Any genre</option>
          {GENRES.map((genre) => (
            <option key={genre.id} value={genre.id}>
              {genre.name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Year">
        <input
          className={controlClass}
          inputMode="numeric"
          placeholder="Any year"
          value={params.year}
          onChange={(event) => onChange({ year: event.target.value.replace(/\D/g, '').slice(0, 4) })}
        />
      </Field>

      <Field label="Country">
        <select
          className={controlClass}
          value={params.country}
          onChange={(event) => onChange({ country: event.target.value })}
        >
          <option value="">Any country</option>
          {COUNTRIES.map((country) => (
            <option key={country.code} value={country.code}>
              {country.name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Minimum rating">
        <select
          className={controlClass}
          value={params.rating}
          onChange={(event) => onChange({ rating: event.target.value })}
        >
          <option value="">Any rating</option>
          <option value="6">6+</option>
          <option value="7">7+</option>
          <option value="8">8+</option>
        </select>
      </Field>

      <Field label="Sort">
        <select
          className={controlClass}
          value={params.sort}
          onChange={(event) => onChange({ sort: event.target.value as SortId })}
        >
          {Object.entries(SORT_LABELS).map(([id, label]) => (
            <option key={id} value={id}>
              {label}
            </option>
          ))}
        </select>
      </Field>
    </div>
  )
}
