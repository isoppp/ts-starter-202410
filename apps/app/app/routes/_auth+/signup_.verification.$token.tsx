import { Loading } from '@/components/global/Loading/Loading'
import { FormError } from '@/components/others/FormError/FormError'
import { useToast } from '@/components/ui/Toast/use-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { trpc } from '@/lib/trpcClient'
import { valibotResolver } from '@hookform/resolvers/valibot'
import type { MetaFunction } from '@remix-run/cloudflare'
import { Link, useNavigate, useParams } from '@remix-run/react'
import { serviceName } from '@repo/api-hono/src/config/app'
import { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import * as v from 'valibot'

export const meta: MetaFunction = () => {
  return [{ title: 'Signup' }, { name: 'description', content: 'Signup' }]
}

const schema = v.union([
  v.object({
    email: v.pipe(v.string(), v.email()),
  }),
])
type SignUpVerificationTokenSchema = v.InferInput<typeof schema>

export default function VerificationToken() {
  const { toast } = useToast()
  const [initialVerificationFailed, setInitialVerificationFailed] = useState(false)
  const form = useForm<SignUpVerificationTokenSchema>({
    resolver: valibotResolver(schema),
    defaultValues: {
      email: '',
    },
  })

  const params = useParams()
  const navigate = useNavigate()
  const mutation = trpc.auth.signUpVerification.useMutation({
    onSuccess: async () => {
      toast({
        type: 'background',
        title: 'Sign up success',
        description: 'You are now registered and signed in',
      })
      navigate('/')
    },
  })

  const onSubmit = useCallback(
    async (values: SignUpVerificationTokenSchema) => {
      if (!params.token) return
      await mutation.mutateAsync({ token: params.token, email: values.email || null })
    },
    [mutation, params.token],
  )

  // biome-ignore lint/correctness/useExhaustiveDependencies: run only once
  useEffect(() => {
    if (!params.token) {
      navigate('/login')
      return
    }

    mutation.mutate({ token: params.token }, { onError: () => setInitialVerificationFailed(true) })
  }, [])

  if (!initialVerificationFailed) {
    return <Loading type="fullscreen-center" />
  }

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-sm items-center justify-center">
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Link to="/">
              <img src="/logo-icon.svg" alt={serviceName} className="h-6" />
            </Link>
            <CardTitle className="text-2xl">Verification</CardTitle>
          </div>
          <CardDescription>Please reenter email address again.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="test@example.com" {...form.register('email')} />
                {form.formState.errors.email?.message && <FormError message={form.formState.errors.email?.message} />}
              </div>
              <div>
                <Button type="submit" className="w-full" disabled={mutation.isPending}>
                  Create account
                </Button>
              </div>
            </div>
          </form>
          <div className="mt-4 text-center text-sm">
            Any problems? Retry from{' '}
            <Link to="/login" className="underline">
              start
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
