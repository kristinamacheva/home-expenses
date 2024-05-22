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
} from "@chakra-ui/react";
import { FaEye, FaPen } from "react-icons/fa6";
import { Link } from "react-router-dom";
import HouseholdEdit from "./household-edit/HouseholdEdit";

export default function HouseholdListItem({
    _id,
    name,
    members,
    balance,
    admin,
}) {
    const {
        isOpen: isEditModalOpen,
        onOpen: onOpenEditModal,
        onClose: onCloseEditModal,
    } = useDisclosure();

    const currentUserId = "6649f627d4819c1373f8b8e9";

    const userBalance = balance.find((balanceEntry) => balanceEntry.user._id === currentUserId);
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
                    ? "Нямате дългове"
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
                                src={member.user.avatar || ""}
                                background={"themeYellow.900"}
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
                        to={`/domakinstva/${_id}`}
                        aria-label="Детайли"
                        title="Детайли"
                        icon={<FaEye fontSize="20px" />}
                        variant="ghost"
                        color="themePurple.800"
                    />
                    {/* TODO: implement isAdmin logic */}
                    {/* {(currentUserId === creator.userId || isAdmin(currentUserId)) && (
                        <>
                        </>
                    )} */}
                    {currentUserId === admin._id && (
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
