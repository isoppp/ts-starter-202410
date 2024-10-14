import { FormError } from '@/components/others/FormError/FormError'
import { useToast } from '@/components/ui/Toast/use-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { handleResponseCode } from '@/lib/handle-response-code'
import { trpc } from '@/lib/trpcClient'
import { valibotResolver } from '@hookform/resolvers/valibot'
import type { MetaFunction } from '@remix-run/cloudflare'
import { Link } from '@remix-run/react'
import { serviceName } from '@repo/api-hono/src/config/app'
import { IconSend } from '@tabler/icons-react'
import { useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'
import * as v from 'valibot'

export const meta: MetaFunction = () => {
  return [{ title: 'Login' }, { name: 'description', content: 'Signin' }]
}

const schema = v.object({
  email: v.pipe(v.string(), v.email()),
})

export default function SignInPage() {
  const [sent, setSent] = useState(false)
  const { toast } = useToast()
  const form = useForm({
    resolver: valibotResolver(schema),
    defaultValues: {
      email: '',
    },
  })

  const mutation = trpc.auth.loginOrRegisterWithEmail.useMutation({
    onSuccess: () => {
      setSent(true) // not sure actually sent email or not
    },
    onError: (err) => {
      toast({
        type: 'background',
        ...handleResponseCode(err.message),
      })
    },
  })

  const onSubmit = useCallback(
    async (values: v.InferInput<typeof schema>) => {
      await mutation.mutateAsync(values)
    },
    [mutation],
  )

  const email = form.watch('email')

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-sm items-center justify-center">
      {sent ? (
        <Card className="w-full">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Link to="/" className="flex items-center gap-2 [&.active]:font-bold">
                LOGO HERE
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex items-center justify-center">
              <IconSend className="size-8" />
            </div>
            <div className="text-center">
              We sent email to <span className="underline">{email}</span>.
              <br />
              Please check you inbox.
            </div>
            <div className="mt-4 text-center text-sm">
              Any problems? Retry from{' '}
              <button onClick={() => setSent(false)} type="button" className="underline">
                start
              </button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="w-full">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Link to="/" className="flex items-center gap-2 [&.active]:font-bold">
                LOGO HERE
              </Link>
            </div>
            <CardDescription className="mt-3">Enter your email below to start using {serviceName}.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid gap-4">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="test@example.com" {...form.register('email')} />
                    {form.formState.errors.email?.message && (
                      <FormError message={form.formState.errors.email.message} />
                    )}
                  </div>
                  <div>
                    <Button type="submit" className="w-full">
                      Continue with email
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
