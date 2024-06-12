import {
    Stack,
    Button,
    Heading,
    Badge,
    Box,
    Text,
    Flex,
    Card,
    HStack,
    IconButton,
} from "@chakra-ui/react";
import { useContext } from "react";
import { FaEye, FaPen, FaRegTrashCan } from "react-icons/fa6";
import { Link, useParams } from "react-router-dom";
import AuthContext from "../../../contexts/authContext";

// TODO: send only necessary data here
export default function PaidExpenseListItem({
    _id,
    title,
    category,
    creator,
    amount,
    date,
    balance,
    expenseStatus,
}) {
    const { householdId } = useParams();

    const { userId } = useContext(AuthContext);

    const filteredBalance = balance.filter(
        (currentBalance) => currentBalance.user === userId
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
    
    let statusColor = '';
    if (expenseStatus === 'Одобрен') {
        statusColor = "green";
    } else if (expenseStatus === 'За одобрение') {
        statusColor = "gray";
    } else if (expenseStatus === 'Отхвърлен') {
        statusColor = "red";
    }

    return (
        <Card
            px="4"
            py="3"
            mx="0.2em"
            my="1"
            boxShadow="md"
            // borderRadius="lg"
            // borderTop="4px solid #676F9D"
            background="white"
            spacing={{ base: "1", md: "4" }}
            direction={{ base: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ md: "center" }}
        >
            <Stack direction="column" spacing={{ base: "1", md: "0" }}>
                <Stack
                    direction="row"
                    spacing="2"
                    justifyContent={{ base: "space-between", lg: "initial" }}
                >
                    <Heading as="h3" size="md">
                        {title}
                    </Heading>
                    <Box display="inline-block">
                        <Badge
                            variant="subtle"
                            background={`${statusColor}.300`}
                            rounded="full"
                            px="1.5"
                            py="0.2"
                            textTransform="none"
                        >
                            {expenseStatus}
                        </Badge>
                    </Box>
                </Stack>

                <Box display="inline-block">
                    <Badge variant="subtle" background={"themePurple.200"} color={"themePurple.800"}>
                    {category}
                    </Badge>
                </Box>
                <Text color={"gray.500"} fontSize="sm">
                    {new Date(date).toLocaleDateString('bg-BG')}
                </Text>
            </Stack>
            <Stack
                direction={{ base: "column", lg: "row" }}
                alignItems={{ lg: "center" }}
                spacing={{ base: "2", lg: "6" }}
            >
                <Flex direction="column" align={{ md: "flex-end" }}>
                    <Text
                        fontSize="xl"
                        fontWeight="bold"
                        color="themePurple.800"
                        mb="-1"
                    >
                        {amount} лв.
                    </Text>
                    <Box display="inline-block">
                        <Badge variant="subtle" colorScheme={badgeColor}>
                            {balanceText}
                        </Badge>
                    </Box>
                </Flex>
                <HStack
                    spacing="0"
                    w={["auto", "auto", "120px"]}
                    justifyContent="flex-end"
                >
                    <IconButton
                        aria-label="Детайли"
                        title="Детайли"
                        icon={<FaEye fontSize="20px" />}
                        variant="ghost"
                        color="themePurple.800"
                    />
                    {/* TODO: implement isAdmin logic */}
                    {/* {(currentUserId === creator.userId || isAdmin(currentUserId)) && (
                        <>
                        </>
                    )} */}
                    {userId === creator && (
                        <>
                            <IconButton
                                aria-label="Редактирайте"
                                title="Редактирайте"
                                icon={<FaPen fontSize="20px" />}
                                variant="ghost"
                                color="themePurple.800"
                            />
                            <IconButton
                                aria-label="Изтрийте"
                                title="Изтрийте"
                                icon={<FaRegTrashCan fontSize="20px" />}
                                variant="ghost"
                                color="themePurple.800"
                            />
                        </>
                    )}
                </HStack>
            </Stack>
        </Card>
    );
}
