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
    useToast  
} from "@chakra-ui/react";
import { FaEye, FaPen } from "react-icons/fa6";
import { FaSignOutAlt } from "react-icons/fa";
import { Link } from "react-router-dom";
import HouseholdEdit from "./household-edit/HouseholdEdit";
import { useContext } from "react";
import AuthContext from "../../../contexts/authContext";
import * as householdService from "../../../services/householdService";

export default function HouseholdListItem({
    household,
    fetchHouseholds
    // removeHouseholdFromState
}) {
    const {
        isOpen: isEditModalOpen,
        onOpen: onOpenEditModal,
        onClose: onCloseEditModal,
    } = useDisclosure();

    const { userId, logoutHandler } = useContext(AuthContext);
    const toast = useToast();

    const leaveHouseholdHandler = async (householdId) => {
        try {
            const result = await householdService.leave(householdId);
            console.log(result.message);
            // removeHouseholdFromState(householdId); 
            fetchHouseholds();
        } catch (error) {
            if (error.status === 401) {
                logoutHandler();
            } else {
                toast({
                    title: error.message,
                    status: 'error',
                    duration: 6000,
                    isClosable: true,
                    position: 'bottom'
                  })
            }
        }
    };

    const isAdmin = household.admins.includes(userId);

    const userBalance = household.balance[0];
    const userBalanceSum = userBalance ? userBalance.sum : 0;
    // TODO: color
    const badgeColorScheme = userBalance ? (userBalance.type === "-" ? "red" : "green") : "gray";

    let badgeText;

    // TODO: error if no user?
    if (userBalance) {
        if (userBalance.type === "-") {
            badgeText = `Дължите ${userBalanceSum} лв.`;
        } else {
            badgeText =
                userBalanceSum === 0
                    ? "Нямате задължения"
                    : `Дължат Ви ${userBalanceSum} лв.`;
        }
    } else {
        badgeText = "Няма информация за баланса";
    }

    return (
        <>
            <Card
                px="5"
                py="5"
                mx="4"
                my="1"
                boxShadow="md"
                // borderRadius="lg"
                borderTop="4px solid #676F9D"
                background="white"
                spacing="4"
                direction={{ base: "column", md: "row" }}
                justifyContent="space-between"
                alignItems={{ md: "center" }}
            >
                <Stack
                    direction={{ base: "column", md: "row" }}
                    alignItems={{ md: "center" }}
                    spacing={{ base: "2", md: "4" }}
                >
                    <Stack direction="column" spacing={{ base: "1", md: "0" }}>
                        <Heading as="h3" size="md">
                            {household.name}
                        </Heading>
                        <Box display="inline-block">
                            <Badge
                                variant="subtle"
                                colorScheme={badgeColorScheme}
                            >
                                {badgeText}
                            </Badge>
                        </Box>
                    </Stack>
                    <AvatarGroup size="md" max={2}>
                        {household.members.map((member) => (
                            <Avatar
                                key={member._id}
                                name={member.name}
                                src={member.avatar}
                                background={member.avatarColor}
                            />
                        ))}
                    </AvatarGroup>
                </Stack>
                <HStack
                    spacing="0"
                    w={["auto", "auto", "90px"]}
                    justifyContent="flex-end"
                >
                    <IconButton
                        as={Link}
                        to={`/households/${household._id}`}
                        aria-label="Детайли"
                        title="Детайли"
                        icon={<FaEye fontSize="20px" />}
                        variant="ghost"
                        color="themePurple.800"
                    />
                    {isAdmin && (
                        <>
                            <IconButton
                                aria-label="Редактирайте"
                                title="Редактирайте"
                                icon={<FaPen fontSize="20px" />}
                                variant="ghost"
                                color="themePurple.800"
                                onClick={onOpenEditModal}
                            />
                            {/* <IconButton
                            aria-label="Изтрийте"
                            title="Изтрийте"
                            icon={<FaRegTrashCan fontSize="20px" />}
                            variant="ghost"
                            color="themePurple.800"
                        /> */}
                        </>
                    )}
                    <IconButton
                        as={Link}
                        aria-label="Напуснете"
                        title="Напуснете"
                        icon={<FaSignOutAlt fontSize="20px" />}
                        variant="ghost"
                        color="themePurple.800"
                        onClick={() => leaveHouseholdHandler(household._id)}
                    />
                </HStack>
            </Card>
            {isEditModalOpen && (
                <HouseholdEdit
                    isOpen={isEditModalOpen}
                    onClose={onCloseEditModal}
                    householdId={household._id}
                />
            )}
        </>
    );
}
