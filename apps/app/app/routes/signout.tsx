import { type LoaderFunctionArgs, type MetaFunction, redirect } from '@remix-run/node'
import { destroyStrAuthSession, getAuthSessionId } from '../../../api-hono/src/feature/auth/cookie-session/auth-session'
import { prisma } from '../../../api-hono/src/lib/prisma'

export const meta: MetaFunction = () => {
  return [{ title: 'Logout' }, { name: 'description', content: 'Logout' }]
}

export const loader = async (ctx: LoaderFunctionArgs) => {
  const sessionId = await getAuthSessionId(ctx.request)
  if (!sessionId) {
    return redirect('/signin')
  }

  const existing = await prisma.session.findUnique({ where: { id: sessionId } })
  if (!existing) {
    return redirect('/signin', {
      headers: {
        'Set-Cookie': await destroyStrAuthSession(ctx.request),
      },
    })
  }

  return redirect('/signin', {
    headers: {
      'Set-Cookie': await destroyStrAuthSession(ctx.request),
    },
  })
}

export default function Signout() {
  return <div>loading...</div>
}
