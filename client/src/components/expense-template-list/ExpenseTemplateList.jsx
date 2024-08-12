import { useContext, useEffect, useState, useRef, useCallback } from "react";
import {
    Button,
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
import * as categoryService from "../../services/categoryService";
import * as expenseTemplateService from "../../services/expenseTemplateService";
import { useParams } from "react-router-dom";
import AuthContext from "../../contexts/authContext";
import ExpenseTemplateCreate from "./expense-template-create/ExpenseTemplateCreate";
import ExpenseTemplateListItem from "./expense-template-list-item/ExpenseTemplateListItem";

const initialSearchValues = {
    templateName: "",
    category: "",
};

export default function ExpenseTemplateList({ archived }) {
    const [expenseTemplates, setExpenseTemplates] = useState([]);
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
        fetchExpenseTemplates();
        fetchCategories();
    }, []);

    const fetchExpenseTemplates = useCallback(
        async (reset = false) => {
            setIsLoading(true);

            try {
                let updatedSearchValues = searchValues;
                if (reset) {
                    updatedSearchValues = initialSearchValues;
                    setSearchValues(initialSearchValues);
                }

                const { data, hasMore: newHasMore } =
                    await expenseTemplateService.getAll(
                        householdId,
                        1,
                        updatedSearchValues
                    );

                setExpenseTemplates(data);
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
                            "Неуспешно зареждане на шаблоните.",
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

    const fetchMoreExpenseTemplates = useCallback(async () => {
        if (isLoading || !hasMore) return;

        setIsLoading(true);

        try {
            const { data, hasMore: newHasMore } =
                await expenseTemplateService.getAll(
                    householdId,
                    index,
                    searchValues
                );
            setExpenseTemplates((state) => [...state, ...data]);
            setHasMore(newHasMore);
        } catch (error) {
            if (error.status === 401) {
                logoutHandler();
            } else {
                toast({
                    title: "Грешка.",
                    description:
                        error.message || "Неуспешно зареждане на шаблоните.",
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
                fetchMoreExpenseTemplates();
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
    }, [fetchMoreExpenseTemplates]);

    const onChange = (e) => {
        setSearchValues((state) => ({
            ...state,
            [e.target.name]: e.target.value,
        }));
    };

    const onSubmit = (e) => {
        e.preventDefault();
        fetchExpenseTemplates();
    };

    return (
        <>
            <Flex justify="flex-end" mb="3" mx="1">
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
                    <FormControl id="templateName">
                        <FormLabel>Име</FormLabel>
                        <Input
                            size="md"
                            type="search"
                            name="templateName"
                            value={searchValues.templateName || ""}
                            onChange={onChange}
                            placeholder="Въведете име на шаблон"
                        />
                    </FormControl>

                    <FormControl id="category">
                        <FormLabel>Категория</FormLabel>
                        <Select
                            name="category"
                            value={searchValues.category}
                            onChange={onChange}
                            placeholder="Изберете категория"
                        >
                            {householdCategories.map((category) => (
                                <option key={category._id} value={category._id}>
                                    {category.title}
                                </option>
                            ))}
                        </Select>
                    </FormControl>
                </Stack>
                <Flex justify="flex-end" my="3" mx="1">
                    <Button variant="primary" type="submit">
                        Търсене
                    </Button>
                </Flex>
            </form>

            <Stack>
                {Array.isArray(expenseTemplates) &&
                expenseTemplates.length > 0 ? (
                    expenseTemplates.map((expenseTemplate) => (
                        <ExpenseTemplateListItem
                            key={expenseTemplate._id}
                            {...expenseTemplate}
                            fetchExpenseTemplates={fetchExpenseTemplates}
                            archived={archived}
                        />
                    ))
                ) : (
                    <Flex justifyContent="center" alignItems="center">
                        <Text>Няма налични шаблони</Text>
                    </Flex>
                )}
            </Stack>

            <Stack ref={loaderRef} p="2">
                {isLoading && <Spinner />}
            </Stack>
            {isCreateModalOpen && (
                <ExpenseTemplateCreate
                    isOpen={isCreateModalOpen}
                    onClose={onCloseCreateModal}
                    fetchExpenseTemplates={fetchExpenseTemplates}
                />
            )}
        </>
    );
}
