import { Authenticated } from '@/components/layout/Authenticated/Authenticated'
import type { MetaFunction } from '@remix-run/cloudflare'

export const meta: MetaFunction = () => {
  return [{ title: 'Authenticated' }, { name: 'description', content: 'Authenticated' }]
}
export default function AuthenticatedExample() {
  return (
    <Authenticated>
      <div>Authenticated</div>
    </Authenticated>
  )
}
