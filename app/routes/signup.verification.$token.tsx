import { trpc } from '@/lib/trpcClient'
import type { MetaFunction } from '@remix-run/node'
import { useNavigate, useParams } from '@remix-run/react'
import type { FormEventHandler } from 'react'

export const meta: MetaFunction = () => {
  return [{ title: 'Signup' }, { name: 'description', content: 'Signup' }]
}

export default function VerificationToken() {
  const params = useParams()
  const navigate = useNavigate()
  const mutation = trpc.auth.signUpVerification.useMutation()

  const onSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    if (!params.token) return
    const res = await mutation.mutateAsync({ token: params.token })
    if (!res.ok) return console.log('failed to register')

    console.log('created and logged-in')
    navigate('/authenticated-example')
  }

  return (
    <form onSubmit={onSubmit}>
      <button type='submit'>submit</button>
    </form>
  )
}
