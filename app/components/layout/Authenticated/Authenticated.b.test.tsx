import { render } from '@testing-library/react'
import type { ComponentPropsWithoutRef } from 'react'

import { createRemixStub } from '@remix-run/testing'
import { Authenticated } from './Authenticated'

type ComponentProps = ComponentPropsWithoutRef<typeof Authenticated>
const renderComponent = (props?: Partial<ComponentProps>) => {
  const RemixStub = createRemixStub([
    {
      path: '/',
      // biome-ignore lint/correctness/noChildrenProp: <explanation>
      Component: () => <Authenticated children={'children'} {...(props ?? {})} />,
    },
  ])

  return render(<RemixStub />)
}

describe('Authenticated', () => {
  it.skip('TODO: renders correctly', () => {
    renderComponent()
  })
})
