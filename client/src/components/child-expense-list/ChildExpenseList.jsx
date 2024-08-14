import { useContext, useEffect, useState, useRef, useCallback } from "react";
import {
    Button,
    Card,
    Flex,
    FormControl,
    FormLabel,
    Heading,
    Input,
    Spinner,
    Stack,
    Text,
    useDisclosure,
    useToast,
} from "@chakra-ui/react";
import * as childExpenseService from "../../services/childExpenseService";
import * as householdService from "../../services/householdService";
import { useParams } from "react-router-dom";
import AuthContext from "../../contexts/authContext";
import ChildExpenseListItem from "./child-expense-list-item/ChildExpenseListItem";
import ChildExpenseCreate from "./child-expense-create/ChildExpenseCreate";

const initialSearchValues = {
    title: "",
    startDate: "",
    endDate: "",
};

export default function ChildExpenseList({ archived }) {
    const [childExpenses, setChildExpenses] = useState([]);
    const [childAllowance, setChildAllowance] = useState([]);
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
        getOneChildAllowance();
        fetchChildExpenses();
    }, []);

    const getOneChildAllowance = () => {
        householdService
            .getOneChildAllowance(householdId)
            .then((result) => {
                setChildAllowance(result);
            })
            .catch((error) => {
                if (error.status === 401) {
                    logoutHandler();
                } else {
                    toast({
                        title:
                            error.message || "Неуспешно зареждане на джобните",
                        status: "error",
                        duration: 6000,
                        isClosable: true,
                        position: "bottom",
                    });
                }
            });
    };

    const fetchChildExpenses = useCallback(
        async (reset = false) => {
            setIsLoading(true);

            try {
                let updatedSearchValues = searchValues;
                if (reset) {
                    updatedSearchValues = initialSearchValues;
                    setSearchValues(initialSearchValues);
                }

                const { data, hasMore: newHasMore } =
                    await childExpenseService.getAll(
                        householdId,
                        1,
                        updatedSearchValues
                    );

                setChildExpenses(data);
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
                            "Неуспешно зареждане на разходите.",
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

    const fetchMoreChildExpenses = useCallback(async () => {
        if (isLoading || !hasMore) return;

        setIsLoading(true);

        try {
            const { data, hasMore: newHasMore } =
                await childExpenseService.getAll(
                    householdId,
                    index,
                    searchValues
                );
            setChildExpenses((state) => [...state, ...data]);
            setHasMore(newHasMore);
        } catch (error) {
            if (error.status === 401) {
                logoutHandler();
            } else {
                toast({
                    title: "Грешка.",
                    description:
                        error.message || "Неуспешно зареждане на разходите.",
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
                fetchMoreChildExpenses();
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
    }, [fetchMoreChildExpenses]);

    const onChange = (e) => {
        setSearchValues((state) => ({
            ...state,
            [e.target.name]: e.target.value,
        }));
    };

    const onSubmit = (e) => {
        e.preventDefault();
        fetchChildExpenses();
    };

    return (
        <>
            <Card
                px="5"
                py="5"
                boxShadow="md"
                background="white"
                spacing="4"
                direction="column"
                justifyContent="center"
                alignItems="center"
            >
                <Heading as="h4" size="md">
                    Налични джобни: {childAllowance} лв.
                </Heading>
            </Card>
            <Flex justify="flex-end" mb="3" mx="1" mt="4">
                <Button
                    variant="primary"
                    onClick={onOpenCreateModal}
                    isDisabled={archived}
                >
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
                <Flex justify="flex-end" my="3" mx="1">
                    <Button variant="primary" type="submit">
                        Търсене
                    </Button>
                </Flex>
            </form>

            <Stack>
                {Array.isArray(childExpenses) && childExpenses.length > 0 ? (
                    childExpenses.map((childExpense) => (
                        <ChildExpenseListItem
                            key={childExpense._id}
                            {...childExpense}
                        />
                    ))
                ) : (
                    <Flex justifyContent="center" alignItems="center">
                        <Text>Няма налични разходи</Text>
                    </Flex>
                )}
            </Stack>

            <Stack ref={loaderRef} p="2">
                {isLoading && <Spinner />}
            </Stack>
            {isCreateModalOpen && (
                <ChildExpenseCreate
                    isOpen={isCreateModalOpen}
                    onClose={onCloseCreateModal}
                    fetchChildExpenses={fetchChildExpenses}
                    fetchChildAllowance={getOneChildAllowance}
                />
            )}
        </>
    );
}
