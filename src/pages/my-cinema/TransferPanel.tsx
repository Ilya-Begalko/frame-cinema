import { useRef, useState } from 'react'
import { Button } from '../../components/ui/Button'
import { Dialog } from '../../components/ui/Dialog'
import { controlClass, Field } from '../../components/ui/Field'
import { buildSnapshot, parseSnapshot } from '../../features/collections/transfer'
import type { CinemaLanguage } from '../../features/collections/types'
import { useCinemaStore } from '../../stores/cinema.store'

/**
 * JSON — ручной перенос между браузерами.
 * localStorage сам по себе привязан к одному браузеру на одном устройстве.
 */
export function TransferPanel() {
  const favorites = useCinemaStore((state) => state.favorites)
  const watchlist = useCinemaStore((state) => state.watchlist)
  const watched = useCinemaStore((state) => state.watched)
  const ratings = useCinemaStore((state) => state.ratings)
  const notes = useCinemaStore((state) => state.notes)
  const collections = useCinemaStore((state) => state.collections)
  const language = useCinemaStore((state) => state.language)
  const setLanguage = useCinemaStore((state) => state.setLanguage)
  const mergeImported = useCinemaStore((state) => state.mergeImported)
  const replaceImported = useCinemaStore((state) => state.replaceImported)
  const fileRef = useRef<HTMLInputElement>(null)
  const [mode, setMode] = useState<'merge' | 'replace'>('merge')
  const [confirmReplace, setConfirmReplace] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  function download() {
    const snapshot = buildSnapshot({ favorites, watchlist, watched, ratings, notes, collections })
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `frame-cinema-${snapshot.exportedAt.slice(0, 10)}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  async function onFile(file: File | undefined) {
    if (!file) return
    try {
      const snapshot = parseSnapshot(JSON.parse(await file.text()))
      if (mode === 'replace') replaceImported(snapshot)
      else mergeImported(snapshot)
      setMessage(mode === 'replace' ? 'This browser now uses the imported collection.' : 'Imported films were merged in.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not read that file.')
    } finally {
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <section className="border-t border-ink/10 pt-12">
      <p className="eyebrow">This browser only</p>
      <h2 className="mt-2 font-display text-3xl text-ink">Carry the collection by hand</h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
        There is no account. Favorites on your phone will not appear on your laptop until you export a file or open a
        share link. Film text can be English or Russian; mood words are matched mostly by genre, so both languages work.
      </p>
      <div className="mt-6 max-w-sm">
        <Field label="Catalogue language">
          <select
            className={controlClass}
            value={language}
            onChange={(event) => setLanguage(event.target.value as CinemaLanguage)}
          >
            <option value="en-US">English</option>
            <option value="ru-RU">Русский</option>
          </select>
        </Field>
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button onClick={download}>Export JSON</Button>
        <Button
          variant="ghost"
          onClick={() => {
            setMode('merge')
            fileRef.current?.click()
          }}
        >
          Merge JSON
        </Button>
        <Button variant="ghost" onClick={() => setConfirmReplace(true)}>
          Replace from JSON
        </Button>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="application/json"
        className="hidden"
        onChange={(event) => void onFile(event.target.files?.[0])}
      />
      {message ? (
        <p className="mt-4 text-sm text-gold" role="status">
          {message}
        </p>
      ) : null}
      <Dialog open={confirmReplace} title="Replace this browser?" onClose={() => setConfirmReplace(false)} className="max-w-md">
        <p className="text-sm leading-6 text-muted">
          The lists in this browser will be discarded and replaced by the file you choose. Merge keeps both.
        </p>
        <div className="mt-6 flex gap-3">
          <Button
            onClick={() => {
              setMode('replace')
              setConfirmReplace(false)
              fileRef.current?.click()
            }}
          >
            Choose file
          </Button>
          <Button variant="ghost" onClick={() => setConfirmReplace(false)}>
            Cancel
          </Button>
        </div>
      </Dialog>
    </section>
  )
}
