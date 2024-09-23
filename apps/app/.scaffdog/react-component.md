---
name: 'react-component'
root: './app'
output: '**/components'
ignore: []
questions:
  name: 'Please enter component name.(Convert to Pascal case.)'
---

# {{ inputs.name | pascal }}/{{ inputs.name | pascal }}.tsx

```markdown
import type { FC } from 'react'

type Props = {
}

export const {{ inputs.name | pascal }}: FC<Props> = ({}) => {
  return <button type="button">{{ inputs.name | pascal }}</button>
}
```

# {{ inputs.name | pascal }}/{{ inputs.name | pascal }}.stories.tsx

```markdown
import type { Meta, StoryObj } from "@storybook/react"

import { {{ inputs.name | pascal }} as Component } from './{{ inputs.name | pascal }}'

export default {
  component: Component,
} as Meta<typeof Component>

export const Default: StoryObj<typeof Component> = {
  args: {},
}
```

# {{ inputs.name | pascal }}/{{ inputs.name | pascal }}.b.test.tsx

```markdown
import { render } from '@testing-library/react'
import type { ComponentPropsWithoutRef } from 'react'

import { {{ inputs.name | pascal }} } from './{{ inputs.name | pascal }}'

type ComponentProps = ComponentPropsWithoutRef<typeof {{ inputs.name | pascal }}>
const renderComponent = (props?: Partial<ComponentProps>) => {
  return render(<{{ inputs.name | pascal }} {...(props ?? {})} />)
}

describe('{{ inputs.name | pascal }}', () => {
  it('renders correctly', () => {
    const { getByRole } = renderComponent()
    expect(getByRole('button')).toBeInTheDocument()
  })
})
```
