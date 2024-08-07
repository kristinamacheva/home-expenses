import { useState } from "react";
import {
    Button,
    Divider,
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
import moment from "moment";
import { useContext } from "react";
import AuthContext from "../../../contexts/authContext";
import * as childExpenseService from "../../../services/childExpenseService";
import { useParams } from "react-router-dom";

const initialValues = {
    title: "",
    amount: "",
    date: moment().format("YYYY-MM-DD"),
};

export default function ChildExpenseCreate({
    isOpen,
    onClose,
    fetchChildExpenses,
}) {
    const { logoutHandler } = useContext(AuthContext);
    const { householdId } = useParams();
    const [values, setValues] = useState(initialValues);
    const toast = useToast();

    const [errors, setErrors] = useState({
        title: "",
        amount: "",
        date: "",
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
            date: "",
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

        if (!values.date.trim()) {
            newErrors.date = "Датата не може да бъде празна";
        }

        setErrors(newErrors);

        return !Object.values(newErrors).some((error) => error);
    };

    const onSubmit = async (e) => {
        e.preventDefault();

        const isValid = validateForm(values);
        if (!isValid) return;

        const newChildExpense = {
            title: values.title,
            amount: values.amount,
            date: values.date,
        };

        console.log(newChildExpense);
        

        try {
            await childExpenseService.create(householdId, newChildExpense);

            toast({
                title: "Разходът е създанен.",
                description: "Успешно създадохте разход.",
                status: "success",
                duration: 5000,
                isClosable: true,
            });

            fetchChildExpenses(true);
            onCloseForm();
        } catch (error) {
            if (error.status === 401) {
                logoutHandler();
            } else {
                toast({
                    title: "Грешка.",
                    description:
                        error.message ||
                        "Възникна грешка при създаването на разхода",
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
                <ModalHeader>Създайте разход</ModalHeader>
                <ModalCloseButton />
                <ModalBody pb={6}>
                    <form onSubmit={onSubmit}>
                        <Stack
                            direction={{ base: "column", lg: "row" }}
                            spacing={{ lg: "4" }}
                        >
                            <FormControl mb={4} isInvalid={errors.title}>
                                <FormLabel>Заглавие*</FormLabel>
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

                            <FormControl mb={4} isInvalid={errors.amount}>
                                <FormLabel>Сума*</FormLabel>
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
                        <Stack
                            direction={{ base: "column", lg: "row" }}
                            spacing={{ lg: "4" }}
                        >
                            <FormControl
                                mb={4}
                                isInvalid={errors.date}
                                maxW={{ lg: "49%" }}
                            >
                                <FormLabel>Дата*</FormLabel>
                                <Input
                                    type="date"
                                    name="date"
                                    value={values.date}
                                    onChange={onChange}
                                    placeholder="Изберете дата"
                                />
                                {errors.date && (
                                    <Text color="red.500" fontSize="sm">
                                        {errors.date}
                                    </Text>
                                )}
                            </FormControl>
                        </Stack>
                        <Divider mb="3" />
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
