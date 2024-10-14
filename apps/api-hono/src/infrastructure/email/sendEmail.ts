import { serviceDomain } from '@/config/app'
import { env } from '@/lib/env'
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
  const from = `noreply@${serviceDomain}`

  const email = {
    from,
    ...options,
    ...(react ? await renderReactEmail(react) : null),
  }

  if (env.APP_ENV === 'local' || env.APP_ENV === 'test') {
    console.log(
      `Would have sent the following email to ${email.to}:\n${env.APP_ENV === 'test' ? 'omit email content because of test env' : JSON.stringify(email)}`,
    )
    return {
      ok: true,
    } as const
  }

  if (email.to.endsWith('@example.com')) {
    throw new Error('Cannot send email to example.com, you might have bug in your code?')
  }

  // TODO send email
  throw Error('Not implemented')

  // logger.info('Sent email', { email })
  // return { ok: true }
}
