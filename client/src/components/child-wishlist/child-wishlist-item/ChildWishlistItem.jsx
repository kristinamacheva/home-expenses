import {
    Stack,
    Heading,
    Badge,
    Box,
    Text,
    Flex,
    Card,
    HStack,
    IconButton,
    useDisclosure,
    useToast,
} from "@chakra-ui/react";
import { useContext } from "react";
import { FaPen, FaRegTrashCan } from "react-icons/fa6";
import { BiSolidPurchaseTag } from "react-icons/bi";
import { useParams } from "react-router-dom";
import AuthContext from "../../../contexts/authContext";
import * as childWishlistItemService from "../../../services/childWishlistItemService";
import ChildWishlistItemEdit from "./child-wishlist-item-edit/ChildWishlistItemEdit";

export default function ChildWishlistItem({
    _id,
    title,
    amount,
    createdAt,
    purchased,
    purchaseDate,
    fetchChildWishlistItems,
    onRemove,
    childAllowance,
    getAllowanceForUser,
    archived,
    childId = null,
}) {
    const { householdId } = useParams();
    const toast = useToast();

    const { logoutHandler } = useContext(AuthContext);

    const {
        isOpen: isEditModalOpen,
        onOpen: onOpenEditModal,
        onClose: onCloseEditModal,
    } = useDisclosure();

    const childWishlistItemDeleteHandler = async (_id) => {
        if (childId) {
            return;
        }

        const childWishlistItemId = _id;

        try {
            await childWishlistItemService.remove(
                householdId,
                childWishlistItemId
            );

            toast({
                title: "Успешно изтрихте желанието",
                status: "success",
                duration: 6000,
                isClosable: true,
                position: "bottom",
            });

            onRemove();
        } catch (error) {
            if (error.status === 401) {
                logoutHandler();
            } else {
                toast({
                    title: error.message || "Неуспешно изтриване на желанието",
                    status: "error",
                    duration: 6000,
                    isClosable: true,
                    position: "bottom",
                });
            }
        }
    };

    const purchaseClickHandler = async (_id) => {
        if (childId) {
            return;
        }

        const childWishlistItemId = _id;

        try {
            await childWishlistItemService.purchase(
                householdId,
                childWishlistItemId
            );

            toast({
                title: "Успешно закупихте желанието",
                status: "success",
                duration: 6000,
                isClosable: true,
                position: "bottom",
            });

            getAllowanceForUser();
            fetchChildWishlistItems();
        } catch (error) {
            if (error.status === 401) {
                logoutHandler();
            } else {
                toast({
                    title: error.message || "Неуспешно закупуване на желанието",
                    status: "error",
                    duration: 6000,
                    isClosable: true,
                    position: "bottom",
                });
            }
        }
    };

    let purchaseText = "";
    let statusColor = "";

    if (purchased) {
        purchaseText = "Закупено";
        statusColor = "green";
    } else {
        purchaseText = "Незакупено";
        statusColor = "gray";
    }

    let badgeColor = "";
    let badgeText = "";
    if (!purchased) {
        if (amount <= childAllowance) {
            badgeColor = "green";
            if (childId) {
                badgeText = "Може да закупи";
            } else {
                badgeText = "Може да закупите";
            }
        } else {
            badgeColor = "red";
            if (childId) {
                badgeText = `Не му достигат ${(
                    (amount * 100 - childAllowance * 100) /
                    100
                ).toFixed(2)} лв.`;
            } else {
                badgeText = `Не Ви достигат ${(
                    (amount * 100 - childAllowance * 100) /
                    100
                ).toFixed(2)} лв.`;
            }
        }
    }

    return (
        <>
            <Card
                px="4"
                py="3"
                mx="0.2em"
                my="1"
                boxShadow="md"
                background="white"
                spacing={{ base: "1", md: "4" }}
                direction={{ base: "column", md: "row" }}
                justifyContent="space-between"
                alignItems={{ md: "center" }}
            >
                <Stack direction="column" spacing={{ base: "1", md: "0" }}>
                    <Stack
                        direction="row"
                        spacing="2"
                        justifyContent={{
                            base: "space-between",
                            lg: "initial",
                        }}
                    >
                        <Heading as="h3" size="md">
                            {title}
                        </Heading>
                        <Box display="inline-block">
                            <Badge
                                variant="subtle"
                                background={`${statusColor}.300`}
                                rounded="full"
                                px="1.5"
                                py="0.2"
                                textTransform="none"
                            >
                                {purchaseText}
                            </Badge>
                        </Box>
                    </Stack>

                    <Text color={"gray.500"} fontSize="sm" mt={1}>
                        Създадено:{" "}
                        {new Date(createdAt).toLocaleDateString("bg-BG")}
                    </Text>
                    {purchaseDate && (
                        <Text color={"gray.500"} fontSize="sm">
                            Закупено:{" "}
                            {new Date(purchaseDate).toLocaleDateString("bg-BG")}
                        </Text>
                    )}
                </Stack>
                <Stack
                    direction={{ base: "column", lg: "row" }}
                    alignItems={{ lg: "center" }}
                    spacing={{ base: "2", lg: "6" }}
                >
                    <Flex direction="column" align={{ md: "flex-end" }}>
                        <Text
                            fontSize="xl"
                            fontWeight="bold"
                            color="themePurple.800"
                            mb="-1"
                        >
                            {amount.toFixed(2)} лв.
                        </Text>
                        {!purchased && (
                            <Box display="inline-block">
                                <Badge
                                    variant="subtle"
                                    colorScheme={badgeColor}
                                >
                                    {badgeText}
                                </Badge>
                            </Box>
                        )}
                    </Flex>
                    <HStack
                        spacing="0"
                        w={["auto", "auto", "120px"]}
                        justifyContent="flex-end"
                    >
                        {!purchased && !archived && !childId && (
                            <>
                                {amount <= childAllowance && (
                                    <IconButton
                                        aria-label="Закупете"
                                        title="Закупете"
                                        onClick={() =>
                                            purchaseClickHandler(_id)
                                        }
                                        icon={
                                            <BiSolidPurchaseTag fontSize="20px" />
                                        }
                                        variant="ghost"
                                        color="themePurple.800"
                                    />
                                )}
                                <IconButton
                                    aria-label="Редактирайте"
                                    title="Редактирайте"
                                    icon={<FaPen fontSize="20px" />}
                                    variant="ghost"
                                    color="themePurple.800"
                                    onClick={onOpenEditModal}
                                />
                            </>
                        )}

                        {!archived && !childId && (
                            <IconButton
                                aria-label="Изтрийте"
                                title="Изтрийте"
                                icon={<FaRegTrashCan fontSize="20px" />}
                                variant="ghost"
                                color="themePurple.800"
                                onClick={() =>
                                    childWishlistItemDeleteHandler(_id)
                                }
                            />
                        )}
                    </HStack>
                </Stack>
            </Card>
            {isEditModalOpen && !childId && (
                <ChildWishlistItemEdit
                    isOpen={isEditModalOpen}
                    onClose={onCloseEditModal}
                    childWishlistItemId={_id}
                    householdId={householdId}
                    fetchChildWishlistItems={fetchChildWishlistItems}
                />
            )}
        </>
    );
}
