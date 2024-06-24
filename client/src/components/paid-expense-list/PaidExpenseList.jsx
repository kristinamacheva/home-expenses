import { useContext, useEffect, useState, useRef, useCallback } from "react";
import PaidExpenseListItem from "./paid-expense-list-item/PaidExpenseListItem";
import {
    Button,
    Checkbox,
    Flex,
    FormControl,
    FormLabel,
    Input,
    Spinner,
    Stack,
    Text,
    useDisclosure,
    useToast,
} from "@chakra-ui/react";
import PaidExpenseCreate from "./paid-expense-create/PaidExpenseCreate";
import * as paidExpenseService from "../../services/paidExpenseService";
import { useParams } from "react-router-dom";

export default function PaidExpenseList() {
    const [paidExpenses, setPaidExpenses] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [index, setIndex] = useState(2); // Page index starts at 2
    const [hasMore, setHasMore] = useState(false); // Track if there are more items
    const [searchValues, setSearchValues] = useState({
        title: "",
        category: "",
        startDate: "",
        endDate: "",
    });
    const loaderRef = useRef(null);
    const { householdId } = useParams();
    const {
        isOpen: isCreateModalOpen,
        onOpen: onOpenCreateModal,
        onClose: onCloseCreateModal,
    } = useDisclosure();
    const toast = useToast();

    useEffect(() => {
        setIsLoading(true);

        paidExpenseService
            .getAll(householdId, 1)
            .then(({ data, hasMore: newHasMore }) => {
                setPaidExpenses(data);
                setHasMore(newHasMore);
            })
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

        setIsLoading(false);
    }, []);

    const fetchMorePaidExpenses = useCallback(async () => {
        if (isLoading || !hasMore) return;

        setIsLoading(true);

        try {
            const { data, hasMore: newHasMore } =
                await paidExpenseService.getAll(householdId, index);
            setPaidExpenses((state) => [...state, ...data]);
            setHasMore(newHasMore);
        } catch (err) {
            console.log(err);
            toast({
                title: "Грешка.",
                description: "Неуспешно зареждане на платените разходи.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }

        setIndex((prevIndex) => prevIndex + 1);
        
        setIsLoading(false);
    }, [isLoading, hasMore, index]);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            const target = entries[0];
            if (target.isIntersecting) {
                fetchMorePaidExpenses();
            }
        });

        if (loaderRef.current) {
            observer.observe(loaderRef.current);
        }

        return () => {
            if (loaderRef.current) {
                observer.unobserve(loaderRef.current);
            }
        };
    }, [fetchMorePaidExpenses]); // Only track dependencies necessary for effect

    const fetchPaidExpenses = () => {
        setHasMore(false);
        setIndex(2);

        setIsLoading(true);

        paidExpenseService
            .getAll(householdId, 1)
            .then(({ data, hasMore: newHasMore }) => {
                setPaidExpenses(data);
                setHasMore(newHasMore);
            })
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

        setIsLoading(false);
    };

    const onChange = (e) => {
        setSearchValues((state) => ({
            ...state,
            [e.target.name]: e.target.value,
        }));
    };

    const onSubmit = (e) => {
        e.preventDefault();
        console.log(searchValues);
        // Handle search logic
    };

    const clearSearchFormHandler = () => {
        setSearchValues({
            title: "",
            category: "",
            startDate: "",
            endDate: "",
        });
    };

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
                    <Button variant="primary" type="submit">
                        Търсене
                    </Button>
                </Flex>
            </form>

            <Stack>
                {paidExpenses.map((paidExpense) => (
                    <PaidExpenseListItem
                        key={paidExpense._id}
                        {...paidExpense}
                        fetchPaidExpenses={fetchPaidExpenses}
                    />
                ))}
            </Stack>

            <Stack ref={loaderRef} p="2">{isLoading && <Spinner />}</Stack>
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
