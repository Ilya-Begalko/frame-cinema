import { Dialog } from '../../components/ui/Dialog'

/** Трейлер YouTube внутри нашего окна, а не уходом со страницы фильма. */
export function TrailerDialog({
  open,
  title,
  youtubeKey,
  onClose,
}: {
  open: boolean
  title: string
  youtubeKey: string
  onClose: () => void
}) {
  return (
    <Dialog open={open} title={title} onClose={onClose} className="max-w-5xl">
      <div className="aspect-video bg-black">
        {open ? (
          <iframe
            className="h-full w-full"
            src={`https://www.youtube-nocookie.com/embed/${youtubeKey}`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : null}
      </div>
    </Dialog>
  )
}
