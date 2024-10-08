import {
    Stack,
    Heading,
    Badge,
    Box,
    Text,
    Flex,
    Card,
    HStack,
    IconButton,
    useDisclosure,
    useToast,
} from "@chakra-ui/react";
import { useContext } from "react";
import { FaEye, FaPen, FaRegTrashCan } from "react-icons/fa6";
import { useParams } from "react-router-dom";
import AuthContext from "../../../contexts/authContext";
import PaidExpenseDetails from "./paid-expense-details/PaidExpenseDetails";
import * as paidExpenseService from "../../../services/paidExpenseService";
import PaidExpenseEdit from "./paid-expense-edit/PaidExpenseEdit";

export default function PaidExpenseListItem({
    _id,
    title,
    category,
    creator,
    amount,
    date,
    balance,
    expenseStatus,
    fetchPaidExpenses,
    isAdmin,
    archived,
}) {
    const { householdId } = useParams();
    const toast = useToast();

    const { userId, logoutHandler } = useContext(AuthContext);

    const {
        isOpen: isDetailsModalOpen,
        onOpen: onOpenDetailsModal,
        onClose: onCloseDetailsModal,
    } = useDisclosure();

    const {
        isOpen: isEditModalOpen,
        onOpen: onOpenEditModal,
        onClose: onCloseEditModal,
    } = useDisclosure();

    const paidExpenseDeleteHandler = async (_id) => {
        const paidExpenseId = _id;

        try {
            await paidExpenseService.remove(householdId, paidExpenseId);

            toast({
                title: "Успешно изтрихте платения разход",
                status: "success",
                duration: 6000,
                isClosable: true,
                position: "bottom",
            });

            fetchPaidExpenses();
        } catch (error) {
            if (error.status === 401) {
                logoutHandler();
            } else {
                toast({
                    title:
                        error.message ||
                        "Неуспешно изтриване на платения разход",
                    status: "error",
                    duration: 6000,
                    isClosable: true,
                    position: "bottom",
                });
            }
        }
    };

    let balanceText = "";
    let badgeColor = "";

    if (balance.length === 1) {
        if (balance[0].type === "+") {
            balanceText = `Дължат Ви ${balance[0].sum} лв.`;
            badgeColor = "green";
        } else {
            balanceText = `Дължите ${balance[0].sum} лв.`;
            badgeColor = "red";
        }
    } else {
        balanceText = "Не участвате в разхода";
        badgeColor = "gray";
    }

    let statusColor = "";
    if (expenseStatus === "Одобрен") {
        statusColor = "green";
    } else if (expenseStatus === "За одобрение") {
        statusColor = "gray";
    } else if (expenseStatus === "Отхвърлен") {
        statusColor = "red";
    }

    return (
        <>
            <Card
                px="4"
                py="3"
                mx="0.2em"
                my="1"
                boxShadow="md"
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
                        justifyContent={{
                            base: "space-between",
                            lg: "initial",
                        }}
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
                        <Badge
                            variant="subtle"
                            background={"themePurple.200"}
                            color={"themePurple.800"}
                        >
                            {category}
                        </Badge>
                    </Box>
                    <Text color={"gray.500"} fontSize="sm">
                        {new Date(date).toLocaleDateString("bg-BG")}
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
                            onClick={onOpenDetailsModal}
                            icon={<FaEye fontSize="20px" />}
                            variant="ghost"
                            color="themePurple.800"
                        />
                        {(userId === creator || isAdmin) &&
                            expenseStatus === "Отхвърлен" && !archived && (
                                <>
                                    <IconButton
                                        aria-label="Редактирайте"
                                        title="Редактирайте"
                                        icon={<FaPen fontSize="20px" />}
                                        variant="ghost"
                                        color="themePurple.800"
                                        onClick={onOpenEditModal}
                                    />
                                    <IconButton
                                        aria-label="Изтрийте"
                                        title="Изтрийте"
                                        icon={<FaRegTrashCan fontSize="20px" />}
                                        variant="ghost"
                                        color="themePurple.800"
                                        onClick={() =>
                                            paidExpenseDeleteHandler(_id)
                                        }
                                    />
                                </>
                            )}
                    </HStack>
                </Stack>
            </Card>
            {isDetailsModalOpen && (
                <PaidExpenseDetails
                    isOpen={isDetailsModalOpen}
                    onClose={onCloseDetailsModal}
                    paidExpenseId={_id}
                    householdId={householdId}
                    fetchPaidExpenses={fetchPaidExpenses}
                    archived={archived}
                />
            )}
            {isEditModalOpen && (
                <PaidExpenseEdit
                    isOpen={isEditModalOpen}
                    onClose={onCloseEditModal}
                    paidExpenseId={_id}
                    householdId={householdId}
                    fetchPaidExpenses={fetchPaidExpenses}
                />
            )}
        </>
    );
}
