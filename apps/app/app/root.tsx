import { useNonce } from '@/lib/nonce'
import { trpc } from '@/lib/trpcClient'
import type { HeadersFunction } from '@remix-run/node'
import { Link, Links, Meta, Outlet, Scripts, ScrollRestoration } from '@remix-run/react'
import './tailwind.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { httpBatchLink } from '@trpc/client'
import type { ReactNode } from 'react'

export const headers: HeadersFunction = ({ loaderHeaders }) => {
  const headers = {
    'Server-Timing': loaderHeaders.get('Server-Timing') ?? '',
  }
  return headers
}

export function Layout({ children }: { children: ReactNode }) {
  const nonce = useNonce()

  return (
    <html lang='en'>
      <head>
        <meta charSet='utf-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <Meta />
        <Links />
      </head>
      <body>
        <header className='flex items-center gap-4 py-2'>
          {[
            { to: '/', children: 'Home' },
            { to: '/signup', children: 'Signup' },
            { to: '/signin', children: 'Signin' },
            { to: '/signout', children: 'Signout' },
            { to: '/authenticated-example', children: 'Authenticated' },
          ].map((link) => (
            <Link key={link.to} to={link.to}>
              {link.children}
            </Link>
          ))}
        </header>
        {children}
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
      </body>
    </html>
  )
}

const queryClient = new QueryClient()
const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: '/api/trpc',
      // async headers() {
      //   return {
      //     authorization: getAuthCookie(),
      //   };
      // },
    }),
  ],
})

export default function App() {
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <Outlet />
      </QueryClientProvider>
    </trpc.Provider>
  )
}
