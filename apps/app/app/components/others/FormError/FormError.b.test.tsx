import { render } from '@testing-library/react'
import type { ComponentPropsWithoutRef } from 'react'

import { FormError } from './FormError'

type ComponentProps = ComponentPropsWithoutRef<typeof FormError>
const renderComponent = (props?: Partial<ComponentProps>) => {
  return render(<FormError message={'message'} {...(props ?? {})} />)
}

describe('FormError', () => {
  it('renders correctly', () => {
    const { getByText } = renderComponent()
    expect(getByText('message')).toBeInTheDocument()
  })
})
