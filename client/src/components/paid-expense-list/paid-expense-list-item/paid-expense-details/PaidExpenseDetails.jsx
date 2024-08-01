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
    TableContainer,
    Table,
    Thead,
    Tr,
    Th,
    Tbody,
    Td,
    Avatar,
    VStack,
    useToast,
    useDisclosure,
} from "@chakra-ui/react";

import * as paidExpenseService from "../../../../services/paidExpenseService";
import Comments from "./comments/Comments";
import AuthContext from "../../../../contexts/authContext";
import PaidExpenseReject from "./paid-expense-reject/PaidExpenseReject";

export default function PaidExpenseDetails({
    isOpen,
    onClose,
    paidExpenseId,
    householdId,
    fetchPaidExpenses,
    archived,
}) {
    const [isLoading, setIsLoading] = useState(true);
    const [paidExpenseDetails, setPaidExpenseDetails] = useState({});
    const toast = useToast();
    const { userId, logoutHandler } = useContext(AuthContext);
    const {
        isOpen: isRejectModalOpen,
        onOpen: onOpenRejectModal,
        onClose: onCloseRejectModal,
    } = useDisclosure();

    useEffect(() => {
        fetchPaidExpenseDetails();
    }, []);

    const fetchPaidExpenseDetails = () => {
        setIsLoading(true);

        paidExpenseService
            .getOneDetails(householdId, paidExpenseId)
            .then((result) => {
                setPaidExpenseDetails(result);
                setIsLoading(false);
                console.log(result);
            })
            .catch((error) => {
                if (error.status === 401) {
                    logoutHandler();
                } else {
                    toast({
                        title: "Грешка.",
                        description:
                            error.message ||
                            "Неуспешно зареждане на детайлите за платените разходи.",
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

    const currentUserBalance = paidExpenseDetails.balance?.filter(
        (balanceItem) => balanceItem.user._id === userId
    );

    let balanceText = "";
    let badgeColor = "";

    if (currentUserBalance?.length === 1) {
        if (currentUserBalance[0].type === "+") {
            balanceText = `Дължат Ви ${currentUserBalance[0].sum} лв.`;
            badgeColor = "green";
        } else {
            balanceText = `Дължите ${currentUserBalance[0].sum} лв.`;
            badgeColor = "red";
        }
    } else {
        balanceText = "Не участвате в разхода";
        badgeColor = "gray";
    }

    let statusColor = "";
    if (paidExpenseDetails.expenseStatus === "Одобрен") {
        statusColor = "green";
    } else if (paidExpenseDetails.expenseStatus === "За одобрение") {
        statusColor = "gray";
    } else if (paidExpenseDetails.expenseStatus === "Отхвърлен") {
        statusColor = "red";
    }

    const onApproveClickHandler = () => {
        paidExpenseService
            .accept(householdId, paidExpenseId)
            .then((result) => {
                // Handle the success response
                // console.log("Accepted:", result);
                toast({
                    title: "Разходът е одобрен.",
                    description: "Разходът беше одобрен успешно.",
                    status: "success",
                    duration: 5000,
                    isClosable: true,
                });

                if (fetchPaidExpenses) {
                    fetchPaidExpenses();
                }

                onCloseForm();
            })
            .catch((error) => {
                if (error.status === 401) {
                    logoutHandler();
                } else {
                    toast({
                        title: "Грешка.",
                        description:
                            error.message ||
                            "Възникна грешка при одобрението на разхода",
                        status: "error",
                        duration: 5000,
                        isClosable: true,
                    });
                }
            });
    };

    const onRejectClickHandler = (text) => {
        paidExpenseService
            .reject(householdId, paidExpenseId, text)
            .then((result) => {
                // console.log("Rejected:", result);
                toast({
                    title: "Разходът е отхвърлен.",
                    description: "Разходът беше отхвърлен успешно.",
                    status: "success",
                    duration: 5000,
                    isClosable: true,
                });

                if (fetchPaidExpenses) {
                    fetchPaidExpenses();
                }

                onCloseForm();
            })
            .catch((error) => {
                if (error.status === 401) {
                    logoutHandler();
                } else {
                    toast({
                        title: "Грешка.",
                        description:
                            error.message ||
                            "Възникна грешка при отхвърлянето на разхода",
                        status: "error",
                        duration: 5000,
                        isClosable: true,
                    });
                }
            });
    };

    const updateComments = (updatedComments) => {
        setPaidExpenseDetails((state) => ({
            ...state,
            comments: updatedComments,
        }));
    };

    const onCloseForm = () => {
        onClose();
    };

    const distributionInfo = paidExpenseDetails.balance.map((balanceItem) => {
        const userId = balanceItem.user._id;

        // Find the paid and owed sums for the user
        const paidItem = paidExpenseDetails.paid.find(
            (item) => item.user === userId
        ) || { sum: 0 };
        const owedItem = paidExpenseDetails.owed.find(
            (item) => item.user === userId
        ) || { sum: 0 };

        return {
            _id: userId,
            name: balanceItem.user.name,
            avatar: balanceItem.user.avatar,
            avatarColor: balanceItem.user.avatarColor,
            paidSum: paidItem.sum,
            owedSum: owedItem.sum,
            balanceSum: balanceItem.sum,
            balanceType: balanceItem.type,
        };
    });

    // Extract the single approval status if it exists
    const approvalStatus =
        paidExpenseDetails.userApprovals &&
        paidExpenseDetails.userApprovals.length > 0
            ? paidExpenseDetails.userApprovals[0].status
            : null;

    // Determine if buttons should be shown
    const showButtons =
        paidExpenseDetails.expenseStatus === "За одобрение" &&
        approvalStatus === "За одобрение" &&
        !archived;

    return (
        <>
            <Modal isOpen={isOpen} onClose={onCloseForm}>
                <ModalOverlay />
                <ModalContent
                    mx={{ base: "4", md: "0" }}
                    maxW={{ base: "90vw", md: "80vw", lg: "65vw" }}
                >
                    <ModalHeader>Детайли за разход</ModalHeader>
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
                                            direction="row"
                                            spacing="2"
                                            justifyContent={{
                                                base: "space-between",
                                                lg: "initial",
                                            }}
                                        >
                                            <Heading as="h3" size="md">
                                                {paidExpenseDetails.title}
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
                                                    {
                                                        paidExpenseDetails.expenseStatus
                                                    }
                                                </Badge>
                                            </Box>
                                        </Stack>

                                        <Box display="inline-block">
                                            <Badge
                                                variant="subtle"
                                                background={"themePurple.200"}
                                                color={"themePurple.800"}
                                            >
                                                {
                                                    paidExpenseDetails.category
                                                        .title
                                                }
                                            </Badge>
                                        </Box>
                                        <Text color={"gray.500"} fontSize="sm">
                                            {new Date(
                                                paidExpenseDetails.date
                                            ).toLocaleDateString("bg-BG")}
                                        </Text>
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
                                                {paidExpenseDetails.amount} лв.
                                            </Text>
                                            <Box display="inline-block">
                                                <Badge
                                                    variant="subtle"
                                                    colorScheme={badgeColor}
                                                >
                                                    {balanceText}
                                                </Badge>
                                            </Box>
                                        </Flex>
                                    </Stack>
                                </Card>
                            </Stack>
                            <Stack>
                                <Heading size="sm">Детайли</Heading>
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
                                    <VStack align="flex-start" spacing={4}>
                                        <TableContainer>
                                            <Table size="sm">
                                                <Thead>
                                                    <Tr>
                                                        <Th>Потребител</Th>
                                                        <Th>Платил</Th>
                                                        <Th isNumeric>Дължи</Th>
                                                        <Th isNumeric>
                                                            Баланс
                                                        </Th>
                                                    </Tr>
                                                </Thead>
                                                <Tbody>
                                                    {distributionInfo.map(
                                                        (user) => (
                                                            <Tr key={user._id}>
                                                                <Td>
                                                                    <Box
                                                                        display="flex"
                                                                        alignItems="center"
                                                                    >
                                                                        <Avatar
                                                                            size="sm"
                                                                            src={
                                                                                user.avatar
                                                                            }
                                                                            bg={
                                                                                user.avatarColor
                                                                            }
                                                                            mr={
                                                                                2
                                                                            }
                                                                        />
                                                                        <Text>
                                                                            {
                                                                                user.name.split(
                                                                                    " "
                                                                                )[0]
                                                                            }
                                                                        </Text>
                                                                    </Box>
                                                                </Td>
                                                                <Td textAlign="center">{`${user.paidSum.toFixed(
                                                                    2
                                                                )} лв.`}</Td>
                                                                <Td textAlign="center">{`${user.owedSum.toFixed(
                                                                    2
                                                                )} лв.`}</Td>
                                                                <Td
                                                                    isNumeric
                                                                    color={
                                                                        user.balanceType ===
                                                                        "+"
                                                                            ? "green.500"
                                                                            : "red.500"
                                                                    }
                                                                >
                                                                    {user.balanceType ===
                                                                    "+"
                                                                        ? "+ "
                                                                        : "- "}
                                                                    {`${user.balanceSum.toFixed(
                                                                        2
                                                                    )} лв.`}
                                                                </Td>
                                                            </Tr>
                                                        )
                                                    )}
                                                </Tbody>
                                            </Table>
                                        </TableContainer>
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
                                                Създател на разхода:{" "}
                                            </Text>
                                            <Box
                                                display="flex"
                                                alignItems="center"
                                            >
                                                <Avatar
                                                    size="sm"
                                                    src={
                                                        paidExpenseDetails
                                                            .creator.avatar
                                                    }
                                                    bg={
                                                        paidExpenseDetails
                                                            .creator.avatarColor
                                                    }
                                                    mr={2}
                                                />
                                                <Text>
                                                    {
                                                        paidExpenseDetails
                                                            .creator.name
                                                    }
                                                </Text>
                                            </Box>
                                        </Stack>
                                        {paidExpenseDetails.child && (
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
                                                            paidExpenseDetails
                                                                .child.avatar
                                                        }
                                                        bg={
                                                            paidExpenseDetails
                                                                .child
                                                                .avatarColor
                                                        }
                                                        mr={2}
                                                    />
                                                    <Text>
                                                        {
                                                            paidExpenseDetails
                                                                .child.name
                                                        }
                                                    </Text>
                                                </Box>
                                            </Stack>
                                        )}
                                    </VStack>
                                </Card>
                            </Stack>
                        </Stack>
                    </ModalBody>
                    <ModalFooter mb="3">
                        <Stack direction="column" width="100%">
                            {showButtons && (
                                <Stack
                                    width="100%"
                                    direction="row"
                                    justifyContent="end"
                                    mb="3"
                                >
                                    <Button
                                        variant="primary"
                                        mr={3}
                                        onClick={onApproveClickHandler}
                                    >
                                        Одобрете
                                    </Button>
                                    <Button mr={3} onClick={onOpenRejectModal}>
                                        Отхвърлете
                                    </Button>
                                </Stack>
                            )}
                            <Comments
                                householdId={householdId}
                                paidExpenseId={paidExpenseId}
                                comments={paidExpenseDetails.comments}
                                updateComments={updateComments}
                                archived={archived}
                            />
                        </Stack>
                    </ModalFooter>
                </ModalContent>
            </Modal>
            {isRejectModalOpen && (
                <PaidExpenseReject
                    isOpen={isRejectModalOpen}
                    onClose={onCloseRejectModal}
                    onRejectClickHandler={onRejectClickHandler}
                />
            )}
        </>
    );
}
