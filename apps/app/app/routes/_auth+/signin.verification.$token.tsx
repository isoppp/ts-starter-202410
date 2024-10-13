import { trpc } from '@/lib/trpcClient'
import type { MetaFunction } from '@remix-run/cloudflare'
import { useNavigate, useParams } from '@remix-run/react'
import type { FormEventHandler } from 'react'

export const meta: MetaFunction = () => {
  return [{ title: 'Signup' }, { name: 'description', content: 'Signup' }]
}

export default function VerificationToken() {
  const params = useParams()
  const navigate = useNavigate()
  const mutation = trpc.auth.signInVerification.useMutation()

  const onSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    if (!params.token) return
    const res = await mutation.mutateAsync({ token: params.token })
    if (res.ok) {
      console.log('signin success!')
      navigate('/authenticated-example')
    } else {
      console.log('failed to signin')
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <button type="submit">submit</button>
    </form>
  )
}
