import { useState } from "react";
import ExpenseListItem from "./expense-list-item/ExpenseListItem";
import {
    Button,
    Checkbox,
    Flex,
    FormControl,
    FormLabel,
    Input,
    Spacer,
    Stack,
    Text,
    useDisclosure,
} from "@chakra-ui/react";
import ExpenseCreate from "./expense-create/ExpenseCreate";

export default function ExpenseList() {
    const [expenses, setExpenses] = useState([
        {
            _id: "1",
            title: "Пазаруване в Лекси",
            amount: 120,
            split: "even",
            paid: [{ userId: "1", sum: 120 }],
            owed: [
                { userId: "1", sum: 60 },
                { userId: "2", sum: 60 },
            ],
            balance: [
                { userId: "1", sum: 60, type: "+" },
                { userId: "2", sum: 60, type: "-" },
            ],
            category: "Храна",
            status: "За одобрение",
            creator: { userId: "1" },
            household: { householdId: "1" },
            expenseDate: "01.05.2024",
        },
        {
            _id: "2",
            title: "Нова печка",
            amount: 200,
            split: "manual",
            paid: [{ userId: "2", sum: 200 }],
            owed: [
                { userId: "1", sum: 150 },
                { userId: "2", sum: 50 },
            ],
            balance: [
                { userId: "1", sum: 150, type: "-" },
                { userId: "2", sum: 150, type: "+" },
            ],
            category: "Уреди",
            status: "Одобрен",
            creator: { userId: "2" },
            household: { householdId: "1" },
            expenseDate: "06.05.2024",
        },
        {
            _id: "3",
            title: "Климатик за общата стая",
            amount: 300,
            split: "percent",
            paid: [{ userId: "1", sum: 300 }],
            owed: [
                { userId: "1", sum: 150 },
                { userId: "2", sum: 150 },
            ],
            balance: [
                { userId: "1", sum: 150, type: "+" },
                { userId: "2", sum: 150, type: "-" },
            ],
            category: "Уреди",
            status: "За одобрение",
            creator: { userId: "1" },
            household: { householdId: "1" },
            expenseDate: "08.05.2024",
        },
    ]);

    const [searchValues, setSearchValues] = useState({
        title: "",
        category: "",
        startDate: "",
        endDate: "",
    });

    const {
        isOpen: isCreateModalOpen,
        onOpen: onOpenCreateModal,
        onClose: onCloseCreateModal,
    } = useDisclosure();

    const onChange = (e) => {
        setSearchValues((state) => ({
            ...state,
            [e.target.name]: e.target.value,
        }));
    };

    const onSubmit = (e) => {
        e.preventDefault();

        console.log(searchValues);
    };

    const clearSearchFormHandler = () => {
        setValues({
            title: "",
            category: "",
            startDate: "",
            endDate: "",
        });
    };

    const userId = "1";

    return (
        <>
            <Flex justify="flex-end" mb="3" mx="1">
                <Button variant="primary" onClick={onOpenCreateModal}>
                    + Създаване
                </Button>
            </Flex>
            <form onSubmit={onSubmit}>
                <Text fontWeight="bold" fontSize="lg">
                    Търсене
                </Text>
                <Stack spacing="2" direction={{ base: "column", lg: "row" }}>
                    <FormControl>
                        <FormLabel>Заглавие на разход</FormLabel>
                        <Input
                            size="md"
                            type="search"
                            name="title"
                            value={searchValues.title}
                            onChange={onChange}
                            placeholder="Въведете заглавие"
                        />
                    </FormControl>

                    <FormControl>
                        <FormLabel>Категория на разход</FormLabel>
                        <Input
                            size="md"
                            type="search"
                            name="category"
                            value={searchValues.category}
                            onChange={onChange}
                            placeholder="Въведете категория"
                        />
                    </FormControl>

                    <FormControl>
                        <FormLabel>Начална дата</FormLabel>
                        <Input
                            size="md"
                            type="date"
                            name="startDate"
                            value={searchValues.startDate}
                            onChange={onChange}
                        />
                    </FormControl>

                    <FormControl>
                        <FormLabel>Крайна дата</FormLabel>
                        <Input
                            size="md"
                            type="date"
                            name="endDate"
                            value={searchValues.endDate}
                            onChange={onChange}
                        />
                    </FormControl>
                </Stack>
                <Stack spacing="4" direction="row" mt="4">
                    <Checkbox colorScheme="themePurple.400" defaultChecked>
                        Одобрен
                    </Checkbox>
                    <Checkbox colorScheme="themePurple.400" defaultChecked>
                        За одобрение
                    </Checkbox>
                    <Checkbox colorScheme="themePurple.400" defaultChecked>
                        Отхвърлен
                    </Checkbox>
                </Stack>
                <Flex justify="flex-end" my="3" mx="1">
                    <Button variant="primary" onClick={onSubmit}>
                        Търсене
                    </Button>
                </Flex>
            </form>

            <Stack>
                {expenses.map((expense) => (
                    <ExpenseListItem key={expense._id} {...expense} />
                ))}
            </Stack>
            {isCreateModalOpen && (
                <ExpenseCreate
                    isOpen={isCreateModalOpen}
                    onClose={onCloseCreateModal}
                />
            )}
        </>
    );
}
