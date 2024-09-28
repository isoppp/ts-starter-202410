import { trpc } from '@/lib/trpcClient'
import { valibotResolver } from '@hookform/resolvers/valibot'
import type { MetaFunction } from '@remix-run/cloudflare'
import { useCallback } from 'react'
import { useForm } from 'react-hook-form'
import * as v from 'valibot'

export const meta: MetaFunction = () => {
  return [{ title: 'Signup' }, { name: 'description', content: 'Signup' }]
}

const schema = v.object({
  email: v.pipe(v.string(), v.email()),
})

export default function Signup() {
  const form = useForm({
    resolver: valibotResolver(schema),
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
    async (values: v.InferInput<typeof schema>) => {
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
