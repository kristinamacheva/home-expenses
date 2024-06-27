import { Flex, useToast } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import * as householdService from "../../services/householdService";
import { useParams } from "react-router-dom";
import BalanceListItem from "./balance-list-item/BalanceListItem";
import { useContext } from "react";
import AuthContext from "../../contexts/authContext";

export default function BalanceList() {
    const [balances, setBalances] = useState([]);
    const { logoutHandler } = useContext(AuthContext);
    const toast = useToast();

    const { householdId } = useParams();

    useEffect(() => {
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
                        title: error.message || 'Неуспешно зареждане на баланса на домакиннството',
                        status: "error",
                        duration: 6000,
                        isClosable: true,
                        position: "bottom",
                    });
                }
            });
    }, [householdId]);

    return (
        <Flex
            mt="4"
            wrap="wrap"
            direction={{ base: "column", lg: "row" }}
            gap="4"
            align={{ base: "center", lg: "initial" }}
        >
            {balances.map((balance) => (
                <BalanceListItem key={balance._id} balance={balance} />
            ))}
        </Flex>
    );
}
