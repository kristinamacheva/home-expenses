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
import * as paymentService from "../../../../services/paymentService";
import AuthContext from "../../../../contexts/authContext";

export default function PaymentEdit({
    isOpen,
    onClose,
    householdId,
    paymentId,
    fetchPayments,
    fetchBalances,
}) {
    const { logoutHandler } = useContext(AuthContext);

    const [selectedPayee, setSelectedPayee] = useState(null);
    const [payerBalanceSum, setPayerBalanceSum] = useState(0);
    const [payeeBalanceSum, setPayeeBalanceSum] = useState(0);

    const [values, setValues] = useState({});
    const toast = useToast();

    const [errors, setErrors] = useState({
        amount: "",
        date: "",
    });

    useEffect(() => {
        paymentService
            .getOneWithBalance(householdId, paymentId)
            .then((payment) => {
                setValues({
                    amount: payment.amount,
                    date: moment(payment.date).format("YYYY-MM-DD"),
                });
                setPayerBalanceSum(payment.payerBalanceSum);
                setPayeeBalanceSum(payment.payeeBalanceSum);
                setSelectedPayee(payment.payee);
            })
            .catch((error) => {
                if (error.status === 401) {
                    logoutHandler();
                } else {
                    toast({
                        title:
                            error.message || "Неуспешно зареждане на плащането",
                        status: "error",
                        duration: 6000,
                        isClosable: true,
                        position: "bottom",
                    });
                }
            });
    }, [paymentId, householdId]);

    const onChange = (e) => {
        let value = e.target.value;
        setErrors((prevErrors) => ({ ...prevErrors, [e.target.name]: "" }));

        if (e.target.name === "amount") {
            const regex = /^\d*([\,\.]?\d{0,2})?$/;

            if (!regex.test(e.target.value)) {
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
            amount: "",
            date: "",
            payee: "",
        };

        if (
            !values.amount ||
            isNaN(values.amount) ||
            Number(values.amount) <= 0
        ) {
            newErrors.amount = "Сумата трябва да бъде число, по-голямо от 0";
        } else if (Number(values.amount) > payerBalanceSum) {
            newErrors.amount = `Сумата не може да бъде по-голяма от дължимата сума: ${payerBalanceSum} лв.`;
        } else if (Number(values.amount) > payeeBalanceSum) {
            newErrors.amount = `Сумата не може да бъде по-голяма от дължимата сума от домакинството: ${payeeBalanceSum} лв.`;
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

        const updatedPayment = {
            amount: values.amount,
            date: values.date,
        };

        try {
            await paymentService.edit(householdId, paymentId, updatedPayment);
            toast({
                title: "Плащането е редактирано.",
                description: "Успешно редактирахте плащането.",
                status: "success",
                duration: 5000,
                isClosable: true,
            });

            fetchBalances();
            fetchPayments();
            onCloseForm();
        } catch (error) {
            if (error.status === 401) {
                logoutHandler();
            } else {
                toast({
                    title: "Грешка.",
                    description:
                        "Възникна грешка при редактирането на плащането",
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
                <ModalHeader>Редактирайте плащането</ModalHeader>
                <ModalCloseButton />
                <ModalBody pb={6}>
                    <form onSubmit={onSubmit}>
                        <Stack direction={{ base: "column", lg: "row" }} spacing={{ lg: "4" }}>
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
                                    Дължима сума: {payerBalanceSum} лв.
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
                        <Stack direction="column">
                            <Text fontWeight="bold">Получател: </Text>
                            {selectedPayee && (
                                <Card p={4} width="100%">
                                    <Stack direction="row" align="center" spacing="4">
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
                                                {payeeBalanceSum} лв.
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
                        Редактирайте
                    </Button>
                    <Button onClick={onCloseForm}>Отменете</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
    
}
