import {
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
    ModalOverlay,
    useDisclosure,
} from "@chakra-ui/react";
import { useContext, useRef, useState } from "react";
import { IoSendSharp } from "react-icons/io5";
import { BsFillImageFill } from "react-icons/bs";
import useImagePreview from "../../../hooks/useImagePreview";
import AuthContext from "../../../contexts/authContext";
import { useParams } from "react-router-dom";

export default function MessageInput({ isChatDisabled }) {
    const imageRef = useRef(null);
    const [messageText, setMessageText] = useState("");
    const { handleImageChange, imgUrl, setImage } = useImagePreview(true);
    const { socket } = useContext(AuthContext);
    const { onClose } = useDisclosure();

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
            <Flex flex={5} cursor={"pointer"}>
                <BsFillImageFill
                    size={20}
                    onClick={() => imageRef.current.click()}
                    disabled={isChatDisabled} // Disable image upload
                />
                <Input
                    type={"file"}
                    hidden
                    ref={imageRef}
                    onChange={handleImageChange}
                    disabled={isChatDisabled} // Disable file input
                />
            </Flex>
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
        </Flex>
    );
}
