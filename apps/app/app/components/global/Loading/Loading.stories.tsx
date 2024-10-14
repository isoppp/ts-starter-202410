import type { Meta, StoryObj } from '@storybook/react'

import { Loading as Component } from './Loading'

export default {
  component: Component,
} satisfies Meta<typeof Component>

export const Inline: StoryObj<typeof Component> = {
  args: {
    type: 'inline',
  },
}

export const FullScreenCenter: StoryObj<typeof Component> = {
  args: {
    type: 'fullscreen-center',
  },
}
export const Overlay: StoryObj<typeof Component> = {
  args: {
    type: 'overlay',
    children: <div className="border-2 p-10">sample</div>,
  },
}
