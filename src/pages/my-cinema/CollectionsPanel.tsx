import { useState } from 'react'
import { Link } from 'react-router'
import { Button } from '../../components/ui/Button'
import { Dialog } from '../../components/ui/Dialog'
import { controlClass, Field } from '../../components/ui/Field'
import { CollectionCard } from '../../features/collections/CollectionCard'
import { shareUrl } from '../../features/collections/transfer'
import type { SavedMovie, UserCollection } from '../../features/collections/types'
import { useCinemaStore } from '../../stores/cinema.store'

/** Свои подборки и ссылка, в которую вложена копия списка. Сервер для этого не нужен. */
export function CollectionsPanel() {
  const collections = useCinemaStore((state) => state.collections)
  const library = useCinemaStore((state) => state.library)
  const createCollection = useCinemaStore((state) => state.createCollection)
  const deleteCollection = useCinemaStore((state) => state.deleteCollection)
  const addToCollection = useCinemaStore((state) => state.addToCollection)
  const removeFromCollection = useCinemaStore((state) => state.removeFromCollection)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [openId, setOpenId] = useState<string | null>(null)
  const [pendingDelete, setPendingDelete] = useState<UserCollection | null>(null)
  const [shareMessage, setShareMessage] = useState<string | null>(null)

  const open = collections.find((collection) => collection.id === openId) ?? null

  async function share(collection: UserCollection) {
    const movies = collection.movieIds
      .map((id) => library[String(id)])
      .filter((movie): movie is SavedMovie => Boolean(movie))
    const url = shareUrl(window.location.origin, {
      name: collection.name,
      description: collection.description,
      movies,
    })
    if (!url) {
      setShareMessage('This list is too long for a link. Use Export JSON below.')
      return
    }
    try {
      await navigator.clipboard.writeText(url)
      setShareMessage('Link copied. Anyone with it can open the list in their own browser.')
    } catch {
      setShareMessage(url)
    }
  }

  return (
    <div className="space-y-10">
      <form
        className="grid gap-4 border border-ink/10 p-5 md:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault()
          createCollection(name, description)
          setName('')
          setDescription('')
        }}
      >
        <Field label="New list">
          <input className={controlClass} value={name} onChange={(event) => setName(event.target.value)} required />
        </Field>
        <Field label="Description">
          <input
            className={controlClass}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </Field>
        <div className="md:col-span-2">
          <Button type="submit">Create list</Button>
        </div>
      </form>

      {shareMessage ? <p className="text-sm leading-6 text-gold">{shareMessage}</p> : null}

      {collections.length === 0 ? (
        <p className="text-muted">No lists yet. A list can hold films you have already opened, saved, or rated.</p>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {collections.map((collection) => (
            <li key={collection.id}>
              <CollectionCard
                collection={collection}
                countLabel={`${collection.movieIds.length} films`}
                onOpen={() => setOpenId(collection.id)}
                onShare={() => void share(collection)}
                onDelete={() => setPendingDelete(collection)}
              />
            </li>
          ))}
        </ul>
      )}

      {open ? (
        <section className="border-t border-ink/10 pt-8">
          <h2 className="font-display text-4xl text-ink">{open.name}</h2>
          {open.description ? <p className="mt-2 text-muted">{open.description}</p> : null}
          <div className="mt-6 max-w-md">
            <Field label="Add a saved film">
              <select
                className={controlClass}
                value=""
                onChange={(event) => {
                  const movie = library[event.target.value]
                  if (movie) addToCollection(open.id, movie)
                }}
              >
                <option value="">Choose from your library</option>
                {Object.values(library)
                  .filter((movie) => !open.movieIds.includes(movie.id))
                  .map((movie) => (
                    <option key={movie.id} value={movie.id}>
                      {movie.title}
                    </option>
                  ))}
              </select>
            </Field>
          </div>
          <ul className="mt-6 divide-y divide-ink/10">
            {open.movieIds.map((id) => {
              const movie = library[String(id)]
              if (!movie) return null
              return (
                <li key={id} className="flex items-center justify-between gap-4 py-3">
                  <Link to={`/film/${id}`} className="text-ink">
                    {movie.title}
                  </Link>
                  <Button variant="text" onClick={() => removeFromCollection(open.id, id)}>
                    Remove
                  </Button>
                </li>
              )
            })}
          </ul>
        </section>
      ) : null}

      <Dialog
        open={Boolean(pendingDelete)}
        title="Delete this list?"
        onClose={() => setPendingDelete(null)}
        className="max-w-md"
      >
        <p className="text-sm leading-6 text-muted">
          {pendingDelete?.name} will leave this browser. The films themselves stay in your other lists.
        </p>
        <div className="mt-6 flex gap-3">
          <Button
            onClick={() => {
              if (!pendingDelete) return
              deleteCollection(pendingDelete.id)
              if (openId === pendingDelete.id) setOpenId(null)
              setPendingDelete(null)
            }}
          >
            Delete
          </Button>
          <Button variant="ghost" onClick={() => setPendingDelete(null)}>
            Keep
          </Button>
        </div>
      </Dialog>
    </div>
  )
}
