import { useState } from "react";
import {
    Box,
    Button,
    ButtonGroup,
    Divider,
    FormControl,
    FormLabel,
    HStack,
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
    NumberDecrementStepper,
    NumberIncrementStepper,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    Select,
    Stack,
    Text,
} from "@chakra-ui/react";
import categoriesOptions from "../../../data/categoriesOptions ";

export default function ExpenseCreate({ isOpen, onClose }) {
    const today = new Date();
    const dateOnly = today.toISOString().split("T")[0];

    const initialValues = {
        title: "",
        amount: "0",
        category: "",
        date: `${dateOnly}`,
    };

    const [values, setValues] = useState(initialValues);
    const [payersButton, setPayersButton] = useState("currentUser");

    const handlePayerButtonClick = (payerType) => {
        setPayersButton(payerType);
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
        setValues(initialValues);
    };

    const onCloseForm = () => {
        clearFormHandler();
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
                            <FormControl mb={4}>
                                <FormLabel>Заглавие*</FormLabel>
                                <Input
                                    type="number"
                                    name="title"
                                    value={values.title}
                                    onChange={onChange}
                                    placeholder="Въведете заглавие"
                                />
                            </FormControl>

                            <FormControl mb={4}>
                                <FormLabel>Обща сума*</FormLabel>
                                <InputGroup>
                                    <Input
                                        type="number"
                                        name="amount"
                                        value={values.amount}
                                        onChange={onChange}
                                        placeholder="Въведете обща сума"
                                    />
                                    <InputRightAddon>лв.</InputRightAddon>
                                </InputGroup>
                            </FormControl>
                        </Stack>
                        <Stack
                            direction={{ base: "column", lg: "row" }}
                            spacing={{ lg: "4" }}
                        >
                            <FormControl mb={4}>
                                <FormLabel>Дата*</FormLabel>
                                <Input
                                    type="date"
                                    name="date"
                                    value={values.date}
                                    onChange={onChange}
                                    placeholder="Изберете дата"
                                />
                            </FormControl>

                            <FormControl mb={4}>
                                <FormLabel>Категория</FormLabel>
                                <Select
                                    name="category"
                                    value={values.category}
                                    onChange={onChange}
                                    placeholder="Изберете категория"
                                >
                                    {categoriesOptions.map(
                                        (categoryGroup, index) => (
                                            <optgroup
                                                label={categoryGroup.category}
                                                key={index}
                                            >
                                                {categoryGroup.items.map(
                                                    (item, i) => (
                                                        <option
                                                            value={item}
                                                            key={`${index}-${i}`}
                                                        >
                                                            {item}
                                                        </option>
                                                    )
                                                )}
                                            </optgroup>
                                        )
                                    )}
                                </Select>
                            </FormControl>
                        </Stack>
                        <Divider />
                        <Stack direction={{ base: "column", md: "row" }} spacing="4">
                            <Text>Платец</Text>
                            <ButtonGroup isAttached variant="outline" size="sm">
                                <Button
                                    onClick={() => handlePayerButtonClick("currentUser")}
                                    colorScheme={
                                        payersButton === "currentUser" ? "themePurple" : "gray"
                                    }
                                >
                                    Текущ потребител
                                </Button>
                                <Button
                                    onClick={() => handlePayerButtonClick("changedUser")}
                                    colorScheme={
                                        payersButton === "changedUser" ? "themePurple" : "gray"
                                    }
                                >
                                    Изберете потребители
                                </Button>
                            </ButtonGroup>
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
