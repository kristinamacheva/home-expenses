import {
    Card,
    Flex,
    Heading,
    HStack,
    Stack,
    Text,
    useToast,
} from "@chakra-ui/react";
import { useEffect, useState, useContext } from "react";
import * as authService from "../../services/authService";
import BalanceListItem from "./balance-list-item/BalanceListItem";
import AuthContext from "../../contexts/authContext";
import AllowanceListItem from "./allowance-list-item/AllowanceListItem";

export default function Home() {
    const [householdBalances, setHouseholdBalances] = useState([]);
    const [householdAllowances, setHouseholdAllowances] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const { logoutHandler } = useContext(AuthContext);

    const toast = useToast();

    useEffect(() => {
        fetchHouseholdBalances();
        fetchHouseholdAllowances();
    }, []);

    const fetchHouseholdBalances = () => {
        setIsLoading(true);
        authService
            .getHouseholdsWithExistingBalances()
            .then((result) => {
                setHouseholdBalances(result);
                setIsLoading(false);
            })
            .catch((error) => {
                setIsLoading(false);
                if (error.status === 401) {
                    logoutHandler();
                } else {
                    toast({
                        title:
                            error.message ||
                            "Неуспешно зареждане на баланса на домакинствата",
                        status: "error",
                        duration: 6000,
                        isClosable: true,
                        position: "bottom",
                    });
                }
            });
    };

    const fetchHouseholdAllowances = () => {
        setIsLoading(true);
        authService
            .getHouseholdsWithExistingAllowances()
            .then((result) => {
                setHouseholdAllowances(result);
                setIsLoading(false);
            })
            .catch((error) => {
                setIsLoading(false);
                if (error.status === 401) {
                    logoutHandler();
                } else {
                    toast({
                        title:
                            error.message ||
                            "Неуспешно зареждане на джобните на домакинствата",
                        status: "error",
                        duration: 6000,
                        isClosable: true,
                        position: "bottom",
                    });
                }
            });
    };

    return (
        <Stack>
            <Stack>
                <Card background="white" p="2" boxShadow="xs">
                    <HStack mx={4} my={2} alignItems="center" flexWrap="wrap">
                        <Heading as="h1" size="lg" color="themePurple.800">
                            Баланси
                        </Heading>
                    </HStack>
                </Card>
                <Stack mt="4" px="1">
                    {isLoading ? (
                        <Text ml="1">Зареждане...</Text>
                    ) : householdBalances.length > 0 ? (
                        <Flex
                            wrap="wrap"
                            direction={{ base: "column", lg: "row" }}
                            gap="4"
                            align={{ base: "center", lg: "initial" }}
                        >
                            {householdBalances.map((household) => (
                                <BalanceListItem
                                    key={household._id}
                                    household={household}
                                />
                            ))}
                        </Flex>
                    ) : (
                        <Flex justifyContent="center" alignItems="center">
                            <Text>Няма налични баланси</Text>
                        </Flex>
                    )}
                </Stack>
            </Stack>
            <Stack mt={4}>
                <Card background="white" p="2" boxShadow="xs">
                    <HStack mx={4} my={2} alignItems="center" flexWrap="wrap">
                        <Heading as="h1" size="lg" color="themePurple.800">
                            Джобни
                        </Heading>
                    </HStack>
                </Card>
                <Stack mt="4" px="1">
                    {isLoading ? (
                        <Text ml="1">Зареждане...</Text>
                    ) : householdAllowances.length > 0 ? (
                        <Flex
                            wrap="wrap"
                            direction={{ base: "column", lg: "row" }}
                            gap="4"
                            align={{ base: "center", lg: "initial" }}
                        >
                            {householdAllowances.map((household) => (
                                <AllowanceListItem
                                    key={household._id}
                                    household={household}
                                />
                            ))}
                        </Flex>
                    ) : (
                        <Flex justifyContent="center" alignItems="center">
                            <Text>Няма налични джобни</Text>
                        </Flex>
                    )}
                </Stack>
            </Stack>
        </Stack>
    );
}
