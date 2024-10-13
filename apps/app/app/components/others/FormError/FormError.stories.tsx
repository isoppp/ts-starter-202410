import type { Meta, StoryObj } from '@storybook/react'

import { FormError as Component } from './FormError'

export default {
  component: Component,
} as Meta<typeof Component>

export const Default: StoryObj<typeof Component> = {
  args: {},
}
