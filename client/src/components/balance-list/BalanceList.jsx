import { Flex } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import * as householdService from "../../services/householdService";
import { useParams } from "react-router-dom";
import BalanceListItem from "./balance-list-item/BalanceListItem";

export default function BalanceList() {
    const [balances, setBalances] = useState([]);

    const { householdId } = useParams();

    useEffect(() => {
        householdService
            .getAllBalancesDetails(householdId)
            .then((result) => {
                const sortedBalances = result.balance.sort((a, b) => {
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
            .catch((err) => {
                console.log(err);
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
                <BalanceListItem key={balance._id} {...balance} />
            ))}
        </Flex>
    );
}
