import {
    Avatar,
    Box,
    Button,
    Card,
    Heading,
    Spinner,
    Stack,
    Text,
    Textarea,
    VStack,
    useToast,
} from "@chakra-ui/react";
import { useState } from "react";
import * as paymentService from "../../../../../services/paymentService";

export default function Comments({
    householdId,
    paymentId,
    comments,
    updateComments,
}) {
    const [text, setText] = useState("");
    const toast = useToast();

    const onChange = (e) => {
        let textValue = e.target.value;
        setText(textValue);
    };

    const onSubmit = async (e) => {
        e.preventDefault();

        if (text.trim() === "") {
            toast({
                title: "Грешка.",
                description: "Коментарът не може да бъде празен.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
            return;
        }

        try {
            const updatedComments = await paymentService.addComment(
                householdId,
                paymentId,
                text
            );
            updateComments(updatedComments); // Refresh details after adding a new one
            setText(""); // Clear the textarea after submission

            toast({
                title: "Коментарът е изпратен.",
                description: "Коментарът беше изпратен успешно.",
                status: "success",
                duration: 5000,
                isClosable: true,
            });
        } catch (error) {
            toast({
                title: "Грешка.",
                description: "Възникна грешка при изпращането на коментара.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    return (
        <Stack width="100%">
            <Heading size="sm">Коментари</Heading>
            <VStack spacing={4} width="100%">
                {comments.map((comment) => (
                    <Card
                        key={comment._id}
                        px="4"
                        py="3"
                        mx="0.2em"
                        boxShadow="md"
                        background="white"
                        spacing={{ base: "1", md: "4" }}
                        direction="column"
                        width="99%"
                    >
                        <Box display="flex" alignItems="center">
                            <Avatar
                                size="sm"
                                src={comment.user.avatar}
                                bg={comment.user.avatarColor}
                                mr={2}
                            />
                            <Stack spacing={0}>
                                <Text>{comment.user.name.split(" ")[0]}</Text>
                                <Text fontSize="xs" color="gray.500">
                                    {new Date(comment.createdAt)
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
                            </Stack>
                        </Box>
                        <Text mt="2">{comment.text}</Text>
                    </Card>
                ))}
            </VStack>
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
                width="99%"
            >
                <form onSubmit={onSubmit} style={{ width: "100%" }}>
                    <Stack spacing={4}>
                        <Textarea
                            value={text}
                            onChange={onChange}
                            placeholder="Напишете коментар..."
                            size="sm"
                        />
                        <Button
                            type="submit"
                            variant="primary"
                            size="sm"
                            width="auto"
                            alignSelf="end"
                        >
                            Изпратете
                        </Button>
                    </Stack>
                </form>
            </Card>
        </Stack>
    );
}
