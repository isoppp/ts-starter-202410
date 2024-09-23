import { trpc } from '@/lib/trpcClient'
import { useNavigate } from '@remix-run/react'
import { type FC, type ReactNode, useEffect } from 'react'

type Props = {
  children: ReactNode
}

export const Authenticated: FC<Props> = ({ children }) => {
  const navigate = useNavigate()
  const { data, isLoading, error } = trpc.auth.isSignedIn.useQuery(undefined, { retry: false })

  useEffect(() => {
    if ((!isLoading && data && !data.isSignedIn) || error) {
      navigate('/signin')
    }
  }, [error, navigate, data, isLoading])

  if (error) {
    return null
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return children
}
