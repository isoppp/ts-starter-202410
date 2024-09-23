import { trpc } from '@/lib/trpcClient'
import { vineResolver } from '@hookform/resolvers/vine'
import type { MetaFunction } from '@remix-run/node'
import vine from '@vinejs/vine'
import type { Infer } from '@vinejs/vine/types'
import { useCallback } from 'react'
import { useForm } from 'react-hook-form'

export const meta: MetaFunction = () => {
  return [{ title: 'Signup' }, { name: 'description', content: 'Signup' }]
}

const schema = vine.object({
  email: vine.string().email(),
})
const validator = vine.compile(schema)

export default function Signup() {
  const form = useForm({
    resolver: vineResolver(validator),
    defaultValues: {
      email: 'test@example.com',
    },
  })

  const mutation = trpc.auth.signupWithEmail.useMutation({
    onSuccess: async () => {
      console.log('success')
    },
  })
  const onSubmit = useCallback(
    async (values: Infer<typeof schema>) => {
      mutation.mutate(values)
      console.log('please check you email!')
    },
    [mutation],
  )

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <input type='text' {...form.register('email')} />
      <button type='submit'>submit</button>
    </form>
  )
}
