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
} from "@chakra-ui/react";
import { useContext, useRef, useState } from "react";
import { IoSendSharp } from "react-icons/io5";
import { BsFillImageFill } from "react-icons/bs";
import { FaLink } from "react-icons/fa6";
import useImagePreview from "../../../hooks/useImagePreview";
import AuthContext from "../../../contexts/authContext";
import { useParams } from "react-router-dom";

export default function MessageInput({ isChatDisabled }) {
    const imageRef = useRef(null);
    const [messageText, setMessageText] = useState("");
    const [link, setLink] = useState("");
    const { handleImageChange, imgUrl, setImage } = useImagePreview(true);
    const { socket } = useContext(AuthContext);
    const { onClose } = useDisclosure();
    const {
        isOpen: isSendResourceOpen,
        onOpen: onOpenSendResource,
        onClose: onCloseSendResource,
    } = useDisclosure();
    const toast = useToast();

    const { householdId } = useParams();

    const handleSendMessage = (e) => {
        e.preventDefault();

        if (imgUrl) {
            onClose();
        }

        if (!messageText.trim() && !imgUrl) return;

        const messageData = {
            text: messageText,
            img: imgUrl,
        };

        socket.emit("sendMessage", { householdId, messageData });

        setMessageText("");
        setImage("");
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

        socket.emit("sendMessage", { householdId, messageData });

        toast({
            title: "Ресурсът е изпратен",
            description: "Линкът към ресурса беше изпратен успешно.",
            status: "success",
            duration: 5000,
            isClosable: true,
        });

        onCloseSendResource();
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
