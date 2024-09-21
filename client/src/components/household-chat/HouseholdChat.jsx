import {
    Flex,
    Skeleton,
    SkeletonCircle,
    useToast,
    Button,
} from "@chakra-ui/react";
import { useContext, useEffect, useRef, useState, useCallback } from "react";
import * as messageService from "../../services/messageService";
import AuthContext from "../../contexts/authContext";
import styles from "./household-chat.module.css";
import MessageInput from "./message-input/MessageInput.jsx";
import Message from "./message/Message.jsx";
import { useParams } from "react-router-dom";

export default function HouseholdChat() {
    const [loadingMessages, setLoadingMessages] = useState(true);
    const [messages, setMessages] = useState([]);
    const [isFetchingOlderMessages, setIsFetchingOlderMessages] =
        useState(false);
    const [hasMoreMessages, setHasMoreMessages] = useState(true);
    const [initialScrollDone, setInitialScrollDone] = useState(false);
    const messageEndRef = useRef(null);
    const [isChatDisabled, setIsChatDisabled] = useState(false);

    const { householdId } = useParams();
    const { logoutHandler, userId, socket } = useContext(AuthContext);
    const toast = useToast();

    useEffect(() => {
        // Join household chat room
        socket.emit("joinHouseholdChat", { householdId });

        // Listen for new messages
        socket.on("receiveMessage", (message) => {
            setMessages((prevMessages) => [...prevMessages, message]);
            messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
        });

        socket.on("chat_error", (error) => {
            toast({
                title: "Грешка",
                description: error,
                status: "error",
                duration: 5000,
                isClosable: true,
            });
            setIsChatDisabled(true);
        });

        // Cleanup on unmount
        return () => {
            socket.off("receiveMessage");
            socket.off("chat_error");
        };
    }, [householdId, socket]);

    useEffect(() => {
        if (messages.length > 0) {
            messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    // useEffect(() => {
    //     if (!initialScrollDone && messages.length > 0) {
    //         messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    //         setInitialScrollDone(true);
    //     }
    // }, [messages, initialScrollDone]);

    useEffect(() => {
        setLoadingMessages(true);
        messageService
            .getAll(householdId)
            .then((result) => {
                setMessages(result);
                setLoadingMessages(false);
                setHasMoreMessages(result.length > 0); // Check if there are more messages to load
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
    }, [householdId, logoutHandler, toast]);

    const fetchOlderMessages = useCallback(async () => {
        if (loadingMessages || isFetchingOlderMessages || !hasMoreMessages)
            return;

        setIsFetchingOlderMessages(true);

        try {
            const lastMessageId = messages[0]?._id;
            const olderMessages = await messageService.getAll(
                householdId,
                lastMessageId
            );

            setMessages((prevMessages) => [...olderMessages, ...prevMessages]);
            setHasMoreMessages(olderMessages.length > 0); // Update if more messages exist
        } catch (error) {
            if (error.status === 401) {
                logoutHandler();
            } else {
                toast({
                    title: "Грешка.",
                    description:
                        error.message ||
                        "Неуспешно зареждане на по-стари съобщения.",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            }
        } finally {
            setIsFetchingOlderMessages(false);
        }
    }, [
        loadingMessages,
        isFetchingOlderMessages,
        hasMoreMessages,
        householdId,
        messages,
    ]);

    return (
        <Flex
            flex="70"
            bg={"gray.200"}
            borderRadius={"md"}
            p={2}
            flexDirection={"column"}
            className={styles.chat}
        >
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

                {!loadingMessages && (
                    <>
                        {hasMoreMessages && (
                            <Button
                                onClick={fetchOlderMessages}
                                isLoading={isFetchingOlderMessages}
                                mb={4}
                                py={1}
                                px={3}
                                alignSelf="center"
                            >
                                Заредете още
                            </Button>
                        )}
                        {messages.map((message) => (
                            <Flex key={message._id} direction={"column"}>
                                <Message
                                    message={message}
                                    ownMessage={userId === message.sender._id}
                                />
                            </Flex>
                        ))}
                    </>
                )}
                <div ref={messageEndRef}></div>
            </Flex>

            <MessageInput isChatDisabled={isChatDisabled} />
        </Flex>
    );
}
