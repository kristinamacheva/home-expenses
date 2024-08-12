import {
    Stack,
    Text,
    Heading,
    Box,
    Card,
    HStack,
    IconButton,
    useDisclosure,
    useToast,
    Avatar,
} from "@chakra-ui/react";
import { useContext } from "react";
import { FaPen, FaRegTrashCan } from "react-icons/fa6";
import { useParams } from "react-router-dom";
import AuthContext from "../../../contexts/authContext";
import * as categoryService from "../../../services/categoryService";
import CategoryEdit from "./category-edit/CategoryEdit";

export default function CategoryListItem({
    category,
    fetchCategories,
    isAdmin,
    archived,
}) {
    const { householdId } = useParams();
    const toast = useToast();

    const { userId, logoutHandler } = useContext(AuthContext);

    const {
        isOpen: isEditModalOpen,
        onOpen: onOpenEditModal,
        onClose: onCloseEditModal,
    } = useDisclosure();

    const categoryDeleteHandler = async (categoryId) => {
        try {
            await categoryService.remove(householdId, categoryId);

            toast({
                title: "Успешно изтрихте категорията",
                status: "success",
                duration: 6000,
                isClosable: true,
                position: "bottom",
            });

            fetchCategories();
        } catch (error) {
            if (error.status === 401) {
                logoutHandler();
            } else {
                toast({
                    title:
                        error.message || "Неуспешно изтриване на категорията",
                    status: "error",
                    duration: 6000,
                    isClosable: true,
                    position: "bottom",
                });
            }
        }
    };

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
                <Stack direction={{ base: "column", md: "row" }} spacing={{ base: "1", md: "8" }}>
                    <Stack direction="column" spacing={0}>
                        <Heading as="h3" size="md">
                            {category.title}
                        </Heading>

                        <Text color={"gray.500"} fontSize="md">
                            {category.description}
                        </Text>
                    </Stack>

                    {category.creator && (
                        <Stack
                            direction={{
                                base: "column",
                                lg: "row",
                            }}
                            alignItems={{ md: "center" }}
                            mt={2}
                        >
                            <Text fontWeight="bold">Създател: </Text>
                            <Box display="flex" alignItems="center">
                                <Avatar
                                    size="sm"
                                    src={category.creator.avatar}
                                    bg={category.creator.avatarColor}
                                    mr={2}
                                />
                                <Text>{category.creator.name}</Text>
                            </Box>
                        </Stack>
                    )}
                </Stack>
                <Stack
                    direction={{ base: "column", lg: "row" }}
                    alignItems={{ lg: "center" }}
                    spacing={{ base: "2", lg: "6" }}
                >
                    <HStack
                        spacing="0"
                        w={["auto", "auto", "120px"]}
                        justifyContent="flex-end"
                    >
                        {(userId === category.creator?._id || isAdmin) &&
                            category.predefined === false && !archived && (
                                <>
                                    <IconButton
                                        aria-label="Редактирайте"
                                        title="Редактирайте"
                                        icon={<FaPen fontSize="20px" />}
                                        variant="ghost"
                                        color="themePurple.800"
                                        onClick={onOpenEditModal}
                                    />
                                    <IconButton
                                        aria-label="Изтрийте"
                                        title="Изтрийте"
                                        icon={<FaRegTrashCan fontSize="20px" />}
                                        variant="ghost"
                                        color="themePurple.800"
                                        onClick={() =>
                                            categoryDeleteHandler(category._id)
                                        }
                                    />
                                </>
                            )}
                    </HStack>
                </Stack>
            </Card>
            {isEditModalOpen && (
                <CategoryEdit
                    isOpen={isEditModalOpen}
                    onClose={onCloseEditModal}
                    categoryId={category._id}
                    householdId={householdId}
                    fetchCategories={fetchCategories}
                />
            )}
        </>
    );
}
