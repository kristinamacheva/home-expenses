import { useContext, useEffect, useState } from "react";
import {
    Box,
    Button,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Spinner,
    Stack,
    Heading,
    Badge,
    Text,
    Flex,
    Card,
    Avatar,
    VStack,
    useToast,
} from "@chakra-ui/react";

import * as expenseTemplateService from "../../../../services/expenseTemplateService";
import AuthContext from "../../../../contexts/authContext";
import SplitCard from "./split-card/SplitCard";

export default function ExpenseTemplateDetails({
    isOpen,
    onClose,
    expenseTemplateId,
    householdId,
    archived,
    openCreateModalHandler,
}) {
    const [isLoading, setIsLoading] = useState(true);
    const [expenseTemplateDetails, setExpenseTemplateDetails] = useState({});
    const toast = useToast();
    const { logoutHandler } = useContext(AuthContext);

    useEffect(() => {
        fetchExpenseTemplateDetails();
    }, []);

    const fetchExpenseTemplateDetails = () => {
        setIsLoading(true);

        expenseTemplateService
            .getOne(householdId, expenseTemplateId)
            .then((result) => {
                setExpenseTemplateDetails(result);
                setIsLoading(false);
            })
            .catch((error) => {
                if (error.status === 401) {
                    logoutHandler();
                } else {
                    toast({
                        title: "Грешка.",
                        description:
                            error.message ||
                            "Неуспешно зареждане на детайлите за шаблона.",
                        status: "error",
                        duration: 5000,
                        isClosable: true,
                    });
                    onClose();
                }
            });
    };

    if (isLoading) {
        return <Spinner size="lg" />;
    }

    const onCloseForm = () => {
        onClose();
    };

    return (
        <>
            <Modal isOpen={isOpen} onClose={onCloseForm}>
                <ModalOverlay />
                <ModalContent
                    mx={{ base: "4", md: "0" }}
                    maxW={{ base: "90vw", md: "80vw", lg: "65vw" }}
                >
                    <ModalHeader>Детайли за шаблон</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>
                        <Stack spacing={4}>
                            <Stack>
                                <Heading size="sm">Обща информация</Heading>
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
                                    <Stack
                                        direction="column"
                                        spacing={{ base: "1", md: "0" }}
                                    >
                                        <Stack
                                            justifyContent={{
                                                base: "space-between",
                                                lg: "initial",
                                            }}
                                        >
                                            <Heading as="h3" size="md">
                                                {
                                                    expenseTemplateDetails.templateName
                                                }
                                            </Heading>

                                            {expenseTemplateDetails.title && (
                                                <Text size="sm">
                                                    <Text
                                                        as="span"
                                                        fontWeight="bold"
                                                    >
                                                        Заглавие:
                                                    </Text>{" "}
                                                    {
                                                        expenseTemplateDetails.title
                                                    }
                                                </Text>
                                            )}
                                        </Stack>

                                        <Box display="inline-block">
                                            <Badge
                                                variant="subtle"
                                                background={"themePurple.200"}
                                                color={"themePurple.800"}
                                            >
                                                {
                                                    expenseTemplateDetails.category
                                                }
                                            </Badge>
                                        </Box>
                                    </Stack>
                                    <Stack
                                        direction={{
                                            base: "column",
                                            lg: "row",
                                        }}
                                        alignItems={{ lg: "center" }}
                                        spacing={{ base: "2", lg: "6" }}
                                    >
                                        <Flex
                                            direction="column"
                                            align={{ md: "flex-end" }}
                                        >
                                            <Text
                                                fontSize="xl"
                                                fontWeight="bold"
                                                color="themePurple.800"
                                                mb="-1"
                                            >
                                                {expenseTemplateDetails.amount}{" "}
                                                лв.
                                            </Text>
                                        </Flex>
                                    </Stack>
                                </Card>
                            </Stack>
                            {(expenseTemplateDetails.paidSplitType ||
                                expenseTemplateDetails.owedSplitType ||
                                expenseTemplateDetails.child) && (
                                <Stack>
                                    <Heading size="sm">Разпределение</Heading>
                                    {expenseTemplateDetails.paidSplitType && (
                                        <SplitCard
                                            splitType={
                                                expenseTemplateDetails.paidSplitType
                                            }
                                            splitTypeTitle={"Платено"}
                                            membersArray={
                                                expenseTemplateDetails.paid
                                            }
                                        />
                                    )}
                                    {expenseTemplateDetails.owedSplitType && (
                                        <SplitCard
                                            splitType={
                                                expenseTemplateDetails.owedSplitType
                                            }
                                            splitTypeTitle={"Дължимо"}
                                            membersArray={
                                                expenseTemplateDetails.owed
                                            }
                                        />
                                    )}

                                    {expenseTemplateDetails.child && (
                                        <VStack align="flex-start" spacing={4}>
                                            <Stack
                                                direction={{
                                                    base: "column",
                                                    lg: "row",
                                                }}
                                                alignItems={{
                                                    base: "flex-start",
                                                    md: "center",
                                                }}
                                                pl={4}
                                            >
                                                <Text fontWeight="bold">
                                                    Дете:{" "}
                                                </Text>
                                                <Box
                                                    display="flex"
                                                    alignItems="center"
                                                >
                                                    <Avatar
                                                        size="sm"
                                                        src={
                                                            expenseTemplateDetails
                                                                .child.avatar
                                                        }
                                                        bg={
                                                            expenseTemplateDetails
                                                                .child
                                                                .avatarColor
                                                        }
                                                        mr={2}
                                                    />
                                                    <Text>
                                                        {
                                                            expenseTemplateDetails
                                                                .child.name
                                                        }
                                                    </Text>
                                                </Box>
                                            </Stack>
                                        </VStack>
                                    )}
                                </Stack>
                            )}
                        </Stack>
                    </ModalBody>
                    <ModalFooter mb="3">
                        <Stack
                            width="100%"
                            direction="row"
                            justifyContent="end"
                            mb="3"
                        >
                            <Button
                                variant="primary"
                                mr={3}
                                isDisabled={archived}
                                onClick={openCreateModalHandler}
                            >
                                Създайте разход
                            </Button>
                            <Button mr={3} onClick={onClose}>
                                Затворете
                            </Button>
                        </Stack>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
}
