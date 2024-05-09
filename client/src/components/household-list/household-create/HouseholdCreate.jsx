import { useState } from "react";
import {
    Button,
    FormControl,
    FormLabel,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Text,
} from "@chakra-ui/react";

export default function HouseholdCreate({ isOpen, onClose }) {
    const [values, setValues] = useState({ name: '', members: [{ email: '', role: '' }] });

    const onMemberAddInput = () => {
        setValues({
            ...values,
            members: [...values.members, { email: '', role: '' }],
        });
    };

    const onMemberChange = (event, index) => {
        const updatedMembers = [...values.members];
        updatedMembers[index][event.target.name] = event.target.value;
        setValues({ ...values, members: updatedMembers });
    };

    const onMemberDeleteInput = (index) => {
        const updatedMembers = [...values.members];
        updatedMembers.splice(index, 1);
        setValues({ ...values, members: updatedMembers });
    };

    const onChange = (e) => {
        setValues((state) => ({
            ...state,
            [e.target.name]: e.target.value,
        }));
    };

    const onSubmit = (e) => {
        e.preventDefault();

        console.log(values);
    };

    const clearFormHandler = () => {
        setValues({ name: '', members: [{ email: '', role: '' }] });
    }

    const onCloseForm = () => {
        onClose();
        clearFormHandler();
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Създай домакинство</ModalHeader>
                <ModalCloseButton />
                <ModalBody pb={6}>
                    <form onSubmit={onSubmit}>
                        <FormControl mb={4}>
                            <FormLabel>Име</FormLabel>
                            <Input
                                type="text"
                                name="name"
                                value={values.name}
                                onChange={onChange}
                                placeholder="Име"
                            />
                        </FormControl>

                        <Text fontWeight="bold" fontSize="lg">Членове</Text>
                    
                        {values.members.map((member, index) => (
                            <div key={index}>

                                <FormControl mt={3}>
                                    <FormLabel>Имейл</FormLabel>
                                    <Input
                                        type="email"
                                        name="email"
                                        value={member.email}
                                        onChange={(e) => onMemberChange(e, index)}
                                        placeholder="Имейл"
                                    />
                                </FormControl>

                                <FormControl mt={2}>
                                    <FormLabel>Роля</FormLabel>
                                    <Input
                                        type="text"
                                        name="role"
                                        value={member.role}
                                        onChange={(e) => onMemberChange(e, index)}
                                        placeholder="Роля"
                                    />
                                </FormControl>

                                <Button
                                    mt={3}
                                    colorScheme="red"
                                    onClick={() => onMemberDeleteInput(index)}
                                >
                                    Премахни
                                </Button>
                                
                            </div>
                        ))}

                        <Button variant="primary" mt={3} onClick={onMemberAddInput}>
                            Добави член
                        </Button>
                    </form>
                </ModalBody>
                <ModalFooter>
                    <Button variant="primary" mr={3} onClick={onSubmit}>
                        Създай
                    </Button>
                    <Button onClick={onCloseForm}>Отмени</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}