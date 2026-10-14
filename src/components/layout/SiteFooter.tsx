export function SiteFooter() {
  return (
    <footer className="border-t border-ink/10">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-3 px-5 py-8 text-sm text-muted md:flex-row md:items-end md:justify-between md:px-8">
        <p className="font-display text-2xl text-ink">FRAME</p>
        <p className="max-w-md leading-6">
          Lists, ratings and notes stay in this browser. Export a JSON file if you want to carry them somewhere else.
        </p>
      </div>
    </footer>
  )
}
