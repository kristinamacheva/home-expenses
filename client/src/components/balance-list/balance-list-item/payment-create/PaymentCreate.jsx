import { useEffect, useState } from "react";
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
    Select,
    Stack,
    Text,
    useToast,
    Avatar,
    Box,
    Card,
} from "@chakra-ui/react";
import moment from "moment";
import { useContext } from "react";
import * as householdService from "../../../../services/householdService";
import * as paymentService from "../../../../services/paymentService";
import * as authService from "../../../../services/authService";
import { useParams } from "react-router-dom";
import AuthContext from "../../../../contexts/authContext";

const initialValues = {
    amount: "",
    date: moment().format("YYYY-MM-DD"),
    payee: "",
    paymentMethod: "",
};

export default function PaymentCreate({
    isOpen,
    onClose,
    balanceSum,
    fetchPayments,
}) {
    const { logoutHandler } = useContext(AuthContext);
    const { householdId } = useParams();

    const [payeeOptions, setPayeeOptions] = useState([]);
    const [selectedPayee, setSelectedPayee] = useState(null);
    const [bankDetails, setBankDetails] = useState({
        payeeIban: "",
        payerIban: "",
    });

    const [values, setValues] = useState(initialValues);
    const toast = useToast();

    const [errors, setErrors] = useState({
        amount: "",
        date: "",
        payee: "",
        paymentMethod: "",
    });

    useEffect(() => {
        householdService
            .getOnePayees(householdId)
            .then((result) => setPayeeOptions(result))
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

    useEffect(() => {
        const fetchBankDetails = async () => {
            if (values.paymentMethod === "Банков превод" && selectedPayee) {
                try {
                    const selectedBankDetails =
                        await authService.getBankDetails(selectedPayee._id);

                    setBankDetails(selectedBankDetails);
                } catch (error) {
                    toast({
                        title: "Грешка при зареждането на данните за превод",
                        description: error.message,
                        status: "error",
                        duration: 5000,
                        isClosable: true,
                    });

                    setValues((state) => ({
                        ...state,
                        paymentMethod: "",
                    }));
                }
            } else {
                setBankDetails({
                    payeeIban: "",
                    payerIban: "",
                });
            }
        };

        fetchBankDetails();
    }, [values.paymentMethod, selectedPayee]);

    const paymentMethodOptions = ["В брой", "Банков превод"];

    const onChange = (e) => {
        let value = e.target.value;
        setErrors((prevErrors) => ({ ...prevErrors, [e.target.name]: "" }));

        if (e.target.name === "amount") {
            const regex = /^\d*([\,\.]?\d{0,2})?$/;

            if (!regex.test(e.target.value)) {
                return;
            }

            value = Number(value) || 0;
        } else if (e.target.name === "payee") {
            const selected = payeeOptions.find((payee) => payee._id === value);
            setSelectedPayee(selected);
        }

        setValues((state) => ({
            ...state,
            [e.target.name]: value,
        }));
    };

    const validateForm = (values) => {
        const newErrors = {
            amount: "",
            date: "",
            payee: "",
            paymentMethod: "",
        };

        if (
            !values.amount ||
            isNaN(values.amount) ||
            Number(values.amount) <= 0
        ) {
            newErrors.amount = "Сумата трябва да бъде число, по-голямо от 0";
        } else if (Number(values.amount) > balanceSum) {
            newErrors.amount = `Сумата не може да бъде по-голяма от дължимата сума: ${balanceSum} лв.`;
        } else if (selectedPayee && Number(values.amount) > selectedPayee.sum) {
            newErrors.amount = `Сумата не може да бъде по-голяма от дължимата сума от домакинството: ${selectedPayee.sum} лв.`;
        }

        if (!values.date.trim()) {
            newErrors.date = "Датата не може да бъде празна";
        }

        if (!values.payee) {
            newErrors.payee = "Получателят трябва да бъде избран";
        }

        if (!values.paymentMethod) {
            newErrors.paymentMethod =
                "Методът на плащане трябва да бъде избран";
        } else if (
            values.paymentMethod === "Банков превод" &&
            (!bankDetails.payeeIban || !bankDetails.payerIban)
        ) {
            newErrors.paymentMethod =
                "Подателят и получателят трябва да имат валиден IBAN в профилите си, за да се извърши превода.";
        }

        setErrors(newErrors);

        return !Object.values(newErrors).some((error) => error);
    };

    const onSubmit = async (e) => {
        e.preventDefault();

        const isValid = validateForm(values);
        if (!isValid) return;

        const newPayment = {
            amount: values.amount,
            date: values.date,
            payee: values.payee,
            paymentMethod: values.paymentMethod,
        };

        if (values.paymentMethod === "Банков превод") {
            newPayment.bankDetails = values.bankDetails;
        }

        try {
            await paymentService.create(householdId, newPayment);

            toast({
                title: "Плащането е създанено.",
                description: "Успешно създадохте плащане.",
                status: "success",
                duration: 5000,
                isClosable: true,
            });

            fetchPayments(true);
            onCloseForm();
        } catch (error) {
            if (error.status === 401) {
                logoutHandler();
            } else {
                toast({
                    title: "Грешка.",
                    description: "Възникна грешка при създаването на плащането",
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
                <ModalHeader>Създайте плащане</ModalHeader>
                <ModalCloseButton />
                <ModalBody pb={6}>
                    <form onSubmit={onSubmit}>
                        <Stack
                            direction={{ base: "column", lg: "row" }}
                            spacing={{ lg: "4" }}
                        >
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
                                <Text mt={2} fontSize="sm" fontWeight="bold">
                                    Дължима сума: {balanceSum} лв.
                                </Text>
                            </FormControl>
                            <FormControl mb={4} isInvalid={errors.date}>
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
                        <Stack
                            direction={{ base: "column", lg: "row" }}
                            spacing={{ lg: "4" }}
                        >
                            <FormControl
                                mb={4}
                                isInvalid={errors.payee}
                                maxW={{ lg: "49%" }}
                            >
                                <FormLabel>Получател*</FormLabel>
                                <Select
                                    name="payee"
                                    value={values.payee}
                                    onChange={onChange}
                                    placeholder="Изберете получател"
                                >
                                    {payeeOptions.map((payee) => (
                                        <option
                                            key={payee._id}
                                            value={payee._id}
                                        >
                                            {payee.email}
                                        </option>
                                    ))}
                                </Select>
                                {errors.payee && (
                                    <Text color="red.500" fontSize="sm">
                                        {errors.payee}
                                    </Text>
                                )}
                            </FormControl>
                            {selectedPayee && (
                                <Card mt={4} p={4} width="100%">
                                    <Stack
                                        direction="row"
                                        align="center"
                                        spacing="4"
                                    >
                                        <Avatar
                                            src={selectedPayee.avatar}
                                            bg={selectedPayee.avatarColor}
                                        />
                                        <Box>
                                            <Text fontWeight="bold">
                                                {selectedPayee.name}
                                            </Text>
                                            <Text>
                                                Дължима сума от домакинството:{" "}
                                                {selectedPayee.sum} лв.
                                            </Text>
                                        </Box>
                                    </Stack>
                                </Card>
                            )}
                        </Stack>
                        <Stack
                            direction={{ base: "column", lg: "row" }}
                            spacing={{ lg: "4" }}
                        >
                            <FormControl
                                mb={4}
                                mt={{ base: "4", lg: "0" }}
                                isInvalid={errors.paymentMethod}
                                maxW={{ lg: "49%" }}
                            >
                                <FormLabel>Метод на плащане*</FormLabel>
                                <Select
                                    name="paymentMethod"
                                    value={values.paymentMethod}
                                    onChange={onChange}
                                    placeholder="Изберете метод на плащане"
                                >
                                    {paymentMethodOptions.map((method) => (
                                        <option key={method} value={method}>
                                            {method}
                                        </option>
                                    ))}
                                </Select>
                                {errors.paymentMethod && (
                                    <Text color="red.500" fontSize="sm">
                                        {errors.paymentMethod}
                                    </Text>
                                )}
                            </FormControl>
                            {bankDetails.payeeIban !== "" && (
                                <Card mt={4} p={4} width="100%">
                                    <Stack direction="column" spacing="4">
                                        <Text fontWeight="bold">
                                            След успешно създаване на плащането,
                                            можете да видите информацията за
                                            банковата сметка на получателя в
                                            детайлите на плащането.
                                        </Text>
                                    </Stack>
                                </Card>
                            )}
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
