import {
    Stack,
    Button,
    Heading,
    AvatarGroup,
    Avatar,
    Badge,
    Box,
    Card,
    IconButton,
    HStack,
    useDisclosure,
    useToast,
    Text,
} from "@chakra-ui/react";
import { FaEye, FaPen, FaRegTrashCan } from "react-icons/fa6";
import { FaSignOutAlt } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import AuthContext from "../../../contexts/authContext";
import * as notificationService from "../../../services/notificationService";

export default function NotificationListItem({ notification }) {
    const navigate = useNavigate();
    // const { userId, logoutHandler } = useContext(AuthContext);
    // const toast = useToast();

    // Handler to navigate based on notification type
    const handleDetailsClick = () => {
        switch (notification.resourceType) {
            case "HouseholdInvitation":
                navigate(`/household-invitations`);
                break;
            // case "PaidExpense":
            //     navigate(`/paid-expenses/${notification.resourceId}`);
            //     break;
            case "Household":
                navigate(`/households/${notification.resourceId}`);
                break;
            default:
                console.log("Unknown notification type");
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
                // borderRadius="lg"
                background="white"
                spacing="4"
                direction={{ base: "column", md: "row" }}
                justifyContent="space-between"
            >
                <Stack
                    direction="column"
                    spacing="1"
                >
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
                        // onClick={}
                    />
                </HStack>
            </Card>
        </>
    );
}
