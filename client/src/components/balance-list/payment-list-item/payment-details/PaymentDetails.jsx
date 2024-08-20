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
    useToast,
    useDisclosure,
    IconButton,
} from "@chakra-ui/react";

import * as paymentService from "../../../../services/paymentService";
import * as reminderService from "../../../../services/reminderService";
import Comments from "./comments/Comments";
import AuthContext from "../../../../contexts/authContext";
import PaymentReject from "./payment-reject/PaymentReject";
import { FaPaperclip } from "react-icons/fa6";
import BankPaymentDetails from "./bank-payment-details/BankPaymentDetails";

export default function PaymentDetails({
    isOpen,
    onClose,
    paymentId,
    householdId,
    fetchPayments,
    fetchBalances,
    archived,
}) {
    const [isLoading, setIsLoading] = useState(true);
    const [paymentDetails, setPaymentDetails] = useState({});
    const toast = useToast();
    const { userId, logoutHandler, name } = useContext(AuthContext);
    const {
        isOpen: isRejectModalOpen,
        onOpen: onOpenRejectModal,
        onClose: onCloseRejectModal,
    } = useDisclosure();

    useEffect(() => {
        fetchPaymentDetails();
    }, []);

    const fetchPaymentDetails = () => {
        setIsLoading(true);

        paymentService
            .getOneDetails(householdId, paymentId)
            .then((result) => {
                setPaymentDetails(result);
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
                            "Неуспешно зареждане на детайлите за плащанията.",
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

    let statusColor = "";
    if (paymentDetails.paymentStatus === "Одобрен") {
        statusColor = "green";
    } else if (paymentDetails.paymentStatus === "За одобрение") {
        statusColor = "gray";
    } else if (paymentDetails.paymentStatus === "Отхвърлен") {
        statusColor = "red";
    }

    const onApproveClickHandler = () => {
        paymentService
            .accept(householdId, paymentId)
            .then((result) => {
                toast({
                    title: "Плащането е одобрено.",
                    description: "Плащането беше одобрено успешно.",
                    status: "success",
                    duration: 5000,
                    isClosable: true,
                });
                if (fetchBalances) {
                    fetchBalances();
                }
                if (fetchPayments) {
                    fetchPayments();
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
                            "Възникна грешка при одобрението на плащането",
                        status: "error",
                        duration: 5000,
                        isClosable: true,
                    });
                }
            });
    };

    const onRejectClickHandler = (text) => {
        paymentService
            .reject(householdId, paymentId, text)
            .then((result) => {
                toast({
                    title: "Плащането е отхвърлено.",
                    description: "Плащането беше отхвърлено успешно.",
                    status: "success",
                    duration: 5000,
                    isClosable: true,
                });
                if (fetchBalances) {
                    fetchBalances();
                }
                if (fetchPayments) {
                    fetchPayments();
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
                            "Възникна грешка при отхвърлянето на плащането",
                        status: "error",
                        duration: 5000,
                        isClosable: true,
                    });
                }
            });
    };

    const onCreateReminderClickHandler = async () => {
        const newReminder = {
            message: `Имате неодобрено плащане от ${name}.`,
            household: householdId,
            receiver: paymentDetails.payee._id,
            resourceType: "payment",
            resourceId: paymentDetails._id,
        };

        try {
            await reminderService.create(newReminder);

            toast({
                title: "Напомнянето е изпратено.",
                description: "Успешно изпратихте напомняне.",
                status: "success",
                duration: 5000,
                isClosable: true,
            });

            onCloseForm();
        } catch (error) {
            if (error.status === 401) {
                logoutHandler();
            } else {
                toast({
                    title: "Грешка.",
                    description:
                        "Възникна грешка при изпращането на напомнянето",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            }
        }
    };

    const updateComments = (updatedComments) => {
        setPaymentDetails((state) => ({
            ...state,
            comments: updatedComments,
        }));
    };

    const copyLinkHandler = () => {
        const link = `households/${householdId}/payment/${paymentId}`;
        navigator.clipboard
            .writeText(link)
            .then(() => {
                toast({
                    title: "Линкът е копиран.",
                    description: "Линкът към плащането беше копиран.",
                    status: "success",
                    duration: 5000,
                    isClosable: true,
                });
            })
            .catch((error) => {
                toast({
                    title: "Грешка.",
                    description: "Неуспешно копиране на линка.",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            });
    };

    const onCloseForm = () => {
        onClose();
    };

    // Determine if buttons should be shown
    const showButtons =
        paymentDetails.paymentStatus === "За одобрение" &&
        paymentDetails.payee._id === userId &&
        !archived;

    const showReminderButton =
        paymentDetails.paymentStatus === "За одобрение" &&
        paymentDetails.payer._id === userId &&
        !archived;

    const showBankPaymentDetails =
        paymentDetails.bankDetails &&
        (paymentDetails.payee._id === userId ||
            paymentDetails.payer._id === userId);

    return (
        <>
            <Modal isOpen={isOpen} onClose={onCloseForm}>
                <ModalOverlay />
                <ModalContent
                    mx={{ base: "4", md: "0" }}
                    maxW={{ base: "90vw", md: "80vw", lg: "65vw" }}
                >
                    <ModalHeader>Детайли за плащането</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>
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
                                    direction={{
                                        base: "column",
                                        md: "row",
                                    }}
                                    spacing={{ base: "3", md: "5" }}
                                    alignItems={{ md: "center" }}
                                >
                                    <Stack
                                        direction="column"
                                        spacing={{ base: "1", md: "0" }}
                                        mr={{ md: "2" }}
                                    >
                                        <Stack direction="row">
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
                                                        paymentDetails.paymentStatus
                                                    }
                                                </Badge>
                                            </Box>
                                            <IconButton
                                                aria-label="Копирайте"
                                                title="Копирайте"
                                                onClick={copyLinkHandler}
                                                icon={
                                                    <FaPaperclip fontSize="12px" />
                                                }
                                                variant="ghost"
                                                color="themePurple.800"
                                                size="xs"
                                            />
                                        </Stack>
                                        <Box display="inline-block">
                                            <Badge
                                                variant="subtle"
                                                background={"themePurple.200"}
                                                color={"themePurple.800"}
                                            >
                                                {paymentDetails.paymentMethod}
                                            </Badge>
                                        </Box>
                                        <Text color={"gray.500"} fontSize="sm">
                                            {new Date(
                                                paymentDetails.date
                                            ).toLocaleDateString("bg-BG")}
                                        </Text>
                                    </Stack>
                                    <Stack>
                                        <Text fontWeight="bold" mb="-1">
                                            Платец:
                                        </Text>
                                        <Box display="flex" alignItems="center">
                                            <Avatar
                                                size="sm"
                                                src={
                                                    paymentDetails.payer.avatar
                                                }
                                                bg={
                                                    paymentDetails.payer
                                                        .avatarColor
                                                }
                                                mr={2}
                                            />
                                            <Text>
                                                {paymentDetails.payer.name}
                                            </Text>
                                        </Box>
                                    </Stack>
                                    <Stack>
                                        <Text fontWeight="bold" mb="-1">
                                            Получател:
                                        </Text>
                                        <Box display="flex" alignItems="center">
                                            <Avatar
                                                size="sm"
                                                src={
                                                    paymentDetails.payee.avatar
                                                }
                                                bg={
                                                    paymentDetails.payee
                                                        .avatarColor
                                                }
                                                mr={2}
                                            />
                                            <Text>
                                                {paymentDetails.payee.name}
                                            </Text>
                                        </Box>
                                    </Stack>
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
                                        mt={{ base: "2", md: "0" }}
                                    >
                                        <Text
                                            fontSize="xl"
                                            fontWeight="bold"
                                            color="themePurple.800"
                                            mb="-1"
                                        >
                                            {paymentDetails.amount} лв.
                                        </Text>
                                    </Flex>
                                </Stack>
                            </Card>
                        </Stack>
                        {showBankPaymentDetails && (
                            <Stack mt={4}>
                                <Heading size="sm">Детайли за плащане</Heading>
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
                                    <BankPaymentDetails
                                        bankDetails={paymentDetails.bankDetails}
                                        amount={paymentDetails.amount}
                                    />
                                </Card>
                            </Stack>
                        )}
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
                            {showReminderButton && (
                                <Stack
                                    width="100%"
                                    direction="row"
                                    justifyContent="end"
                                    mb="3"
                                >
                                    <Button
                                        variant="primary"
                                        mr={3}
                                        onClick={onCreateReminderClickHandler}
                                    >
                                        Изпратете напомняне
                                    </Button>
                                </Stack>
                            )}
                            <Comments
                                householdId={householdId}
                                paymentId={paymentId}
                                comments={paymentDetails.comments}
                                updateComments={updateComments}
                                archived={archived}
                            />
                        </Stack>
                    </ModalFooter>
                </ModalContent>
            </Modal>
            {isRejectModalOpen && (
                <PaymentReject
                    isOpen={isRejectModalOpen}
                    onClose={onCloseRejectModal}
                    onRejectClickHandler={onRejectClickHandler}
                />
            )}
        </>
    );
}
