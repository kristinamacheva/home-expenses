import {
    Avatar,
    Flex,
    Image,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalCloseButton,
    ModalBody,
    Skeleton,
    Stack,
    Text,
    useDisclosure,
} from "@chakra-ui/react";
import { useContext, useState } from "react";
import AuthContext from "../../../contexts/authContext";
import PaidExpenseDetails from "../../paid-expense-list/paid-expense-list-item/paid-expense-details/PaidExpenseDetails";
import PaymentDetails from "../../balance-list/payment-list-item/payment-details/PaymentDetails";

export default function Message({ ownMessage, message }) {
    const [imgLoaded, setImgLoaded] = useState(false);
    const [showCreatedAt, setShowCreatedAt] = useState(false);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const {
        isOpen: isPaidExpenseDetailsModalOpen,
        onOpen: onOpenPaidExpenseDetailsModal,
        onClose: onClosePaidExpenseDetailsModal,
    } = useDisclosure();
    const {
        isOpen: isPaymentDetailsModalOpen,
        onOpen: onOpenPaymentDetailsModal,
        onClose: onClosePaymentDetailsModal,
    } = useDisclosure();

    const toggleCreatedAt = () => setShowCreatedAt((prev) => !prev);

    const handleDetailsClick = () => {
        switch (message.resourceType) {
            case "PaidExpense":
                onOpenPaidExpenseDetailsModal();
                break;
            case "Payment":
                onOpenPaymentDetailsModal();
                break;
            default:
                break;
        }
    };

    return (
        <>
            {ownMessage ? (
                <Flex gap={2} alignSelf={"flex-end"}>
                    <Stack direction="column">
                        {message.text && (
                            <div
                                onClick={toggleCreatedAt}
                                style={{ cursor: "pointer" }}
                            >
                                <Text
                                    fontSize={14}
                                    color={"white"}
                                    bg={"themePurple.800"}
                                    maxW={{ base: "350px", md: "450px" }}
                                    px={3}
                                    py={1}
                                    borderRadius={"md"}
                                >
                                    {message.text}
                                </Text>
                                {showCreatedAt && (
                                    <Text
                                        fontSize={12}
                                        color={"gray.500"}
                                        mt={1}
                                    >
                                        {new Date(message.createdAt)
                                            .toLocaleString("bg-BG", {
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })
                                            .replace(" в", "")}{" "}
                                        ч.
                                    </Text>
                                )}
                            </div>
                        )}
                        {message.img && !imgLoaded && (
                            <Flex mt={5} w={"200px"}>
                                <Image
                                    src={message.img}
                                    hidden
                                    onLoad={() => setImgLoaded(true)}
                                    alt="Message image"
                                    borderRadius={4}
                                />
                                <Skeleton w={"200px"} h={"200px"} />
                            </Flex>
                        )}
                        {message.img && imgLoaded && (
                            <Image
                                mt={1}
                                w={{ base: "200px", md: "250px" }}
                                src={message.img}
                                alt="Message image"
                                borderRadius={4}
                                cursor="pointer"
                                onClick={onOpen}
                            />
                        )}
                        {message.resourceType && message.resourceId && (
                            <Text
                                color="blue.500"
                                bg={"themePurple.200"}
                                borderRadius={"md"}
                                onClick={() => handleDetailsClick()}
                                cursor="pointer"
                                py={1}
                                px={2}
                            >
                                #
                                {message.resourceType === "PaidExpense"
                                    ? "Разход"
                                    : "Плащане"}{" "}
                                - {message.resourceId}
                            </Text>
                        )}
                    </Stack>
                    <Avatar
                        src={message.sender.avatar}
                        name={message.sender.name}
                        background={message.sender.avatarColor}
                        size="sm"
                    />
                </Flex>
            ) : (
                <Flex gap={2}>
                    <Avatar
                        src={message.sender.avatar}
                        name={message.sender.name}
                        background={message.sender.avatarColor}
                        size="sm"
                    />
                    <Stack direction="column">
                        {message.text && (
                            <div
                                onClick={toggleCreatedAt}
                                style={{ cursor: "pointer" }}
                            >
                                <Text
                                    maxW={{ base: "350px", md: "450px" }}
                                    bg={"gray.300"}
                                    px={3}
                                    py={1}
                                    fontSize={14}
                                    borderRadius={"md"}
                                    color={"black"}
                                >
                                    {message.text}
                                </Text>
                                {showCreatedAt && (
                                    <Text
                                        fontSize={12}
                                        color={"gray.500"}
                                        mt={1}
                                    >
                                        {new Date(message.createdAt)
                                            .toLocaleString("bg-BG", {
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })
                                            .replace(" в", "")}{" "}
                                        ч.
                                    </Text>
                                )}
                            </div>
                        )}
                        {message.img && !imgLoaded && (
                            <Flex mt={5} w={"200px"}>
                                <Image
                                    src={message.img}
                                    hidden
                                    onLoad={() => setImgLoaded(true)}
                                    alt="Message image"
                                    borderRadius={4}
                                />
                                <Skeleton w={"200px"} h={"200px"} />
                            </Flex>
                        )}
                        {message.img && imgLoaded && (
                            <Image
                                mt={1}
                                w={{ base: "200px", md: "250px" }}
                                src={message.img}
                                alt="Message image"
                                borderRadius={4}
                                cursor="pointer"
                                onClick={onOpen}
                            />
                        )}
                        {message.resourceType && message.resourceId && (
                            <Text
                                color="blue.500"
                                bg={"themePurple.200"}
                                borderRadius={"md"}
                                onClick={() => handleDetailsClick()}
                                cursor="pointer"
                                py={1}
                                px={2}
                            >
                                #
                                {message.resourceType === "PaidExpense"
                                    ? "Разход"
                                    : "Плащане"}{" "}
                                - {message.resourceId}
                            </Text>
                        )}
                    </Stack>
                </Flex>
            )}

            {/* Modal to view full-size image */}
            <Modal isOpen={isOpen} onClose={onClose} size="xl">
                <ModalOverlay />
                <ModalContent maxW="80vw" maxH="80vh">
                    <ModalCloseButton />
                    <ModalBody
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        p={0}
                    >
                        <Image
                            src={message.img}
                            maxH="80vh"
                            maxW="80vw"
                            alt="Full-size message image"
                            objectFit="contain"
                        />
                    </ModalBody>
                </ModalContent>
            </Modal>
            {isPaidExpenseDetailsModalOpen && (
                <PaidExpenseDetails
                    isOpen={isPaidExpenseDetailsModalOpen}
                    onClose={onClosePaidExpenseDetailsModal}
                    paidExpenseId={message.resourceId}
                    householdId={message.household}
                />
            )}
            {isPaymentDetailsModalOpen && (
                <PaymentDetails
                    isOpen={isPaymentDetailsModalOpen}
                    onClose={onClosePaymentDetailsModal}
                    paymentId={message.resourceId}
                    householdId={message.household}
                />
            )}
        </>
    );
}
