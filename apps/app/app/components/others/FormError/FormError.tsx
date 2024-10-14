import type { FC } from 'react'

type Props = {
  message: string
}

export const FormError: FC<Props> = ({ message }) => {
  return <div className="text-xs text-destructive">{message}</div>
}
