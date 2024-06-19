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
    _id,
    name,
    members,
    balance,
    admins,
    removeHouseholdFromState
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
            removeHouseholdFromState(householdId); 
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

    const isAdmin = admins.includes(userId);

    const userBalance = balance.find((balanceEntry) => balanceEntry.user._id === userId);
    //TODO: fix the number type if necessary
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
                            {name}
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
                        {members.map((member) => (
                            <Avatar
                                key={member.user._id}
                                name={member.user.name}
                                src={member.user.avatar}
                                background={member.user.avatarColor}
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
                        to={`/households/${_id}`}
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
                        onClick={() => leaveHouseholdHandler(_id)}
                    />
                </HStack>
            </Card>
            {isEditModalOpen && (
                <HouseholdEdit
                    isOpen={isEditModalOpen}
                    onClose={onCloseEditModal}
                    householdId={_id}
                />
            )}
        </>
    );
}
