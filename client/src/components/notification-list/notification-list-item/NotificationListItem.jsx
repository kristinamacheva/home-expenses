import {
    Stack,
    Card,
    IconButton,
    HStack,
    useDisclosure,
    Text,
} from "@chakra-ui/react";
import { FaEye, FaRegTrashCan } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import PaidExpenseDetails from "../../paid-expense-list/paid-expense-list-item/paid-expense-details/PaidExpenseDetails";
import PaymentDetails from "../../balance-list/payment-list-item/payment-details/PaymentDetails";
import { useContext } from "react";
import NotificationContext from "../../../contexts/notificationContext";

export default function NotificationListItem({ notification }) {
    const navigate = useNavigate();
    const { deleteNotification } = useContext(NotificationContext);

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

    // Handler to navigate based on notification type
    const handleDetailsClick = () => {
        switch (notification.resourceType) {
            case "HouseholdInvitation":
                navigate(`/household-invitations`);
                break;
            case "PaidExpense":
                onOpenPaidExpenseDetailsModal();
                break;
            case "Payment":
                onOpenPaymentDetailsModal();
                break;
            case "Reminder":
                navigate(`/reminders`);
                break;
            default:
                navigate(`/households/${notification.household}`);
                break;
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
                    <Text>{notification.message}</Text>
                    <Text fontSize="xs" color="gray.500">
                        {new Date(notification.timestamp)
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
                        onClick={() => deleteNotification(notification._id)}
                    />
                </HStack>
            </Card>
            {isPaidExpenseDetailsModalOpen && (
                <PaidExpenseDetails
                    isOpen={isPaidExpenseDetailsModalOpen}
                    onClose={onClosePaidExpenseDetailsModal}
                    paidExpenseId={notification.resourceId}
                    householdId={notification.household}
                />
            )}
            {isPaymentDetailsModalOpen && (
                <PaymentDetails
                    isOpen={isPaymentDetailsModalOpen}
                    onClose={onClosePaymentDetailsModal}
                    paymentId={notification.resourceId}
                    householdId={notification.household}
                />
            )}
        </>
    );
}
