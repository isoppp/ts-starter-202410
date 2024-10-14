import { Loading } from '@/components/global/Loading/Loading'
import { trpc } from '@/lib/trpcClient'
import { useNavigate } from '@remix-run/react'
import { type FC, type ReactNode, useEffect } from 'react'

type Props = {
  children: ReactNode
}

export const Authenticated: FC<Props> = ({ children }) => {
  const navigate = useNavigate()
  const { data, isLoading, error } = trpc.auth.isSignedIn.useQuery(undefined, { retry: 1 })

  useEffect(() => {
    if ((!isLoading && data && !data.isSignedIn) || error) {
      navigate('/login')
    }
  }, [error, navigate, data, isLoading])

  if (error) {
    return null
  }

  if (isLoading) {
    return <Loading type="fullscreen-center" />
  }

  return children
}
