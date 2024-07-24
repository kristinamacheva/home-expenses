import { useContext, useEffect, useState, useRef, useCallback } from "react";
import PaidExpenseListItem from "./paid-expense-list-item/PaidExpenseListItem";
import {
    Button,
    Checkbox,
    Flex,
    FormControl,
    FormLabel,
    Input,
    Select,
    Spinner,
    Stack,
    Text,
    useDisclosure,
    useToast,
} from "@chakra-ui/react";
import PaidExpenseCreate from "./paid-expense-create/PaidExpenseCreate";
import * as paidExpenseService from "../../services/paidExpenseService";
import * as categoryService from "../../services/categoryService";
import { useParams } from "react-router-dom";
import AuthContext from "../../contexts/authContext";

const initialSearchValues = {
    title: "",
    category: "",
    startDate: "",
    endDate: "",
    approved: true,
    forApproval: true,
    rejected: true,
};

export default function PaidExpenseList({ isAdmin }) {
    const [paidExpenses, setPaidExpenses] = useState([]);
    const [householdCategories, setHouseholdCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [index, setIndex] = useState(2); // Page index starts at 2
    const [hasMore, setHasMore] = useState(false); // Track if there are more items
    const [searchValues, setSearchValues] = useState(initialSearchValues);
    const { logoutHandler } = useContext(AuthContext);
    const toast = useToast();

    const loaderRef = useRef(null);
    const { householdId } = useParams();
    const {
        isOpen: isCreateModalOpen,
        onOpen: onOpenCreateModal,
        onClose: onCloseCreateModal,
    } = useDisclosure();

    useEffect(() => {
        fetchPaidExpenses();
        fetchCategories();
    }, []);

    // TODO: Display search errors
    const fetchPaidExpenses = useCallback(
        async (reset = false) => {
            setIsLoading(true);

            try {
                let updatedSearchValues = searchValues;
                if (reset) {
                    updatedSearchValues = initialSearchValues;
                    setSearchValues(initialSearchValues);
                }

                const { data, hasMore: newHasMore } =
                    await paidExpenseService.getAll(
                        householdId,
                        1,
                        updatedSearchValues
                    );

                setPaidExpenses(data);
                setHasMore(newHasMore);
                setIndex(2);
            } catch (error) {
                if (error.status === 401) {
                    logoutHandler();
                } else {
                    toast({
                        title: "Грешка.",
                        description:
                            error.message ||
                            "Неуспешно зареждане на платените разходи.",
                        status: "error",
                        duration: 5000,
                        isClosable: true,
                    });
                }
            }

            setIsLoading(false);
        },
        [householdId, searchValues]
    );

    const fetchCategories = () => {
        categoryService
            .getAll(householdId)
            .then((result) => setHouseholdCategories(result))
            .catch((error) => {
                if (error.status === 401) {
                    logoutHandler();
                } else {
                    toast({
                        title:
                            error.message ||
                            "Неуспешно зареждане на категориите на домакинството",
                        status: "error",
                        duration: 6000,
                        isClosable: true,
                        position: "bottom",
                    });
                }
            });
    };

    const fetchMorePaidExpenses = useCallback(async () => {
        if (isLoading || !hasMore) return;

        setIsLoading(true);

        try {
            const { data, hasMore: newHasMore } =
                await paidExpenseService.getAll(
                    householdId,
                    index,
                    searchValues
                );
            setPaidExpenses((state) => [...state, ...data]);
            setHasMore(newHasMore);
        } catch (error) {
            if (error.status === 401) {
                logoutHandler();
            } else {
                toast({
                    title: "Грешка.",
                    description:
                        error.message ||
                        "Неуспешно зареждане на платените разходи.",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            }
        }

        setIndex((prevIndex) => prevIndex + 1);

        setIsLoading(false);
    }, [isLoading, hasMore, index, searchValues]);

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
    }, [fetchMorePaidExpenses]);

    const removePaidExpenseFromState = (paidExpenseId) => {
        setPaidExpenses((prevPaidExpenses) =>
            prevPaidExpenses.filter(
                (paidExpense) => paidExpense._id !== paidExpenseId
            )
        );
    };

    const onChange = (e) => {
        setSearchValues((state) => ({
            ...state,
            [e.target.name]: e.target.value,
        }));
    };

    const onSubmit = (e) => {
        e.preventDefault();
        fetchPaidExpenses();
    };

    const clearSearchFormHandler = () => {
        setSearchValues(initialSearchValues);
        fetchPaidExpenses(true); // Reset and fetch all results
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
                    <FormControl id="title">
                        <FormLabel>Заглавие на разход</FormLabel>
                        <Input
                            size="md"
                            type="search"
                            name="title"
                            value={searchValues.title || ""}
                            onChange={onChange}
                            placeholder="Въведете заглавие"
                        />
                    </FormControl>

                    <FormControl id="category">
                        <FormLabel>Категория на разход</FormLabel>
                        <Select
                            name="category"
                            value={searchValues.category}
                            onChange={onChange}
                            placeholder="Изберете категория"
                        >
                            {householdCategories.map((category) => (
                                <option value={category._id}>
                                    {category.title}
                                </option>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl id="startDate">
                        <FormLabel>Начална дата</FormLabel>
                        <Input
                            size="md"
                            type="date"
                            name="startDate"
                            value={searchValues.startDate || ""}
                            onChange={onChange}
                        />
                    </FormControl>

                    <FormControl id="endDate">
                        <FormLabel>Крайна дата</FormLabel>
                        <Input
                            size="md"
                            type="date"
                            name="endDate"
                            value={searchValues.endDate || ""}
                            onChange={onChange}
                        />
                    </FormControl>
                </Stack>
                <Stack spacing="4" direction="row" mt="4">
                    <Checkbox
                        colorScheme="themePurple.400"
                        name="approved"
                        isChecked={searchValues.approved}
                        onChange={() =>
                            setSearchValues((state) => ({
                                ...state,
                                approved: !state.approved,
                            }))
                        }
                    >
                        Одобрен
                    </Checkbox>
                    <Checkbox
                        colorScheme="themePurple.400"
                        name="forApproval"
                        isChecked={searchValues.forApproval}
                        onChange={() =>
                            setSearchValues((state) => ({
                                ...state,
                                forApproval: !state.forApproval,
                            }))
                        }
                    >
                        За одобрение
                    </Checkbox>
                    <Checkbox
                        colorScheme="themePurple.400"
                        name="rejected"
                        isChecked={searchValues.rejected}
                        onChange={() =>
                            setSearchValues((state) => ({
                                ...state,
                                rejected: !state.rejected,
                            }))
                        }
                    >
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
                        onRemove={removePaidExpenseFromState}
                        isAdmin={isAdmin}
                    />
                ))}
            </Stack>

            <Stack ref={loaderRef} p="2">
                {isLoading && <Spinner />}
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
