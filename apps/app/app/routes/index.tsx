import { useToast } from '@/components/ui/Toast/use-toast'
import { Badge } from '@/components/ui/badge'
import { handleResponseCode } from '@/lib/handle-response-code'
import { trpc } from '@/lib/trpcClient'
import type { MetaFunction } from '@remix-run/cloudflare'
import { useNavigate } from '@remix-run/react'

export const meta: MetaFunction = () => {
  return [{ title: 'New Remix App' }, { name: 'description', content: 'Welcome to Remix!' }]
}

export default function Index() {
  const utils = trpc.useUtils()
  const queryResult = trpc.example.list.useQuery()
  const mutation = trpc.example.create.useMutation({
    onSuccess: async () => {
      await utils.example.list.invalidate()
    },
  })

  const fetchExamples = async () => {
    const examples = await queryResult.refetch()
    console.log(examples)
  }

  const addExample = async (name: string) => {
    const example = await mutation.mutateAsync({ name })
    console.log(example)
  }

  const { toast } = useToast()

  const navigate = useNavigate()
  const logoutM = trpc.auth.logout.useMutation({
    onSuccess: async () => {
      await utils.invalidate()
      toast({
        type: 'background',
        title: 'Logout success',
      })
      navigate('/login')
    },
    onError: (err) => {
      toast({
        type: 'background',
        ...handleResponseCode(err.message),
      })
    },
  })
  const deleteAccountM = trpc.auth.deleteUser.useMutation({
    onSuccess: async () => {
      await utils.invalidate()
      toast({
        type: 'background',
        title: 'Account deleted',
      })
      navigate('/login')
    },
    onError: (err) => {
      toast({
        type: 'background',
        ...handleResponseCode(err.message),
      })
    },
  })

  return (
    <div className="p-4 font-sans">
      <h1 className="text-3xl">Welcome to Remix</h1>
      <div>
        <Badge>badge test</Badge>
      </div>
      <div>
        <button type="button" onClick={fetchExamples}>
          refetch
        </button>
        <div>{queryResult.data?.length}</div>
      </div>
      <div>
        <button type="button" onClick={() => addExample(crypto.randomUUID().slice(0, 4))}>
          submit
        </button>
        <div>{mutation.isPending}</div>
      </div>

      <div className="flex flex-col items-start gap-4 mt-10">
        <button type="button" onClick={() => logoutM.mutate()}>
          logout
        </button>
        <button type="button" onClick={() => deleteAccountM.mutate()}>
          delete user
        </button>
      </div>
    </div>
  )
}
