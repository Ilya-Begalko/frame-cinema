/** Серый каркас карточки, пока фильмы ещё едут из TMDB. */
export function SkeletonCard() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[2/3] bg-surface" />
      <div className="mt-3 h-4 w-3/4 bg-surface" />
      <div className="mt-2 h-3 w-1/3 bg-surface" />
    </div>
  )
}
