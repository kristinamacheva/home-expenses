import { useContext, useEffect, useState } from "react";
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
    Spinner,
    Stack,
    Text,
    useToast,
} from "@chakra-ui/react";

import * as householdService from "../../../../services/householdService";
import AuthContext from "../../../../contexts/authContext";

export default function HouseholdEdit({
    isOpen,
    onClose,
    householdId,
    fetchHouseholds,
}) {
    const [isLoading, setIsLoading] = useState(true);
    const [values, setValues] = useState({
        name: "",
        members: [],
        newMembers: [{ email: "", role: "" }],
    });
    const [errors, setErrors] = useState({
        name: "",
        members: [{ role: "" }],
        newMembers: [{ email: "", role: "" }],
    });

    const { logoutHandler } = useContext(AuthContext);
    const toast = useToast();

    useEffect(() => {
        setIsLoading(true);
        householdService
            .getOneWithMemberEmails(householdId)
            .then((result) => {
                setValues((state) => ({
                    ...state,
                    name: result.name,
                    members: result.members,
                }));
                setIsLoading(false);
            })
            .catch((error) => {
                if (error.status === 401) {
                    logoutHandler();
                } else {
                    toast({
                        title:
                            error.message ||
                            "Неуспешно зареждане на домакинство",
                        status: "error",
                        duration: 6000,
                        isClosable: true,
                        position: "bottom",
                    });
                }

                setIsLoading(false);
            });
    }, [householdId]);

    const roles = ["Админ", "Член", "Дете"];

    if (isLoading) {
        return <Spinner size="lg" />;
    }

    const onExistingMemberChange = (event, index) => {
        const updatedMembers = [...values.members];
        updatedMembers[index][event.target.name] = event.target.value;
        setValues({ ...values, members: updatedMembers });
    };

    const onNewMemberChange = (event, index) => {
        const updatedMembers = [...values.newMembers];
        updatedMembers[index][event.target.name] = event.target.value;
        setValues({ ...values, newMembers: updatedMembers });
    };

    const onMemberAddInput = () => {
        setValues({
            ...values,
            newMembers: [...values.newMembers, { email: "", role: "" }],
        });
        setErrors({
            ...errors,
            newMembers: [...errors.newMembers, { email: "", role: "" }],
        });
    };

    const onMemberDeleteInput = (index, isExistingMember) => {
        if (isExistingMember) {
            // Check if the member is an admin
            const isAdmin = values.members[index].role === "Админ";

            // Check if there are other admins
            const otherAdminsExist = values.members.some(
                (member, i) => i !== index && member.role === "Админ"
            );

            // Prevent deleting the last admin if there are no other admins
            if (isAdmin && !otherAdminsExist) {
                // Show a toast message
                toast({
                    title: "Не може да премахнете последния администратор",
                    status: "error",
                    duration: 6000,
                    isClosable: true,
                    position: "bottom",
                });
                return;
            }

            const updatedMembers = [...values.members];
            updatedMembers.splice(index, 1);
            setValues({ ...values, members: updatedMembers });

            const updatedErrors = [...errors.members];
            updatedErrors.splice(index, 1);
            setErrors({ ...errors, members: updatedErrors });
        } else {
            const updatedMembers = [...values.newMembers];
            updatedMembers.splice(index, 1);
            setValues({ ...values, newMembers: updatedMembers });

            const updatedErrors = [...errors.newMembers];
            updatedErrors.splice(index, 1);
            setErrors({ ...errors, newMembers: updatedErrors });
        }
    };

    const onChange = (e) => {
        setValues((state) => ({
            ...state,
            [e.target.name]: e.target.value,
        }));
    };

    const validateForm = (updatedHousehold) => {
        let valid = true;
        let newErrors = { name: "", members: [], newMembers: [] };

        if (!updatedHousehold.name) {
            newErrors.name = "Полето име е задължително";
            valid = false;
        }

        let isAdminExists = false; // Flag to check if at least one admin exists

        updatedHousehold.members.forEach((member, index) => {
            if (!member.role) {
                newErrors.members[index] = {
                    role: "Полето роля е задължително",
                };
                valid = false;
            } else {
                newErrors.members[index] = { role: "" };
                if (member.role === "Админ") {
                    isAdminExists = true; // Set flag if admin role is found
                }
            }
        });

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        updatedHousehold.newMembers.forEach((member, index) => {
            let memberErrors = { email: "", role: "" };
            if (!member.email) {
                memberErrors.email = "Полето имейл е задължително";
                valid = false;
            } else if (!emailRegex.test(member.email)) {
                memberErrors.email = "Невалиден имейл адрес";
                valid = false;
            }
            if (!member.role) {
                memberErrors.role = "Полето роля е задължително";
                valid = false;
            } else if (member.role === "Админ") {
                isAdminExists = true; // Set flag if admin role is found
            }
            newErrors.newMembers[index] = memberErrors;
        });

        // Check if at least one admin exists in members
        if (!isAdminExists) {
            toast({
                title: "Поне един член трябва да бъде администратор",
                status: "error",
                duration: 6000,
                isClosable: true,
                position: "bottom",
            });
            valid = false;
        }

        setErrors(newErrors);
        return valid;
    };

    const onSubmit = async (e) => {
        e.preventDefault();

        const updatedHousehold = {
            name: values.name,
            members: values.members.map((member) => ({
                _id: member._id,
                role: member.role,
            })),
            newMembers: values.newMembers,
        };

        // Validate form fields
        if (!validateForm(updatedHousehold)) {
            return;
        }

        try {
            await householdService.edit(householdId, updatedHousehold);

            toast({
                title: "Успешно редактиране на домакинството",
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
                        error.message ||
                        "Неуспешно редактиране на домакинството",
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
            <ModalContent
                mx={{ base: "4", md: "0" }}
                maxW={{ base: "90vw", md: "80vw", lg: "65vw" }}
            >
                <ModalHeader>Редактирайте домакинство</ModalHeader>
                <ModalCloseButton />
                <ModalBody pb={6}>
                    <form onSubmit={onSubmit}>
                        <Stack
                            direction={{ base: "column", lg: "row" }}
                            gap="10"
                        >
                            <Stack flex="1">
                                <Text fontWeight="bold" fontSize="lg">
                                    Текущо домакинство
                                </Text>

                                <FormControl mt={2} isInvalid={errors.name}>
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
                                        <Text fontWeight="bold">
                                            Потребител
                                        </Text>
                                        <Text mt={2}>{member.email}</Text>

                                        <FormControl
                                            mt={2}
                                            isInvalid={
                                                errors.members[index]?.role
                                            }
                                            isRequired
                                        >
                                            <FormLabel>Роля</FormLabel>
                                            <Select
                                                name="role"
                                                value={member.role}
                                                onChange={(e) =>
                                                    onExistingMemberChange(
                                                        e,
                                                        index
                                                    )
                                                }
                                                placeholder="Изберете роля"
                                            >
                                                {roles.map((role) => (
                                                    <option
                                                        key={role}
                                                        value={role}
                                                    >
                                                        {role}
                                                    </option>
                                                ))}
                                            </Select>
                                            {errors.members[index]?.role && (
                                                <Text
                                                    color="red.500"
                                                    fontSize="sm"
                                                >
                                                    {errors.members[index].role}
                                                </Text>
                                            )}
                                        </FormControl>
                                        {values.members.length > 1 && (
                                            <Button
                                                mt={3}
                                                colorScheme="red"
                                                onClick={() =>
                                                    onMemberDeleteInput(
                                                        index,
                                                        true
                                                    )
                                                }
                                            >
                                                Премахнете
                                            </Button>
                                        )}
                                    </Box>
                                ))}
                            </Stack>

                            <Stack flex="1">
                                <Text fontWeight="bold" fontSize="lg">
                                    Добавяне на членове
                                </Text>
                                {values.newMembers.length > 0 &&
                                    values.newMembers.map((member, index) => (
                                        <Box key={index}>
                                            <FormControl
                                                mt={2}
                                                isInvalid={
                                                    errors.newMembers[index]
                                                        ?.email
                                                }
                                                isRequired
                                            >
                                                <FormLabel>Имейл</FormLabel>
                                                <Input
                                                    type="email"
                                                    name="email"
                                                    value={member.email}
                                                    onChange={(e) =>
                                                        onNewMemberChange(
                                                            e,
                                                            index
                                                        )
                                                    }
                                                    placeholder="Имейл"
                                                />
                                                {errors.newMembers[index]
                                                    ?.email && (
                                                    <Text
                                                        color="red.500"
                                                        fontSize="sm"
                                                    >
                                                        {
                                                            errors.newMembers[
                                                                index
                                                            ]?.email
                                                        }
                                                    </Text>
                                                )}
                                            </FormControl>

                                            <FormControl
                                                mt={2}
                                                isInvalid={
                                                    errors.newMembers[index]
                                                        ?.role
                                                }
                                                isRequired
                                            >
                                                <FormLabel>Роля</FormLabel>
                                                <Select
                                                    name="role"
                                                    value={member.role}
                                                    onChange={(e) =>
                                                        onNewMemberChange(
                                                            e,
                                                            index
                                                        )
                                                    }
                                                    placeholder="Изберете роля"
                                                >
                                                    {roles.map((role) => (
                                                        <option
                                                            key={role}
                                                            value={role}
                                                        >
                                                            {role}
                                                        </option>
                                                    ))}
                                                </Select>
                                                {errors.newMembers[index]
                                                    ?.role && (
                                                    <Text
                                                        color="red.500"
                                                        fontSize="sm"
                                                    >
                                                        {
                                                            errors.newMembers[
                                                                index
                                                            ]?.role
                                                        }
                                                    </Text>
                                                )}
                                            </FormControl>

                                            <Button
                                                mt={3}
                                                colorScheme="red"
                                                onClick={() =>
                                                    onMemberDeleteInput(
                                                        index,
                                                        false
                                                    )
                                                }
                                            >
                                                Премахнете
                                            </Button>
                                        </Box>
                                    ))}
                                <Box display="inline-block">
                                    <Button
                                        variant="primary"
                                        onClick={onMemberAddInput}
                                    >
                                        Добавете член
                                    </Button>
                                </Box>
                            </Stack>
                        </Stack>
                    </form>
                </ModalBody>
                <ModalFooter>
                    <Button variant="primary" mr={3} onClick={onSubmit}>
                        Редактирайте
                    </Button>
                    <Button onClick={onCloseForm}>Отменете</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
