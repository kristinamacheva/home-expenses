import { useContext } from "react";
import {
    HStack,
    Heading,
    Stack,
    Card,
    useToast,
} from "@chakra-ui/react";

import AuthContext from "../../contexts/authContext";
import NotificationListItem from "./notification-list-item/NotificationListItem";
import NotificationContext from "../../contexts/notificationContext";

export default function NotificationList() {
    const { notifications } = useContext(NotificationContext);

    return (
        <>
            <Stack>
                <Card background="white" p="2" boxShadow="xs">
                    <HStack mx={4} my={2} alignItems="center" flexWrap="wrap">
                        <Heading as="h1" size="lg" color="themePurple.800">
                            Известия
                        </Heading>
                    </HStack>
                </Card>
                <Stack mt="4">
                    {notifications.map((notification) => (
                        <NotificationListItem
                            key={notification._id}
                            notification={notification}
                        />
                    ))}
                </Stack>
            </Stack>
        </>
    );
}
