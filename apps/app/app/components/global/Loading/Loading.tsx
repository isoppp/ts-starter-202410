import type { FC, ReactNode } from 'react'

import styles from './Loading.module.css'
type Props = {
  type: 'fullscreen-center' | 'inline' | 'overlay'
  children?: ReactNode
}

export const Loading: FC<Props> = ({ type, children }) => {
  if (type === 'fullscreen-center') {
    return (
      <div className="flex min-h-dvh w-full items-center justify-center">
        <div className={styles.spinner} aria-label="loading" />
      </div>
    )
  }
  if (type === 'overlay') {
    return (
      <div className="relative">
        <div className="bg-overlay absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-[1px]">
          <div className={styles.spinner} aria-label="loading" />
        </div>
        {children}
      </div>
    )
  }
  return <div className={styles.spinner} aria-label="loading" />
}
