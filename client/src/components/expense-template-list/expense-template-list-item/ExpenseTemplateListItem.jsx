import {
    Stack,
    Heading,
    Badge,
    Box,
    Card,
    HStack,
    IconButton,
    useDisclosure,
    useToast,
} from "@chakra-ui/react";
import { useContext } from "react";
import { FaEye, FaPen, FaRegTrashCan } from "react-icons/fa6";
import { useParams } from "react-router-dom";
import AuthContext from "../../../contexts/authContext";
import * as expenseTemplateService from "../../../services/expenseTemplateService";
import ExpenseTemplateEdit from "./expense-template-edit/ExpenseTemplateEdit";
import ExpenseTemplateDetails from "./expense-template-details/ExpenseTemplateDetails";
import PaidExpenseCreate from "../../paid-expense-list/paid-expense-create/PaidExpenseCreate";

export default function ExpenseTemplateListItem({
    _id,
    templateName,
    category,
    fetchExpenseTemplates,
    archived,
}) {
    const { householdId } = useParams();
    const toast = useToast();

    const { logoutHandler } = useContext(AuthContext);

    const {
        isOpen: isCreateModalOpen,
        onOpen: onOpenCreateModal,
        onClose: onCloseCreateModal,
    } = useDisclosure();

    const {
        isOpen: isDetailsModalOpen,
        onOpen: onOpenDetailsModal,
        onClose: onCloseDetailsModal,
    } = useDisclosure();

    const {
        isOpen: isEditModalOpen,
        onOpen: onOpenEditModal,
        onClose: onCloseEditModal,
    } = useDisclosure();

    const expenseTemplateDeleteHandler = async (_id) => {
        const expenseTemplateId = _id;

        try {
            await expenseTemplateService.remove(householdId, expenseTemplateId);

            toast({
                title: "Успешно изтрихте шаблона",
                status: "success",
                duration: 6000,
                isClosable: true,
                position: "bottom",
            });

            fetchExpenseTemplates();
        } catch (error) {
            if (error.status === 401) {
                logoutHandler();
            } else {
                toast({
                    title: error.message || "Неуспешно изтриване на шаблона",
                    status: "error",
                    duration: 6000,
                    isClosable: true,
                    position: "bottom",
                });
            }
        }
    };

    const openCreateModalHandler = () => {
        onCloseDetailsModal();
        onOpenCreateModal();
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
                            {templateName}
                        </Heading>
                    </Stack>

                    <Box display="inline-block">
                        <Badge
                            variant="subtle"
                            background={"themePurple.200"}
                            color={"themePurple.800"}
                        >
                            {category}
                        </Badge>
                    </Box>
                </Stack>
                <Stack>
                    <HStack
                        spacing="0"
                        w={["auto", "auto", "120px"]}
                        justifyContent="flex-end"
                    >
                        <IconButton
                            aria-label="Детайли"
                            title="Детайли"
                            onClick={onOpenDetailsModal}
                            icon={<FaEye fontSize="20px" />}
                            variant="ghost"
                            color="themePurple.800"
                        />
                        {!archived && (
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
                                        expenseTemplateDeleteHandler(_id)
                                    }
                                />
                            </>
                        )}
                    </HStack>
                </Stack>
            </Card>
            {isCreateModalOpen && (
                <PaidExpenseCreate
                    isOpen={isCreateModalOpen}
                    onClose={onCloseCreateModal}
                    expenseTemplateId={_id}
                />
            )}
            {isDetailsModalOpen && (
                <ExpenseTemplateDetails
                    isOpen={isDetailsModalOpen}
                    onClose={onCloseDetailsModal}
                    expenseTemplateId={_id}
                    householdId={householdId}
                    archived={archived}
                    openCreateModalHandler={openCreateModalHandler}
                />
            )}
            {isEditModalOpen && (
                <ExpenseTemplateEdit
                    isOpen={isEditModalOpen}
                    onClose={onCloseEditModal}
                    expenseTemplateId={_id}
                    householdId={householdId}
                    fetchExpenseTemplates={fetchExpenseTemplates}
                />
            )}
        </>
    );
}
