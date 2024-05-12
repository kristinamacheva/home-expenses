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
    Select,
    Stack,
    Text,
} from "@chakra-ui/react";
import categoriesOptions from "../../../data/categoriesOptions ";
import moment from 'moment';

export default function ExpenseCreate({ isOpen, onClose }) {
    const initialValues = {
        title: "",
        amount: "0",
        category: "",
        date: moment().format('YYYY-MM-DD'),
        payersOption: "",
        splittingOption: "",
    };

    const [values, setValues] = useState(initialValues);

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
                        <Stack mt="3" spacing="4">
                            <FormControl mb={4}>
                                <FormLabel>Платец*</FormLabel>
                                <Select
                                    name="payersOption"
                                    value={values.payersOption}
                                    onChange={onChange}
                                    placeholder="Изберете платец"
                                >
                                    <option value="currentUser">
                                        Текущ потребител
                                    </option>
                                    <option value="changedUser">
                                        Други потребители
                                    </option>
                                </Select>
                            </FormControl>
                            {values.payersOption === "currentUser" && (
                                <Text>текущ потребител</Text>
                            )}

                            {values.payersOption === "changedUser" && (
                                <Text>други потребители</Text>
                            )}
                        </Stack>
                        <Stack mt="3" spacing="4">
                            <FormControl mb={4}>
                                <FormLabel>Метод на разпределяне*</FormLabel>
                                <Select
                                    name="splittingOption"
                                    value={values.splittingOption}
                                    onChange={onChange}
                                    placeholder="Изберете метод"
                                >
                                    <option value="equally">Поравно</option>
                                    <option value="percent">Процент</option>
                                    <option value="manual">Ръчно</option>
                                </Select>
                            </FormControl>
                            {values.splittingOption === "equally" && (
                                <Text>Поравно</Text>
                            )}

                            {values.splittingOption === "percent" && (
                                <Text>Процент</Text>
                            )}

                            {values.splittingOption === "manual" && (
                                <Text>Ръчно</Text>
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
