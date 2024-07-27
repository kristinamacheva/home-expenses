import {
    Stack,
    Heading,
    Avatar,
    Badge,
    Box,
    Card,
    Button,
    useDisclosure,
} from "@chakra-ui/react";
import { useContext } from "react";
import AuthContext from "../../../contexts/authContext";
import PaymentCreate from "./payment-create/PaymentCreate";

export default function BalanceListItem({ balance, fetchPayments }) {
    const { userId } = useContext(AuthContext);
    const {
        isOpen: isCreatePaymentModalOpen,
        onOpen: onOpenCreatePaymentModal,
        onClose: onCloseCreatePaymentModal,
    } = useDisclosure();

    let badgeText = "";
    let badgeColor = "";

    if (userId === balance._id) {
        if (balance.type === "-") {
            badgeText = `Дължите ${balance.sum} лв.`;
        } else {
            badgeText =
                balance.sum === 0
                    ? "Нямате задължения"
                    : `Дължат Ви ${balance.sum} лв.`;
        }
    } else {
        if (balance.type === "-") {
            badgeText = `Дължи ${balance.sum} лв.`;
        } else {
            badgeText =
                balance.sum === 0
                    ? "Няма задължения"
                    : `Ще получи ${balance.sum} лв.`;
        }
    }

    badgeColor = balance.type === "-" ? "red" : "green";

    return (
        <Card
            px="5"
            py="5"
            boxShadow="md"
            background="white"
            spacing="4"
            direction="column"
            justifyContent="center"
            alignItems="center"
            width="280px"
            height="210px"
        >
            <Stack
                direction="column"
                alignItems="center"
                justifyContent="center"
                spacing="3"
            >
                <Avatar
                    name={balance.name}
                    src={balance.avatar}
                    background={balance.avatarColor}
                />
                <Stack spacing="0.5" alignItems="center">
                    <Heading as="h4" size="sm">
                        {balance.name}
                    </Heading>
                    <Box display="inline-block">
                        <Badge variant="subtle" colorScheme={badgeColor}>
                            {badgeText}
                        </Badge>
                    </Box>
                </Stack>
                {userId === balance._id &&
                    balance.type === "+" &&
                    balance.sum !== 0 && (
                        <Button type="primary">Изпратете напомняне</Button>
                    )}
                {userId === balance._id && balance.type === "-" && (
                    <Button type="primary" onClick={onOpenCreatePaymentModal}>
                        Погасете задължението
                    </Button>
                )}
                {isCreatePaymentModalOpen && (
                    <PaymentCreate
                        isOpen={isCreatePaymentModalOpen}
                        onClose={onCloseCreatePaymentModal}
                        balanceSum={balance.sum}
                        fetchPayments={fetchPayments}
                    />
                )}
            </Stack>
        </Card>
    );
}
