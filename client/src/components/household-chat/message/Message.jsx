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

export default function Message({ ownMessage, message }) {
    const [imgLoaded, setImgLoaded] = useState(false);
    const [showCreatedAt, setShowCreatedAt] = useState(false);
    const { logoutHandler, userId } = useContext(AuthContext);
    const { isOpen, onOpen, onClose } = useDisclosure();

    const toggleCreatedAt = () => setShowCreatedAt((prev) => !prev);

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
        </>
    );
}
