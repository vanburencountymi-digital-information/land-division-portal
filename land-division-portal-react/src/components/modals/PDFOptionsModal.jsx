import {
  Dialog,
  Button,
  VStack,
  Text
} from '@chakra-ui/react';

function PDFOptionsModal({ open, onOpenChange, onConfirm }) {
  return (
    <Dialog.Root 
      open={open} 
      onOpenChange={onOpenChange}
    >
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content>
          <Dialog.Header>Include Contour Map?</Dialog.Header>
          <Dialog.CloseTrigger />
          <Dialog.Body pb={6}>
            <VStack spacing={4} align="stretch">
              <Text>
                Would you like to include the contour map for this parcel in your PDF download?
              </Text>
              <Button colorScheme="blue" onClick={() => onConfirm(true)}>
                Yes, include contour map
              </Button>
              <Button variant="outline" onClick={() => onConfirm(false)}>
                No, just the basic PDF
              </Button>
            </VStack>
          </Dialog.Body>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}

export default PDFOptionsModal;