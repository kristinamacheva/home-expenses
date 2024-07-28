import { Card, Heading, Stack, useToast } from "@chakra-ui/react";
import { useCallback, useEffect, useRef, useState } from "react";
import * as householdService from "../../services/householdService";
import * as allowanceService from "../../services/allowanceService";
import { useParams } from "react-router-dom";
import { useContext } from "react";
import AuthContext from "../../contexts/authContext";
import AllowanceListItem from "./allowance-list-item/AllowanceListItem";

export default function AllowanceList() {
    const [childAllowance, setChildAllowance] = useState([]);
    const [allowances, setAllowances] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [index, setIndex] = useState(2); // Page index starts at 2
    const [hasMore, setHasMore] = useState(false); // Track if there are more items
    const { logoutHandler } = useContext(AuthContext);
    const loaderRef = useRef(null);

    const toast = useToast();

    const { householdId } = useParams();

    useEffect(() => {
        getOneChildAllowance();
        fetchAllowances();
    }, [householdId]);

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

    const fetchAllowances = useCallback(async () => {
        setIsLoading(true);

        try {
            const { data, hasMore: newHasMore } = await allowanceService.getAll(
                householdId,
                1
            );

            setAllowances(data);
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
                        "Неуспешно зареждане на преведените джобни.",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            }
        }

        setIsLoading(false);
    }, [householdId]);

    const fetchMoreAllowances = useCallback(async () => {
        if (isLoading || !hasMore) return;

        setIsLoading(true);

        try {
            const { data, hasMore: newHasMore } = await allowanceService.getAll(
                householdId,
                index
            );
            setAllowances((state) => [...state, ...data]);
            setHasMore(newHasMore);
        } catch (error) {
            if (error.status === 401) {
                logoutHandler();
            } else {
                toast({
                    title: "Грешка.",
                    description:
                        error.message ||
                        "Неуспешно зареждане на преведените джобни.",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            }
        }

        setIndex((prevIndex) => prevIndex + 1);

        setIsLoading(false);
    }, [isLoading, hasMore, index]);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            const target = entries[0];
            if (target.isIntersecting) {
                fetchMoreAllowances();
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
    }, [fetchMoreAllowances]);

    return (
        <Stack>
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
            <Stack mt="4">
                <Heading as="h4" size="md" my={2}>
                    История на джобните
                </Heading>
                <Stack>
                    {Array.isArray(allowances) && allowances.length > 0 ? (
                        allowances.map((allowance) => (
                            <AllowanceListItem
                                key={allowance._id}
                                {...allowance}
                            />
                        ))
                    ) : (
                        <Heading as="h5" size="sm" my={2}>
                            Няма налични джобни
                        </Heading>
                    )}
                </Stack>
            </Stack>
        </Stack>
    );
}
