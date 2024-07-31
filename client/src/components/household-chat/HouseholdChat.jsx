import { Flex, Skeleton, SkeletonCircle, useToast } from "@chakra-ui/react";
import { useContext, useEffect, useRef, useState } from "react";
import * as messageService from "../../services/messageService";
import AuthContext from "../../contexts/authContext";
import styles from "./household-chat.module.css";
import MessageInput from "./message-input/MessageInput.jsx";
import Message from "./message/Message.jsx";
import { useParams } from "react-router-dom";

export default function HouseholdChat() {
    const [loadingMessages, setLoadingMessages] = useState(true);
    const [messages, setMessages] = useState([]);
    const messageEndRef = useRef(null);

    const { householdId } = useParams();

    const { logoutHandler, userId, socket } = useContext(AuthContext);
    const toast = useToast();

    useEffect(() => {
        // Join household chat room
        socket.emit("joinHouseholdChat", { householdId });

        // Listen for new messages
        socket.on("receiveMessage", (message) => {
            setMessages((prevMessages) => [...prevMessages, message]);
        });

        // Cleanup on unmount
        return () => {
            socket.off("receiveMessage");
        };
    }, [householdId, socket]);

    useEffect(() => {
        messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        setLoadingMessages(true);

        messageService
            .getAll(householdId)
            .then((result) => {
                setMessages(result);
                setLoadingMessages(false);
            })
            .catch((error) => {
                if (error.status === 401) {
                    logoutHandler();
                } else {
                    toast({
                        title:
                            error.message ||
                            "Неуспешно зареждане на съобщенията",
                        status: "error",
                        duration: 6000,
                        isClosable: true,
                        position: "bottom",
                    });
                    setLoadingMessages(false);
                }
            });
    }, []);

    const handleMessageSent = (message) => {
        setMessages((prev) => [...prev, message]);
    };

    return (
        <Flex
            flex="70"
            bg={"gray.200"}
            borderRadius={"md"}
            p={2}
            flexDirection={"column"}
            className={styles.chat}
        >
            {/* Display Skeleton while loading chat */}
            <Flex
                flexDir={"column"}
                gap={4}
                my={4}
                p={2}
                height={"400px"}
                overflowY={"auto"}
            >
                {loadingMessages &&
                    [...Array(5)].map((_, i) => (
                        <Flex
                            key={i}
                            gap={2}
                            alignItems={"center"}
                            p={1}
                            borderRadius={"md"}
                            alignSelf={i % 2 === 0 ? "flex-start" : "flex-end"}
                        >
                            {i % 2 === 0 && <SkeletonCircle size={7} />}
                            <Flex flexDir={"column"} gap={2}>
                                <Skeleton h="8px" w="250px" />
                                <Skeleton h="8px" w="250px" />
                                <Skeleton h="8px" w="250px" />
                            </Flex>
                            {i % 2 !== 0 && <SkeletonCircle size={7} />}
                        </Flex>
                    ))}

                {!loadingMessages &&
                    messages.map((message) => (
                        <Flex
                            key={message._id}
                            direction={"column"}
                            ref={
                                messages.length - 1 ===
                                messages.indexOf(message)
                                    ? messageEndRef
                                    : null
                            }
                        >
                            <Message
                                message={message}
                                ownMessage={userId === message.sender._id}
                            />
                        </Flex>
                    ))}
            </Flex>

            <MessageInput handleMessageSent={handleMessageSent} />
        </Flex>
    );
}
