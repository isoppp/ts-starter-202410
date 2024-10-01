import { env } from '@/lib/env'
import { logger } from '@/lib/logger'
import { renderAsync } from '@react-email/components'
import type { ReactElement } from 'react'

async function renderReactEmail(react: ReactElement) {
  const [html, text] = await Promise.all([renderAsync(react), renderAsync(react, { plainText: true })])
  return { html, text }
}

type SendEmailOptions = {
  to: string
  subject: string
} & ({ html: string; text: string; react?: never } | { react: ReactElement; html?: never; text?: never })

export const sendEmail = async ({ react, ...options }: SendEmailOptions) => {
  const from = 'hello@epicstack.dev'

  const email = {
    from,
    ...options,
    ...(react ? await renderReactEmail(react) : null),
  }

  if (env.APP_ENV === 'local' || env.APP_ENV === 'test') {
    logger.debug(`Would have sent the following email to ${email.to}:\n${JSON.stringify(email)}`)
    return {
      ok: true,
    } as const
  }

  // TODO impl real email sending
  throw new Error('Not implemented')
}
