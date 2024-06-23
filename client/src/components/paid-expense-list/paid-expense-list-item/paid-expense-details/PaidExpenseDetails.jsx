import { useEffect, useState } from "react";
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
} from "@chakra-ui/react";

import * as paidExpenseService from "../../../../services/paidExpenseService";

export default function PaidExpenseDetails({
    isOpen,
    onClose,
    paidExpenseId,
    householdId,
    title,
    category,
    amount,
    date,
    balance,
    expenseStatus,
    balanceText,
    badgeColor,
    statusColor,
}) {
    const [isLoading, setIsLoading] = useState(true);
    const [paidExpenseDetails, setPaidExpenseDetails] = useState({});

    useEffect(() => {
        setIsLoading(true);
        paidExpenseService
            .getOneDistributionDetails(householdId, paidExpenseId)
            .then((result) => {
                // setisLoading(false);
                setPaidExpenseDetails(result);
                setIsLoading(false);
            })
            .catch((err) => {
                console.log(err);
                setIsLoading(false);
            });
    }, [paidExpenseId]);

    if (isLoading) {
        return <Spinner size="lg" />;
    }
    console.log(paidExpenseDetails);

    // const onCommentSubmit = (e) => {
    //     e.preventDefault();
    // };

    const onApproveClickHandler = (e) => {};

    const onRejectClickHandler = (e) => {};

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
            avatar: balanceItem.user.avatar, // Add a default avatar URL if not available
            avatarColor: balanceItem.user.avatarColor, // Add a default color if not available
            paidSum: paidItem.sum,
            owedSum: owedItem.sum,
            balanceSum: balanceItem.sum,
            balanceType: balanceItem.type,
        };
    });

    // Extract the single approval status
    const approvalStatus = paidExpenseDetails.userApprovals[0].status;

    // Determine if buttons should be shown
    const showButtons =
        paidExpenseDetails.expenseStatus === "За одобрение" &&
        approvalStatus === "За одобрение";

    return (
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
                                                {expenseStatus}
                                            </Badge>
                                        </Box>
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
                                    <Text color={"gray.500"} fontSize="sm">
                                        {new Date(date).toLocaleDateString(
                                            "bg-BG"
                                        )}
                                    </Text>
                                </Stack>
                                <Stack
                                    direction={{ base: "column", lg: "row" }}
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
                                            {amount} лв.
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
                                                    <Th isNumeric>Баланс</Th>
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
                                                                        mr={2}
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
                                        alignItems="center"
                                        pl={4}
                                    >
                                        <Text fontWeight="bold">
                                            Създател на разхода:{" "}
                                        </Text>
                                        <Box display="flex" alignItems="center">
                                            <Avatar
                                                size="sm"
                                                src={
                                                    paidExpenseDetails.creator
                                                        .avatar
                                                }
                                                bg={
                                                    paidExpenseDetails.creator
                                                        .avatarColor
                                                }
                                                mr={2}
                                            />
                                            <Text>
                                                {
                                                    paidExpenseDetails.creator
                                                        .name
                                                }
                                            </Text>
                                        </Box>
                                    </Stack>
                                </VStack>
                            </Card>
                        </Stack>
                    </Stack>
                </ModalBody>
                <ModalFooter>
                    {showButtons && (
                        <>
                            <Button
                                variant="primary"
                                mr={3}
                                onClick={onApproveClickHandler}
                            >
                                Одобрете
                            </Button>
                            <Button mr={3} onClick={onRejectClickHandler}>
                                Отхвърлете
                            </Button>
                        </>
                    )}
                    {/* <Button variant="secondary" onClick={onCloseForm}>Затворете</Button> */}
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
