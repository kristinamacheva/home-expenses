import { useEffect, useState } from "react";
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
} from "@chakra-ui/react";

import * as householdService from "../../../../services/householdService";

export default function HouseholdEdit({ isOpen, onClose, householdId }) {
    //request for email?
    // TODO: return only the id or email directly, manage newMembers in a seperate state
    // const [isLoading, setisLoading] = useState(true);
    const [household, setHousehold] = useState({
        name: "",
        members: [{ userId: "", role: "" }],
    });
    const [values, setValues] = useState({
        name: "",
        members: [{ userId: "", role: "" }],
        newMembers: [{ email: "", role: "" }],
    });

    useEffect(() => {
        // setisLoading(true);
        householdService
            .getOneReducedData(householdId)
            .then((result) => {
                // setisLoading(false);
                setHousehold(result);
                setValues((state) => ({
                    ...state,
                    name: result.name,
                    members: result.members,
                }));
            })
            .catch((err) => {
                console.log(err);
                // setisLoading(false);
            });
    }, [householdId]);

    // if (isLoading) {
    //     return <Spinner size='lg' />;
    // }
    console.log(values);
    console.log(household);

    const roles = ["Админ", "Член", "Дете"];

    const onMemberAddInput = () => {
        setValues({
            ...values,
            newMembers: [...values.newMembers, { email: "", role: "" }],
        });
    };

    const onMemberChange = (event, index) => {
        const updatedMembers = [...values.newMembers];
        updatedMembers[index][event.target.name] = event.target.value;
        setValues({ ...values, newMembers: updatedMembers });
    };

    const onMemberDeleteInput = (index) => {
        const updatedMembers = [...values.newMembers];
        updatedMembers.splice(index, 1);
        setValues({ ...values, newMembers: updatedMembers });
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
        setValues({ name: "", newMembers: [{ email: "", role: "" }] });
    };

    const onCloseForm = () => {
        clearFormHandler();
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onCloseForm}>
            <ModalOverlay />
            <ModalContent mx={{ base: "4", md: "0" }}>
                <ModalHeader>Редактирайте домакинство</ModalHeader>
                <ModalCloseButton />
                <ModalBody pb={6}>
                    <form onSubmit={onSubmit}>
                        <Stack>
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

                            {values.members.map((member, index) => (
                                <Box key={index}>
                                    <Text>{member.userId}</Text>

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
                                </Box>
                            ))}
                        </Stack>

                        <Stack>
                            <Text fontWeight="bold" fontSize="lg">
                                Добавете член
                            </Text>

                            {values.newMembers.map((member, index) => (
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

                                    {values.newMembers.length > 1 && (
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
