import type { UserCollection } from './types'
import { Button } from '../../components/ui/Button'

interface CollectionCardProps {
  collection: UserCollection
  countLabel: string
  onOpen: () => void
  onShare: () => void
  onDelete: () => void
}

/** Карточка своей подборки: не постер, а название, объём и действия. */
export function CollectionCard({ collection, countLabel, onOpen, onShare, onDelete }: CollectionCardProps) {
  return (
    <article className="flex h-full flex-col justify-between border border-ink/10 bg-surface p-5">
      <div>
        <p className="eyebrow text-[11px]">{countLabel}</p>
        <h3 className="mt-3 font-display text-3xl text-ink">{collection.name}</h3>
        {collection.description ? <p className="mt-3 text-sm leading-6 text-muted">{collection.description}</p> : null}
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        <Button variant="ghost" onClick={onOpen}>
          Open
        </Button>
        <Button variant="ghost" onClick={onShare}>
          Share link
        </Button>
        <Button variant="text" onClick={onDelete}>
          Delete
        </Button>
      </div>
    </article>
  )
}
