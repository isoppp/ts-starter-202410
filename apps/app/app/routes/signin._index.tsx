import { trpc } from '@/lib/trpcClient'
import { valibotResolver } from '@hookform/resolvers/valibot'
import type { MetaFunction } from '@remix-run/cloudflare'
import { useCallback } from 'react'
import { useForm } from 'react-hook-form'
import * as v from 'valibot'

export const meta: MetaFunction = () => {
  return [{ title: 'Login' }, { name: 'description', content: 'Login' }]
}

const schema = v.object({
  email: v.pipe(v.string(), v.email()),
})

export default function Signin() {
  const form = useForm({
    resolver: valibotResolver(schema),
    defaultValues: {
      email: 'test@example.com',
    },
  })

  const mutation = trpc.auth.signInWithEmail.useMutation({
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
