import { useEffect, useState } from "react";
import {
    Button,
    FormControl,
    FormLabel,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Select,
    Stack,
    Text,
    useToast,
    Avatar,
    Box,
    Card,
} from "@chakra-ui/react";
import { useContext } from "react";
import * as householdService from "../../../../services/householdService";
import * as reminderService from "../../../../services/reminderService";
import { useParams } from "react-router-dom";
import AuthContext from "../../../../contexts/authContext";

const initialValues = {
    receiver: "",
};

export default function ReminderCreate({ isOpen, onClose, balanceSum }) {
    const { logoutHandler, name } = useContext(AuthContext);
    const { householdId } = useParams();

    const [receiverOptions, setReceiverOptions] = useState([]);
    const [selectedReceiver, setSelectedReceiver] = useState(null);

    const [values, setValues] = useState(initialValues);
    const toast = useToast();

    const [errors, setErrors] = useState({
        receiver: "",
    });

    useEffect(() => {
        householdService
            .getOnePayers(householdId)
            .then((result) => setReceiverOptions(result))
            .catch((error) => {
                if (error.status === 401) {
                    logoutHandler();
                } else {
                    toast({
                        title:
                            error.message ||
                            "Неуспешно зареждане на членовете на домакинството",
                        status: "error",
                        duration: 6000,
                        isClosable: true,
                        position: "bottom",
                    });
                }
            });
    }, [householdId]);

    const onChange = (e) => {
        let value = e.target.value;
        setErrors((prevErrors) => ({ ...prevErrors, [e.target.name]: "" }));

        const selected = receiverOptions.find(
            (receiver) => receiver._id === value
        );
        setSelectedReceiver(selected);

        setValues((state) => ({
            ...state,
            [e.target.name]: value,
        }));
    };

    const validateForm = (values) => {
        const newErrors = {
            receiver: "",
        };

        if (!values.receiver) {
            newErrors.receiver = "Получателят трябва да бъде избран";
        }

        setErrors(newErrors);

        return !Object.values(newErrors).some((error) => error);
    };

    const onSubmit = async (e) => {
        e.preventDefault();

        const isValid = validateForm(values);
        if (!isValid) return;

        const newReminder = {
            message: `Имате непогасено задължение към ${name}.`,
            household: householdId,
            receiver: values.receiver,
        };

        try {
            await reminderService.create(newReminder);

            toast({
                title: "Напомнянето е изпратено.",
                description: "Успешно изпратихте напомняне.",
                status: "success",
                duration: 5000,
                isClosable: true,
            });

            onCloseForm();
        } catch (error) {
            if (error.status === 401) {
                logoutHandler();
            } else {
                toast({
                    title: "Грешка.",
                    description:
                        "Възникна грешка при изпращането на напомнянето",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
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
                <ModalHeader>Изпратете напомняне</ModalHeader>
                <ModalCloseButton />
                <ModalBody pb={6}>
                    <form onSubmit={onSubmit}>
                        <Text mb={2}>
                            Дължима сума от домакинството:{" "}
                            {balanceSum.toFixed(2)} лв.
                        </Text>
                        <Stack
                            direction={{ base: "column", lg: "row" }}
                            spacing={{ lg: "4" }}
                        >
                            <FormControl
                                mb={4}
                                isInvalid={errors.receiver}
                                maxW={{ lg: "49%" }}
                            >
                                <FormLabel>Получател</FormLabel>
                                <Select
                                    name="receiver"
                                    value={values.receiver}
                                    onChange={onChange}
                                    placeholder="Изберете получател"
                                >
                                    {receiverOptions.map((receiver) => (
                                        <option
                                            key={receiver._id}
                                            value={receiver._id}
                                        >
                                            {receiver.email}
                                        </option>
                                    ))}
                                </Select>
                                {errors.receiver && (
                                    <Text color="red.500" fontSize="sm">
                                        {errors.receiver}
                                    </Text>
                                )}
                            </FormControl>
                            {selectedReceiver && (
                                <Card mt={4} p={4} width="100%">
                                    <Stack
                                        direction="row"
                                        align="center"
                                        spacing="4"
                                    >
                                        <Avatar
                                            src={selectedReceiver.avatar}
                                            bg={selectedReceiver.avatarColor}
                                        />
                                        <Box>
                                            <Text fontWeight="bold">
                                                {selectedReceiver.name}
                                            </Text>
                                            <Text>
                                                Сума, която дължи на
                                                домакинството:{" "}
                                                {selectedReceiver.sum} лв.
                                            </Text>
                                        </Box>
                                    </Stack>
                                </Card>
                            )}
                        </Stack>
                    </form>
                </ModalBody>
                <ModalFooter>
                    <Button variant="primary" mr={3} onClick={onSubmit}>
                        Изпратете
                    </Button>
                    <Button onClick={onCloseForm}>Отменете</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
