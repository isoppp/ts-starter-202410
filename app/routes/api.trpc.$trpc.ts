import { handler } from '@/.server/trpc'
import type { ActionFunction, LoaderFunction } from '@remix-run/node'

export const loader: LoaderFunction = async (args) => {
  return handler(args.request)
}

export const action: ActionFunction = async (args) => {
  return handler(args.request)
}
