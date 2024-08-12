import {
    Button,
    Checkbox,
    Flex,
    FormControl,
    FormLabel,
    Heading,
    Input,
    Stack,
    Text,
    useToast,
} from "@chakra-ui/react";
import { useCallback, useEffect, useRef, useState } from "react";
import * as householdService from "../../services/householdService";
import * as paymentService from "../../services/paymentService";
import { useParams } from "react-router-dom";
import BalanceListItem from "./balance-list-item/BalanceListItem";
import { useContext } from "react";
import AuthContext from "../../contexts/authContext";
import PaymentListItem from "./payment-list-item/PaymentListItem";

const initialSearchValues = {
    startDate: "",
    endDate: "",
    approved: true,
    forApproval: true,
    rejected: true,
};

export default function BalanceList({ archived }) {
    const [balances, setBalances] = useState([]);
    const [payments, setPayments] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [index, setIndex] = useState(2); // Page index starts at 2
    const [hasMore, setHasMore] = useState(false); // Track if there are more items
    const [searchValues, setSearchValues] = useState(initialSearchValues);
    const { logoutHandler } = useContext(AuthContext);
    const loaderRef = useRef(null);

    const toast = useToast();

    const { householdId } = useParams();

    useEffect(() => {
        fetchBalances();
        fetchPayments();
    }, [householdId]);

    const fetchBalances = () => {
        householdService
            .getAllBalances(householdId)
            .then((result) => {
                const sortedBalances = result.sort((a, b) => {
                    // sort by type
                    if (a.type === "+" && b.type === "-") {
                        return -1;
                    }
                    if (a.type === "-" && b.type === "+") {
                        return 1;
                    }
                    // sort by sum within the same type
                    if (a.sum > b.sum) {
                        return -1;
                    }
                    if (a.sum < b.sum) {
                        return 1;
                    }
                    return 0;
                });
                setBalances(sortedBalances);
            })
            .catch((error) => {
                if (error.status === 401) {
                    logoutHandler();
                } else {
                    toast({
                        title:
                            error.message ||
                            "Неуспешно зареждане на баланса на домакинството",
                        status: "error",
                        duration: 6000,
                        isClosable: true,
                        position: "bottom",
                    });
                }
            });
    };

    const fetchPayments = useCallback(
        async (reset = false) => {
            setIsLoading(true);

            try {
                let updatedSearchValues = searchValues;
                if (reset) {
                    updatedSearchValues = initialSearchValues;
                    setSearchValues(initialSearchValues);
                }

                const { data, hasMore: newHasMore } =
                    await paymentService.getAll(
                        householdId,
                        1,
                        updatedSearchValues
                    );

                setPayments(data);
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
                            "Неуспешно зареждане на плащанията.",
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

    const fetchMorePayments = useCallback(async () => {
        if (isLoading || !hasMore) return;

        setIsLoading(true);

        try {
            const { data, hasMore: newHasMore } = await paymentService.getAll(
                householdId,
                index,
                searchValues
            );
            setPayments((state) => [...state, ...data]);
            setHasMore(newHasMore);
        } catch (error) {
            if (error.status === 401) {
                logoutHandler();
            } else {
                toast({
                    title: "Грешка.",
                    description:
                        error.message || "Неуспешно зареждане на плащанията.",
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
                fetchMorePayments();
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
    }, [fetchMorePayments]);

    const onChange = (e) => {
        setSearchValues((state) => ({
            ...state,
            [e.target.name]: e.target.value,
        }));
    };

    const onSubmit = (e) => {
        e.preventDefault();
        fetchPayments();
    };
    
    return (
        <Stack>
            <Stack>
                <Heading as="h4" size="md" my={2}>
                    Текущ баланс
                </Heading>
                <Flex
                    wrap="wrap"
                    direction={{ base: "column", lg: "row" }}
                    gap="4"
                    align={{ base: "center", lg: "initial" }}
                >
                    {balances.map((balance) => (
                        <BalanceListItem
                            key={balance._id}
                            balance={balance}
                            fetchPayments={fetchPayments}
                        />
                    ))}
                </Flex>
            </Stack>
            <Stack mt="4">
                <Heading as="h4" size="md" my={2}>
                    История на плащанията
                </Heading>
                <form onSubmit={onSubmit}>
                    <Text fontWeight="bold" fontSize="lg">
                        Търсене
                    </Text>
                    <Stack
                        spacing="2"
                        direction={{ base: "column", lg: "row" }}
                    >
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
                    {Array.isArray(payments) && payments.length > 0 ? (
                        payments.map((payment) => (
                            <PaymentListItem
                                key={payment._id}
                                {...payment}
                                fetchPayments={fetchPayments}
                                fetchBalances={fetchBalances}
                                archived={archived}
                            />
                        ))
                    ) : (
                        <Flex justifyContent="center" alignItems="center">
                            <Text>Няма налични плащания</Text>
                        </Flex>
                    )}
                </Stack>
            </Stack>
        </Stack>
    );
}
