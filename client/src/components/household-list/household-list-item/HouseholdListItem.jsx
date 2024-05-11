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

    const currentUserId = "1";

    const userBalance = balance.find((user) => user.userId === currentUserId);
    //TODO: fix the number type if necessary
    const userBalanceSum = userBalance ? userBalance.sum : 0;
    const badgeColorScheme = userBalance.type === "-" ? "red" : "green";

    let badgeText;

    if (userBalance.type === "-") {
        badgeText = `Дължите ${userBalanceSum} лв.`;
    } else {
        badgeText =
            userBalanceSum === 0
                ? "Нямате дългове"
                : `Дължат Ви ${userBalanceSum} лв.`;
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
                        <Avatar
                            name="Ryan Florence"
                            background={"themeYellow.900"}
                        />
                        <Avatar
                            name="Segun Adebayo"
                            src="https://bit.ly/sage-adebayo"
                        />
                        <Avatar
                            name="Kent Dodds"
                            src="https://bit.ly/kent-c-dodds"
                        />
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
                    {currentUserId === admin.userId && (
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
            <HouseholdEdit
                isOpen={isEditModalOpen}
                onClose={onCloseEditModal}
                _id
            />
        </>
    );
}
