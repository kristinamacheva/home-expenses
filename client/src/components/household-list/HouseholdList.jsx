import React, { useState } from 'react';
import { Stack, Text, Button, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, useDisclosure } from '@chakra-ui/react';
import { FcLock } from 'react-icons/fc';
import DatePicker from '../custom/datepicker/DatePicker';

export default function HouseholdList() {
  const { isOpen: isCreateModalOpen, onOpen: onOpenCreateModal, onClose: onCloseCreateModal } = useDisclosure();
  const { isOpen: isEditModalOpen, onOpen: onOpenEditModal, onClose: onCloseEditModal } = useDisclosure();
  const [date, setDate] = useState(new Date())
  return (
    <Stack p="4" boxShadow="lg" m="4" borderRadius="sm">
      <Stack direction="row" alignItems="center">
        <Text fontWeight="semibold">Your Privacy</Text>
        <FcLock />
      </Stack>

      <Stack direction={{ base: 'column', md: 'row' }} justifyContent="space-between">
        <Text fontSize={{ base: 'sm' }} textAlign={'left'} maxW={'4xl'}>
          We use cookies and similar technologies to help personalise content, tailor and
          measure ads, and provide a better experience. By clicking OK or turning an
          option on in Cookie Preferences, you agree to this, as outlined in our Cookie
          Policy. To change preferences or withdraw consent, please update your Cookie
          Preferences.
        </Text>
        <Stack direction={{ base: 'column', md: 'row' }}>
          <Button onClick={onOpenCreateModal} variant="outline" colorScheme="green">
            Create
          </Button>
          <Button onClick={onOpenEditModal} colorScheme="green">
            Edit
          </Button>
        </Stack>
      </Stack>

      {/* Create Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={onCloseCreateModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create Household</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <DatePicker selectedDate={date} onChange={setDate} />
            <div>{date.toISOString()}</div>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onCloseCreateModal}>
              Close
            </Button>
            <Button variant="ghost">Save</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isEditModalOpen} onClose={onCloseEditModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Household</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {/* Your form for editing household */}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onCloseEditModal}>
              Close
            </Button>
            <Button variant="ghost">Save Changes</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Stack>
  );
}