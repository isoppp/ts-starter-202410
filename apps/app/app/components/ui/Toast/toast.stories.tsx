import type { Meta, StoryObj } from '@storybook/react'
import { useEffect } from 'react'

import { useToast } from '@/components/ui/Toast/use-toast'
import { Button } from '@/components/ui/button'

import { Toast as Component, ToastAction } from './toast'

export default {
  component: Component,
} satisfies Meta<typeof Component>

export const Default: StoryObj<typeof Component> = {
  render: () => {
    const { toast } = useToast()
    const showToast = async () => {
      toast({ title: 'default', description: 'World', variant: 'default' })
      toast({
        title: 'destructive',
        description: 'World',
        variant: 'error',
        action: <ToastAction altText="Try again">Try again</ToastAction>,
      })
    }
    useEffect(() => {
      showToast()
    }, [])
    return <Button onClick={showToast}>Show Toast</Button>
  },
  args: {},
}
