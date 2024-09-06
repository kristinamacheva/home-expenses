import { useState } from "react";
import {
    Button,
    FormControl,
    FormLabel,
    Input,
    InputGroup,
    InputRightAddon,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Stack,
    Text,
    useToast,
} from "@chakra-ui/react";
import { useContext } from "react";
import AuthContext from "../../../contexts/authContext";
import * as childWishlistItemService from "../../../services/childWishlistItemService";
import { useParams } from "react-router-dom";

const initialValues = {
    title: "",
    amount: "",
};

export default function ChildWishlistItemCreate({
    isOpen,
    onClose,
    fetchChildWishlistItems,
}) {
    const { logoutHandler } = useContext(AuthContext);
    const { householdId } = useParams();
    const [values, setValues] = useState(initialValues);
    const toast = useToast();

    const [errors, setErrors] = useState({
        title: "",
        amount: "",
    });

    const onChange = async (e) => {
        let value = e.target.value;
        setErrors((prevErrors) => ({ ...prevErrors, [e.target.name]: "" }));

        if (e.target.name === "amount") {
            const regex = /^\d*([\,\.]?\d{0,2})?$/;

            if (!regex.test(e.target.value)) {
                // If input does not match the regex, do not update state
                return;
            }

            value = Number(value) || 0;
        }

        setValues((state) => ({
            ...state,
            [e.target.name]: value,
        }));
    };

    const validateForm = (values) => {
        const newErrors = {
            title: "",
            amount: "",
        };

        if (!values.title.trim()) {
            newErrors.title = "Заглавието не може да бъде празно";
        }

        if (
            !values.amount ||
            isNaN(values.amount) ||
            Number(values.amount) <= 0
        ) {
            newErrors.amount = "Сумата трябва да бъде число, по-голямо от 0";
        }

        setErrors(newErrors);

        return !Object.values(newErrors).some((error) => error);
    };

    const onSubmit = async (e) => {
        e.preventDefault();

        const isValid = validateForm(values);
        if (!isValid) return;

        const newChildWishlistItem = {
            title: values.title,
            amount: values.amount,
        };

        try {
            await childWishlistItemService.create(
                householdId,
                newChildWishlistItem
            );

            toast({
                title: "Желанието е създанено.",
                description: "Успешно създадохте желание.",
                status: "success",
                duration: 5000,
                isClosable: true,
            });

            fetchChildWishlistItems(true);
            onCloseForm();
        } catch (error) {
            if (error.status === 401) {
                logoutHandler();
            } else {
                toast({
                    title: "Грешка.",
                    description:
                        error.message ||
                        "Възникна грешка при създаването на желанието",
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
                <ModalHeader>Създайте желание</ModalHeader>
                <ModalCloseButton />
                <ModalBody pb={6}>
                    <form onSubmit={onSubmit}>
                        <Stack
                            direction={{ base: "column", lg: "row" }}
                            spacing={{ lg: "4" }}
                        >
                            <FormControl
                                mb={4}
                                isInvalid={errors.title}
                                isRequired
                            >
                                <FormLabel>Заглавие</FormLabel>
                                <Input
                                    type="text"
                                    name="title"
                                    value={values.title}
                                    onChange={onChange}
                                    placeholder="Въведете заглавие"
                                />
                                {errors.title && (
                                    <Text color="red.500" fontSize="sm">
                                        {errors.title}
                                    </Text>
                                )}
                            </FormControl>

                            <FormControl
                                mb={4}
                                isInvalid={errors.amount}
                                isRequired
                            >
                                <FormLabel>Сума</FormLabel>
                                <InputGroup>
                                    <Input
                                        type="number"
                                        name="amount"
                                        value={values.amount}
                                        onChange={onChange}
                                        placeholder="Въведете сума"
                                    />
                                    <InputRightAddon>лв.</InputRightAddon>
                                </InputGroup>
                                {errors.amount && (
                                    <Text color="red.500" fontSize="sm">
                                        {errors.amount}
                                    </Text>
                                )}
                            </FormControl>
                        </Stack>
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
