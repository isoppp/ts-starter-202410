import type { Meta, StoryObj } from '@storybook/react'

import { Authenticated as Component } from './Authenticated'

export default {
  component: Component,
} as Meta<typeof Component>

export const Default: StoryObj<typeof Component> = {
  args: {},
}
