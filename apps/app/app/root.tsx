import { clientEnv } from '@/lib/env'
import { trpc } from '@/lib/trpcClient'
import { Link, Links, Meta, Outlet, Scripts, ScrollRestoration } from '@remix-run/react'
import './tailwind.css'
import { Toaster } from '@/components/ui/Toast/toaster'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { httpBatchLink } from '@trpc/client'
import type { ReactNode } from 'react'

export function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <header className="flex items-center gap-4 py-2">
          {[
            { to: '/', children: 'Home' },
            { to: '/login', children: 'Login' },
            { to: '/authenticated-example', children: 'Authenticated' },
          ].map((link) => (
            <Link key={link.to} to={link.to}>
              {link.children}
            </Link>
          ))}
        </header>
        {children}
        <Toaster />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

const queryClient = new QueryClient()

export default function App() {
  const trpcClient = trpc.createClient({
    links: [
      httpBatchLink({
        url: `${clientEnv.API_BASE_URL}/api/trpc`,
        fetch(url, options) {
          return fetch(url, {
            ...options,
            credentials: 'include',
          })
        },
      }),
    ],
  })

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <Outlet />
      </QueryClientProvider>
    </trpc.Provider>
  )
}
