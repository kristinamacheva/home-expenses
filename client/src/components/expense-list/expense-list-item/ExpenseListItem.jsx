import {
    Stack,
    Button,
    Heading,
    Badge,
    Box,
    Text,
    Flex,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";

export default function ExpenseListItem({
    _id,
    title,
    amount,
    split,
    paid,
    owed,
    balance,
    category,
    creator,
    household,
    expenseDate,
}) {
    const currentUserId = "1";

    const filteredBalance = balance.filter(
        (currentBalance) => currentBalance.userId === currentUserId
    );

    let balanceText = "";
    let badgeColor = "";

    if (filteredBalance.length === 1) {
        if (filteredBalance[0].type === "+") {
            balanceText = `Дължат Ви ${filteredBalance[0].sum} лв.`;
            badgeColor = "green";
        } else {
            balanceText = `Дължите ${filteredBalance[0].sum} лв.`;
            badgeColor = "red";
        }
    } else {
        balanceText = "Не участвате в разхода";
        badgeColor = "gray";
    }

    return (
        <Stack
            px="4"
            py="3"
            mx="4"
            my="1"
            boxShadow="lg"
            borderRadius="lg"
            background="white"
            spacing={{ base: "1", md: "4" }}
            direction={{ base: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ md: "center" }}
        >
            <Stack direction="column" spacing={{ base: "1", md: "0" }}>
                <Stack direction="row" spacing="2">
                    <Heading as="h3" size="md">
                        {title}
                    </Heading>
                    <Box display="inline-block">
                        <Badge
                            variant="subtle"
                            background={"themePurple.400"}
                            rounded="full"
                            px="1.5"
                            py="0.2"
                            textTransform="none"
                        >
                            {category}
                        </Badge>
                    </Box>
                </Stack>

                <Text color={"gray.500"} fontSize="sm">
                    {expenseDate}
                </Text>
            </Stack>
            <Stack
                direction={{ base: "column", md: "row" }}
                alignItems={{ md: "center" }}
                spacing={{ base: "2", md: "6" }}
            >
                <Flex direction="column" align={{ md: "flex-end" }}>
                    <Text fontSize="xl" fontWeight="bold" >
                        {amount} лв.
                    </Text>
                    <Box display="inline-block">
                        <Badge variant="subtle" colorScheme={badgeColor}>
                            {balanceText}
                        </Badge>
                    </Box>
                </Flex>
                <Button as={Link} variant="outline" mt={{ base: "1" }}>
                    Детайли
                </Button>
            </Stack>
        </Stack>
    );
}
