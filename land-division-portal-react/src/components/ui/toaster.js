import { createToaster } from '@chakra-ui/react'

export const toaster = createToaster({
  defaultOptions: {
    duration: 5000,
    position: 'top',
    isClosable: true,
  }
})