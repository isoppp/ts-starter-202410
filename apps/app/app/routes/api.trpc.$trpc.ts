import type { ActionFunction, LoaderFunction } from '@remix-run/node'
import { handler } from '../../../api-hono/src/trpc'

export const loader: LoaderFunction = async (args) => {
  return handler(args.request)
}

export const action: ActionFunction = async (args) => {
  return handler(args.request)
}
