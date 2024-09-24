import { Badge } from '@/components/ui/badge'
import { trpc } from '@/lib/trpcClient'
import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { createTrpcServerForLoader } from '../../../api-hono/src/trpc'

export const meta: MetaFunction = () => {
  return [{ title: 'New Remix App' }, { name: 'description', content: 'Welcome to Remix!' }]
}

export const loader = async (ctx: LoaderFunctionArgs) => {
  const trpcServer = createTrpcServerForLoader(ctx.request)
  const message = await trpcServer.example.hello()
  return {
    message,
  }
}

export default function Index() {
  const data = useLoaderData<typeof loader>()

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

  return (
    <div className='p-4 font-sans'>
      <h1 className='text-3xl'>Welcome to Remix</h1>
      <div>
        <Badge>badge test</Badge>
      </div>
      <div>ssr: {data.message}</div>
      <div>
        <button type='button' onClick={fetchExamples}>
          refetch
        </button>
        <div>{queryResult.data?.length}</div>
      </div>
      <div>
        <button type='button' onClick={() => addExample(crypto.randomUUID().slice(0, 4))}>
          submit
        </button>
        <div>{mutation.isPending}</div>
      </div>
      <ul className='mt-4 list-disc space-y-2 pl-6'>
        <li>
          <a
            className='text-blue-700 underline visited:text-purple-900'
            target='_blank'
            href='https://remix.run/start/quickstart'
            rel='noreferrer'
          >
            5m Quick Start
          </a>
        </li>
        <li>
          <a
            className='text-blue-700 underline visited:text-purple-900'
            target='_blank'
            href='https://remix.run/start/tutorial'
            rel='noreferrer'
          >
            30m Tutorial
          </a>
        </li>
        <li>
          <a
            className='text-blue-700 underline visited:text-purple-900'
            target='_blank'
            href='https://remix.run/docs'
            rel='noreferrer'
          >
            Remix Docs
          </a>
        </li>
      </ul>
    </div>
  )
}
