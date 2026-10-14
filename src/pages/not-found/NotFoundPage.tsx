import { Button } from '../../components/ui/Button'
import { usePageTitle } from '../../hooks/usePageTitle'

export function NotFoundPage() {
  usePageTitle('Not found — FRAME')
  return (
    <div className="py-16">
      <p className="eyebrow">404</p>
      <h1 className="mt-3 font-display text-5xl text-ink">This screening does not exist.</h1>
      <div className="mt-8">
        <Button to="/">Back to Discover</Button>
      </div>
    </div>
  )
}
