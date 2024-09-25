import { trpc } from '@/lib/trpcClient'
import type { MetaFunction } from '@remix-run/node'
import { useNavigate } from '@remix-run/react'
import { useEffect } from 'react'

export const meta: MetaFunction = () => {
  return [{ title: 'Signout' }, { name: 'description', content: 'Signout' }]
}

export default function Signout() {
  const navigate = useNavigate()
  const mutation = trpc.auth.signOut.useMutation()
  const utils = trpc.useUtils()

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    ;(async () => {
      const res = await mutation.mutateAsync()
      await utils.invalidate()
      if (res.ok) navigate('/signin')
    })()
  }, [])
  return <div>loading... TODO: check unauthorized</div>
}
