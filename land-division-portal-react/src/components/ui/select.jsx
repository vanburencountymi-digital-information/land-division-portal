import { Select as ChakraSelect } from '@chakra-ui/react'
import * as React from 'react'

export const Select = React.forwardRef(function Select(props, ref) {
  const { value, onValueChange, children, ...rest } = props
  
  return (
    <ChakraSelect.Root
      ref={ref}
      value={value}
      onValueChange={onValueChange}
      {...rest}
    >
      <ChakraSelect.Trigger>
        <ChakraSelect.ValueText>{value}</ChakraSelect.ValueText>
      </ChakraSelect.Trigger>
      <ChakraSelect.Content>
        {children}
      </ChakraSelect.Content>
    </ChakraSelect.Root>
  )
})

export const SelectItem = React.forwardRef(function SelectItem(props, ref) {
  const { children, value, ...rest } = props
  return (
    <ChakraSelect.Item ref={ref} value={value} {...rest}>
      {children}
    </ChakraSelect.Item>
  )
})