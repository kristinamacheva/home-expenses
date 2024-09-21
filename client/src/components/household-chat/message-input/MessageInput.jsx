import {
    Button,
    Flex,
    Image,
    Input,
    InputGroup,
    InputRightElement,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalOverlay,
    useDisclosure,
    Stack,
    IconButton,
    useToast,
    Box,
    List,
    ListItem,
} from "@chakra-ui/react";
import { useContext, useEffect, useRef, useState } from "react";
import { IoSendSharp } from "react-icons/io5";
import { BsFillImageFill } from "react-icons/bs";
import { FaLink } from "react-icons/fa6";
import useImagePreview from "../../../hooks/useImagePreview";
import AuthContext from "../../../contexts/authContext";
import * as householdService from "../../../services/householdService";
import * as messageService from "../../../services/messageService";
import { useParams } from "react-router-dom";

export default function MessageInput({ isChatDisabled }) {
    const imageRef = useRef(null);
    const [messageText, setMessageText] = useState("");
    const [link, setLink] = useState("");
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [showAutocomplete, setShowAutocomplete] = useState(false);
    const [mentionedUsers, setMentionedUsers] = useState([]);
    const { handleImageChange, imgUrl, setImage } = useImagePreview(true);
    const { logoutHandler, userId, socket } = useContext(AuthContext);
    const { onClose } = useDisclosure();
    const {
        isOpen: isSendResourceOpen,
        onOpen: onOpenSendResource,
        onClose: onCloseSendResource,
    } = useDisclosure();
    const toast = useToast();

    const { householdId } = useParams();

    useEffect(() => {
        householdService
            .getOneMembers(householdId)
            .then((result) => {
                // Filter out the current user from the users list
                const filteredUsers = result.filter(
                    (user) => user._id !== userId
                );
                setUsers(filteredUsers);
            })
            .catch((error) => {
                if (error.status === 401) {
                    logoutHandler();
                } else {
                    toast({
                        title:
                            error.message ||
                            "Неуспешно зареждане на потребителите",
                        status: "error",
                        duration: 6000,
                        isClosable: true,
                        position: "bottom",
                    });
                }
            });
    }, [householdId, userId]);

    useEffect(() => {
        const lastIndex = messageText.lastIndexOf("@");
        if (lastIndex !== -1) {
            const query = messageText.slice(lastIndex + 1);
            if (query) {
                setFilteredUsers(
                    users.filter((user) =>
                        user.name.toLowerCase().includes(query.toLowerCase())
                    )
                );
                setShowAutocomplete(true);
            } else {
                setShowAutocomplete(false);
            }
        } else {
            setShowAutocomplete(false);
        }
    }, [messageText, users]);

    const handleSendMessage = async (e) => {
        e.preventDefault();

        if (imgUrl) {
            onClose();
        }

        if (!messageText.trim() && !imgUrl) return;

        const messageData = {
            text: messageText,
            img: imgUrl,
            mentionedUsers: mentionedUsers.map((user) => user._id),
        };

        // socket.emit("sendMessage", { householdId, messageData });
        try {
            await messageService.create(householdId, messageData);

            setMessageText("");
            setImage("");
            setMentionedUsers([]);
        } catch (error) {
            if (error.status === 401) {
                logoutHandler();
            } else {
                toast({
                    title: error.message || "Неуспешно изпращане на съобщение",
                    status: "error",
                    duration: 6000,
                    isClosable: true,
                    position: "bottom",
                });
            }
        }
    };

    const handleOpenSendResource = async () => {
        const clipboardLink = await navigator.clipboard.readText();
        setLink(clipboardLink);
        onOpenSendResource();
    };

    const handleSendResource = async () => {
        if (!link) {
            toast({
                title: "Грешка",
                description: "Няма намерен линк в клипборда.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
            return;
        }

        const parts = link.split("/");
        if (parts.length !== 4 || parts[0] !== "households") {
            toast({
                title: "Грешка",
                description: "Линкът към ресурса е невалиден.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });

            return;
        }
        const resourceType = parts[2];
        const resourceId = parts[3];

        const allowedResourceTypes = ["paidExpense", "payment"];
        if (!allowedResourceTypes.includes(resourceType)) {
            toast({
                title: "Грешка",
                description: "Линкът към ресурса е невалиден.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });

            return;
        }

        const messageData = {
            resourceType,
            resourceId,
        };

        try {
            await messageService.create(householdId, messageData);
        } catch (error) {
            if (error.status === 401) {
                logoutHandler();
            } else {
                toast({
                    title: error.message || "Неуспешно изпращане на съобщение",
                    status: "error",
                    duration: 6000,
                    isClosable: true,
                    position: "bottom",
                });
            }
        }

        // socket.emit("sendMessage", { householdId, messageData });

        toast({
            title: "Ресурсът е изпратен",
            description: "Линкът към ресурса беше изпратен успешно.",
            status: "success",
            duration: 5000,
            isClosable: true,
        });

        onCloseSendResource();
    };

    const handleUserClick = (user) => {
        const lastIndex = messageText.lastIndexOf("@");
        const newText = messageText.slice(0, lastIndex) + `@${user.name} `;
        setMessageText(newText);
        setShowAutocomplete(false);

        // Check if the user is already in the mentionedUsers array
        if (
            !mentionedUsers.some(
                (mentionedUser) => mentionedUser._id === user._id
            )
        ) {
            setMentionedUsers([...mentionedUsers, user]);
        }
    };

    return (
        <Flex gap={2} alignItems={"center"}>
            <form onSubmit={handleSendMessage} style={{ flex: 95 }}>
                <InputGroup>
                    <Input
                        w={"full"}
                        placeholder="Напишете съобщение..."
                        onChange={(e) => setMessageText(e.target.value)}
                        value={messageText}
                        disabled={isChatDisabled} // Disable input
                    />
                    {showAutocomplete && (
                        <Box
                            position="absolute"
                            bg="white"
                            border="1px solid #ccc"
                            borderRadius="md"
                            zIndex="10"
                            bottom="100%"
                            w="100%" // make the Box width the same as the Input width
                            maxH="200px"
                            overflowY="auto"
                        >
                            <List>
                                {filteredUsers.map((user) => (
                                    <ListItem
                                        key={user._id}
                                        onClick={() => handleUserClick(user)}
                                        cursor="pointer"
                                        _hover={{ bg: "gray.100" }}
                                        padding="8px"
                                    >
                                        {user.name}
                                    </ListItem>
                                ))}
                            </List>
                        </Box>
                    )}
                    <InputRightElement
                        onClick={handleSendMessage}
                        cursor={isChatDisabled ? "not-allowed" : "pointer"}
                    >
                        <IoSendSharp />
                    </InputRightElement>
                </InputGroup>
            </form>
            <Stack direction="row" mr={2}>
                <Flex flex={5} cursor={"pointer"}>
                    <IconButton
                        aria-label="Изпратете изображение"
                        title="Изпратете изображение"
                        onClick={() => imageRef.current.click()}
                        icon={<BsFillImageFill fontSize="20px" />}
                        variant="ghost"
                        size="xs"
                        color="themePurple.800"
                        disabled={isChatDisabled}
                    />
                    <Input
                        type={"file"}
                        hidden
                        ref={imageRef}
                        onChange={handleImageChange}
                        disabled={isChatDisabled} // Disable file input
                    />
                </Flex>
                <IconButton
                    aria-label="Изпратете ресурс"
                    title="Изпратете ресурс"
                    onClick={handleOpenSendResource}
                    icon={<FaLink fontSize="20px" />}
                    variant="ghost"
                    size="xs"
                    cursor={"pointer"}
                    color="themePurple.800"
                />
            </Stack>
            <Modal
                isOpen={imgUrl}
                onClose={() => {
                    onClose();
                    setImage("");
                }}
            >
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader></ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Flex mt={5} w={"full"}>
                            <Image src={imgUrl} />
                        </Flex>
                        <Flex justifyContent={"flex-end"} my={2}>
                            <IoSendSharp
                                size={24}
                                cursor={
                                    isChatDisabled ? "not-allowed" : "pointer"
                                }
                                onClick={handleSendMessage}
                            />
                        </Flex>
                    </ModalBody>
                </ModalContent>
            </Modal>
            <Modal isOpen={isSendResourceOpen} onClose={onCloseSendResource}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Изпратете линк към ресурс</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Input type="text" value={link} isReadOnly></Input>
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            onClick={handleSendResource}
                            type="primary"
                            mr={2}
                        >
                            Изпратете
                        </Button>
                        <Button onClick={onCloseSendResource}>Затворете</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Flex>
    );
}
