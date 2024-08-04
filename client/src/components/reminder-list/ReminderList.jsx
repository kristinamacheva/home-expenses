import { useContext, useEffect, useState } from "react";
import { HStack, Heading, Stack, Card, useToast, Flex, Text } from "@chakra-ui/react";

import * as reminderService from "../../services/reminderService";
import AuthContext from "../../contexts/authContext";
import ReminderListItem from "./reminder-list-item/ReminderListItem";

export default function ReminderList() {
    const [reminders, setReminders] = useState([]);

    const toast = useToast();
    const { logoutHandler } = useContext(AuthContext);

    useEffect(() => {
        reminderService
            .getAll()
            .then((result) => setReminders(result))
            .catch((error) => {
                if (error.status === 401) {
                    logoutHandler();
                } else {
                    toast({
                        title:
                            error.message ||
                            "Неуспешно зареждане на напомнянията",
                        status: "error",
                        duration: 6000,
                        isClosable: true,
                        position: "bottom",
                    });
                }
            });
    }, []);

    const removeReminderFromState = (reminderId) => {
        setReminders((prevReminders) =>
            prevReminders.filter((reminder) => reminder._id !== reminderId)
        );
    };

    return (
        <>
            <Stack>
                <Card background="white" p="2" boxShadow="xs">
                    <HStack mx={4} my={2} alignItems="center" flexWrap="wrap">
                        <Heading as="h1" size="lg" color="themePurple.800">
                            Напомняния
                        </Heading>
                    </HStack>
                </Card>
                <Stack mt="4">
                    {Array.isArray(reminders) && reminders.length > 0 ? (
                        reminders.map((reminder) => (
                            <ReminderListItem
                                key={reminder._id}
                                reminder={reminder}
                                onRemove={removeReminderFromState}
                            />
                        ))
                    ) : (
                        <Flex justifyContent="center" alignItems="center">
                            <Text>Няма налични напомняния</Text>
                        </Flex>
                    )}
                </Stack>
            </Stack>
        </>
    );
}
