import { useState } from "react";
import {
    Button,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Stack,
    useToast,
    Textarea,
} from "@chakra-ui/react";

export default function PaymentReject({
    isOpen,
    onClose,
    onRejectClickHandler,
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
                description:
                    "Трябва да въведете причина за отхвърляне на плащането.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
            return;
        }

        onRejectClickHandler(text);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent
                mx={{ base: "4", md: "0" }}
                maxW={{ base: "80vw", md: "55vw", lg: "40vw" }}
            >
                <ModalHeader pt={8}>Отхвърляне на плащане</ModalHeader>
                <ModalCloseButton />
                <ModalBody pb={2}>
                    <form onSubmit={onSubmit} style={{ width: "100%" }}>
                        <Stack spacing={4} width="100%">
                            <Textarea
                                value={text}
                                onChange={onChange}
                                placeholder="Напишете причина за отхвърляне на плащане..."
                                size="sm"
                                minHeight="150px"
                            />
                        </Stack>
                        <ModalFooter
                            mt={4}
                            mb={2}
                            justifyContent="flex-end"
                            px={0}
                            py={0}
                        >
                            <Button variant="primary" type="submit" size="sm">
                                Отхвърлете
                            </Button>
                            <Button
                                variant="secondary"
                                onClick={onClose}
                                type="button"
                            >
                                Затворете
                            </Button>
                        </ModalFooter>
                    </form>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
}
