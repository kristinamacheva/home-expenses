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
    useDisclosure,
    Avatar,
} from "@chakra-ui/react";
import { useContext } from "react";
import { FaEye, FaPen, FaRegTrashCan } from "react-icons/fa6";
import { useParams } from "react-router-dom";
import AuthContext from "../../../contexts/authContext";
import PaymentDetails from "./payment-details/PaymentDetails";

export default function PaymentListItem({
    _id,
    payer,
    payee,
    amount,
    date,
    paymentStatus,
    fetchPayments,
    fetchBalances,
}) {
    const { householdId } = useParams();

    const { userId } = useContext(AuthContext);

    const {
        isOpen: isDetailsModalOpen,
        onOpen: onOpenDetailsModal,
        onClose: onCloseDetailsModal,
    } = useDisclosure();

    let statusColor = "";
    if (paymentStatus === "Одобрен") {
        statusColor = "green";
    } else if (paymentStatus === "За одобрение") {
        statusColor = "gray";
    } else if (paymentStatus === "Отхвърлен") {
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
                <Stack
                    direction={{ base: "column", md: "row" }}
                    spacing={{ base: "3", md: "5" }}
                    alignItems={{ md: "center" }}
                >
                    <Stack
                        direction="column"
                        spacing={{ base: "1", md: "0" }}
                        mr={{ md: "2" }}
                    >
                        <Box display="inline-block">
                            <Badge
                                variant="subtle"
                                background={`${statusColor}.300`}
                                rounded="full"
                                px="1.5"
                                py="0.2"
                                textTransform="none"
                            >
                                {paymentStatus}
                            </Badge>
                        </Box>
                        <Text color={"gray.500"} fontSize="sm">
                            {new Date(date).toLocaleDateString("bg-BG")}
                        </Text>
                    </Stack>
                    <Stack>
                        <Text fontWeight="bold" mb="-1">
                            Платец:
                        </Text>
                        <Box display="flex" alignItems="center">
                            <Avatar
                                size="sm"
                                src={payer.avatar}
                                bg={payer.avatarColor}
                                mr={2}
                            />
                            <Text>{payer.name}</Text>
                        </Box>
                    </Stack>
                    <Stack>
                        <Text fontWeight="bold" mb="-1">
                            Получател:
                        </Text>
                        <Box display="flex" alignItems="center">
                            <Avatar
                                size="sm"
                                src={payee.avatar}
                                bg={payee.avatarColor}
                                mr={2}
                            />
                            <Text>{payee.name}</Text>
                        </Box>
                    </Stack>
                </Stack>

                <Stack
                    direction={{ base: "column", lg: "row" }}
                    alignItems={{ lg: "center" }}
                    spacing={{ base: "2", lg: "6" }}
                >
                    <Flex
                        direction="column"
                        align={{ md: "flex-end" }}
                        mt={{ base: "2", md: "0" }}
                    >
                        <Text
                            fontSize="xl"
                            fontWeight="bold"
                            color="themePurple.800"
                            mb="-1"
                        >
                            {amount} лв.
                        </Text>
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
                        {userId === payer && expenseStatus === "Отхвърлен" && (
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
            {isDetailsModalOpen && (
                <PaymentDetails
                    isOpen={isDetailsModalOpen}
                    onClose={onCloseDetailsModal}
                    paymentId={_id}
                    householdId={householdId}
                    fetchPayments={fetchPayments}
                    fetchBalances={fetchBalances}
                />
            )}
        </>
    );
}
