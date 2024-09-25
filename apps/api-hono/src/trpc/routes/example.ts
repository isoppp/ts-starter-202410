import { prisma } from '@/lib/prisma'
import { createTRPCRouter, p } from '@/trpc/trpc'
import * as v from 'valibot'

export const exampleRouter = createTRPCRouter({
  hello: p.public.query(() => 'world'),
  list: p.public.query(async () => {
    return prisma.example.findMany()
  }),
  create: p.public
    .input(
      v.parser(
        v.object({
          name: v.pipe(v.string(), v.nonEmpty(), v.maxLength(4)),
        }),
      ),
    )
    .mutation(async ({ input }) => {
      return prisma.example.create({
        data: input,
      })
    }),
})
