import type { MetaFunction } from '@remix-run/node'

export const meta: MetaFunction = () => {
  return [{ title: 'Signout' }, { name: 'description', content: 'Signout' }]
}

export default function Signout() {
  return <div>TODO: loading...</div>
}
