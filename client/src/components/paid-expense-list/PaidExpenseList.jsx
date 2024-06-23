import { useContext, useEffect, useState } from "react";
import PaidExpenseListItem from "./paid-expense-list-item/PaidExpenseListItem";
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
import PaidExpenseCreate from "./paid-expense-create/PaidExpenseCreate";
import AuthContext from "../../contexts/authContext";
import * as paidExpenseService from "../../services/paidExpenseService";
import { useParams } from "react-router-dom";

export default function PaidExpenseList() {
    const [paidExpenses, setPaidExpenses] = useState([]);
    const { householdId } = useParams();
    
    const fetchPaidExpenses = () => {
        paidExpenseService
            .getAll(householdId)
            .then((result) => setPaidExpenses(result))
            .catch((err) => {
                console.log(err);
                toast({
                    title: "Грешка.",
                    description: "Неуспешно зареждане на платените разходи.",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            });
    };

    useEffect(() => {
        fetchPaidExpenses();
    }, []);

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

    const { userId } = useContext(AuthContext);

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
                {paidExpenses.map((paidExpense) => (
                    <PaidExpenseListItem key={paidExpense._id} {...paidExpense} fetchPaidExpenses={fetchPaidExpenses} />
                ))}
            </Stack>
            {isCreateModalOpen && (
                <PaidExpenseCreate
                    isOpen={isCreateModalOpen}
                    onClose={onCloseCreateModal}
                    fetchPaidExpenses={fetchPaidExpenses}
                />
            )}
        </>
    );
}
