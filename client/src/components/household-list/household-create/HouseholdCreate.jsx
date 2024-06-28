import { useContext, useState } from "react";
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
    useToast,
} from "@chakra-ui/react";

import * as householdService from "../../../services/householdService";
import AuthContext from "../../../contexts/authContext";

export default function HouseholdCreate({ isOpen, onClose, fetchHouseholds }) {
    const [values, setValues] = useState({
        name: "",
        members: [{ email: "", role: "" }],
    });
    const [errors, setErrors] = useState({
        name: "",
        members: [{ email: "", role: "" }],
    });

    const { logoutHandler } = useContext(AuthContext);
    const toast = useToast();

    const roles = ["Админ", "Член", "Дете"];

    const onMemberAddInput = () => {
        setValues({
            ...values,
            members: [...values.members, { email: "", role: "" }],
        });

        setErrors({
            ...errors,
            members: [...errors.members, { email: "", role: "" }],
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

        const updatedErrors = [...errors.members];
        updatedErrors.splice(index, 1);
        setErrors({ ...errors, members: updatedErrors });
    };

    const onChange = (e) => {
        setValues((state) => ({
            ...state,
            [e.target.name]: e.target.value,
        }));
    };

    const validateForm = (currentHousehold) => {
        const newErrors = {
            name: "",
            members: currentHousehold.members.map(() => ({
                email: "",
                role: "",
            })),
        };

        if (!currentHousehold.name.trim()) {
            newErrors.name = "Името не може да бъде празно";
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        currentHousehold.members.forEach((member, index) => {
            if (!member.email.trim()) {
                newErrors.members[index].email =
                    "Имейлът не може да бъде празен";
            } else if (!emailRegex.test(member.email)) {
                newErrors.members[index].email = "Невалиден имейл";
            }

            if (!member.role.trim()) {
                newErrors.members[index].role = "Ролята не може да бъде празна";
            } else if (!roles.includes(member.role)) {
                newErrors.members[index].role =
                    'Невалидна роля. Позволени стойности са "Админ", "Член" или "Дете".';
            }
        });

        setErrors(newErrors);

        // Return true if there are no errors
        return (
            !newErrors.name &&
            newErrors.members.every((member) => !member.email && !member.role)
        );
    };

    const onSubmit = async (e) => {
        e.preventDefault();

        setErrors({
            name: "",
            members: [{ email: "", role: "" }],
        });

        const newHousehold = {
            name: values.name,
            members: values.members,
        };

        // Validate form fields
        if (!validateForm(newHousehold)) {
            return;
        }

        try {
            await householdService.create(newHousehold);

            toast({
                title: "Успешно създаване на домакинство",
                status: "success",
                duration: 6000,
                isClosable: true,
                position: "bottom",
            });

            fetchHouseholds();
            onCloseForm();
        } catch (error) {
            if (error.status === 401) {
                logoutHandler();
            } else {
                toast({
                    title:
                        error.message || "Неуспешно създаване на домакинство",
                    status: "error",
                    duration: 6000,
                    isClosable: true,
                    position: "bottom",
                });
            }
        }
    };

    const onCloseForm = () => {
        onClose();
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
                            {errors.name && (
                                <Text color="red.500" fontSize="sm">
                                    {errors.name}
                                </Text>
                            )}
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
                                    {errors.members[index]?.email && (
                                        <Text color="red.500" fontSize="sm">
                                            {errors.members[index].email}
                                        </Text>
                                    )}
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
                                    {errors.members[index]?.role && (
                                        <Text color="red.500" fontSize="sm">
                                            {errors.members[index].role}
                                        </Text>
                                    )}
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
