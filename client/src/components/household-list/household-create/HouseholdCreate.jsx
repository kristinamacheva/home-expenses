import { useState } from "react";
import {
    Box,
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
    Select,
    Text,
} from "@chakra-ui/react";

import * as householdService from '../../../services/householdService';
import Path from "../../../paths";

export default function HouseholdCreate({ isOpen, onClose, addHouseholdToState }) {
    const [values, setValues] = useState({
        name: "",
        members: [{ email: "", role: "" }],
    });
    const roles = ["Админ", "Член", "Дете"];

    const userId = "6649f627d4819c1373f8b8e9";

    const onMemberAddInput = () => {
        setValues({
            ...values,
            members: [...values.members, { email: "", role: "" }],
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

    const onSubmit = async (e) => {
        e.preventDefault();

        const newHousehold = {
            name: values.name,
            members: values.members,
            admin: userId,
        };

        try {
            const result = await householdService.create(newHousehold);

            addHouseholdToState(result);
            onCloseForm(); 
        } catch (err) {
            //TODO Error notification - toast
            console.log(err);
        }
    };

    const clearFormHandler = () => {
        setValues({ name: "", members: [{ email: "", role: "" }] });
    };

    //TODO: find a better solution
    // const reload = () => window.location.reload();

    const onCloseForm = () => {
        clearFormHandler();
        onClose();
        // reload();
    };

    return (
        <Modal isOpen={isOpen} onClose={onCloseForm}>
            <ModalOverlay />
            <ModalContent mx={{ base: "4", md: "0" }}>
                <ModalHeader>Създайте домакинство</ModalHeader>
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

                        <Text fontWeight="bold" fontSize="lg">
                            Членове
                        </Text>

                        {values.members.map((member, index) => (
                            <Box key={index}>
                                <FormControl mt={3}>
                                    <FormLabel>Имейл</FormLabel>
                                    <Input
                                        type="email"
                                        name="email"
                                        value={member.email}
                                        onChange={(e) =>
                                            onMemberChange(e, index)
                                        }
                                        placeholder="Имейл"
                                    />
                                </FormControl>

                                <FormControl mt={2}>
                                    <FormLabel>Роля</FormLabel>
                                    <Select
                                        name="role"
                                        value={member.role}
                                        onChange={(e) =>
                                            onMemberChange(e, index)
                                        }
                                        placeholder="Изберете роля"
                                    >
                                        {roles.map((role) => (
                                            <option key={role} value={role}>
                                                {role}
                                            </option>
                                        ))}
                                    </Select>
                                </FormControl>

                                {values.members.length > 1 && (
                                    <Button
                                        mt={3}
                                        colorScheme="red"
                                        onClick={() =>
                                            onMemberDeleteInput(index)
                                        }
                                    >
                                        Премахнете
                                    </Button>
                                )}
                            </Box>
                        ))}

                        <Button
                            variant="primary"
                            mt={3}
                            onClick={onMemberAddInput}
                        >
                            Добавете член
                        </Button>
                    </form>
                </ModalBody>
                <ModalFooter>
                    <Button variant="primary" mr={3} onClick={onSubmit}>
                        Създайте
                    </Button>
                    <Button onClick={onCloseForm}>Отменете</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
