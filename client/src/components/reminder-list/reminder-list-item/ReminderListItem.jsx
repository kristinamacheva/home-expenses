import {
    Stack,
    Card,
    IconButton,
    HStack,
    useDisclosure,
    Text,
    useToast,
} from "@chakra-ui/react";
import { FaEye, FaRegTrashCan } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import PaidExpenseDetails from "../../paid-expense-list/paid-expense-list-item/paid-expense-details/PaidExpenseDetails";
import PaymentDetails from "../../balance-list/payment-list-item/payment-details/PaymentDetails";
import { useContext } from "react";
import * as reminderService from "../../../services/reminderService";
import AuthContext from "../../../contexts/authContext";

export default function ReminderListItem({ reminder, onRemove }) {
    const navigate = useNavigate();
    const toast = useToast();
    const { logoutHandler } = useContext(AuthContext);

    const {
        isOpen: isPaidExpenseDetailsModalOpen,
        onOpen: onOpenPaidExpenseDetailsModal,
        onClose: onClosePaidExpenseDetailsModal,
    } = useDisclosure();

    const {
        isOpen: isPaymentDetailsModalOpen,
        onOpen: onOpenPaymentDetailsModal,
        onClose: onClosePaymentDetailsModal,
    } = useDisclosure();

    // Handler to navigate based on reminder type
    const handleDetailsClick = () => {
        switch (reminder.resourceType) {
            case "PaidExpense":
                onOpenPaidExpenseDetailsModal();
                break;
            case "Payment":
                onOpenPaymentDetailsModal();
                break;
            default:
                navigate(`/households/${reminder.household}`);
                break;
        }
    };

    const deleteReminderHandler = async (_id) => {
        try {
            await reminderService.remove(_id);

            toast({
                title: "Успешно изтрихте напомнянето",
                status: "success",
                duration: 6000,
                isClosable: true,
                position: "bottom",
            });

            onRemove(_id);
        } catch (error) {
            if (error.status === 401) {
                logoutHandler();
            } else {
                toast({
                    title:
                        error.message || "Неуспешно изтриване на напомнянето",
                    status: "error",
                    duration: 6000,
                    isClosable: true,
                    position: "bottom",
                });
            }
        }
    };

    return (
        <>
            <Card
                px="5"
                py="5"
                mx="4"
                my="1"
                boxShadow="md"
                background="white"
                spacing="4"
                direction={{ base: "column", md: "row" }}
                justifyContent="space-between"
            >
                <Stack direction="column" spacing="1">
                    <Text>{reminder.message}</Text>
                    <Text fontSize="xs" color="gray.500">
                        {new Date(reminder.createdAt)
                            .toLocaleString("bg-BG", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                            })
                            .replace(" в", "")}{" "}
                        ч.
                    </Text>
                </Stack>
                <HStack
                    spacing="0"
                    w={["auto", "auto", "90px"]}
                    justifyContent="flex-end"
                >
                    <IconButton
                        aria-label="Детайли"
                        title="Детайли"
                        icon={<FaEye fontSize="20px" />}
                        variant="ghost"
                        color="themePurple.800"
                        onClick={handleDetailsClick}
                    />
                    <IconButton
                        aria-label="Изтрийте"
                        title="Изтрийте"
                        icon={<FaRegTrashCan fontSize="20px" />}
                        variant="ghost"
                        color="themePurple.800"
                        onClick={() => deleteReminderHandler(reminder._id)}
                    />
                </HStack>
            </Card>
            {isPaidExpenseDetailsModalOpen && (
                <PaidExpenseDetails
                    isOpen={isPaidExpenseDetailsModalOpen}
                    onClose={onClosePaidExpenseDetailsModal}
                    paidExpenseId={reminder.resourceId}
                    householdId={reminder.household}
                />
            )}
            {isPaymentDetailsModalOpen && (
                <PaymentDetails
                    isOpen={isPaymentDetailsModalOpen}
                    onClose={onClosePaymentDetailsModal}
                    paymentId={reminder.resourceId}
                    householdId={reminder.household}
                />
            )}
        </>
    );
}
