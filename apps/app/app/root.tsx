import { trpc } from '@/lib/trpcClient'
import type { LoaderFunction } from '@remix-run/cloudflare'
import { Link, Links, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData } from '@remix-run/react'
import './tailwind.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { httpBatchLink } from '@trpc/client'
import type { ReactNode } from 'react'

export const loader: LoaderFunction = ({ context }) => {
  console.log('context.cf.env', JSON.stringify(context.cloudflare.env))
  return {
    ENV: {
      API_BASE_URL: context.cloudflare.env.API_BASE_URL,
      APP_ENV: context.cloudflare.env.APP_ENV,
    },
  }
}

export function Layout({ children }: { children: ReactNode }) {
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
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

const queryClient = new QueryClient()

export default function App() {
  const loaderData = useLoaderData<typeof loader>()
  console.log(loaderData)
  const trpcClient = trpc.createClient({
    links: [
      httpBatchLink({
        url: `${loaderData.ENV.API_BASE_URL}/api/trpc`,
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
        <div id='baseurl'>{loaderData.ENV.API_BASE_URL}</div>
        <div id='appenv'>{loaderData.ENV.APP_ENV}</div>
        <Outlet />
      </QueryClientProvider>
    </trpc.Provider>
  )
}
