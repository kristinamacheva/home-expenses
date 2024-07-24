import { useContext, useState } from "react";
import {
    Button,
    FormControl,
    FormLabel,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Text,
    Textarea,
    useToast,
} from "@chakra-ui/react";

import * as categoryService from "../../../services/categoryService";
import AuthContext from "../../../contexts/authContext";
import { useParams } from "react-router-dom";

export default function CategoryCreate({ isOpen, onClose, fetchCategories }) {
    const [values, setValues] = useState({
        title: "",
        description: "",
    });
    const [errors, setErrors] = useState({
        title: "",
    });

    const { logoutHandler } = useContext(AuthContext);
    const { householdId } = useParams();

    const toast = useToast();

    const onChange = (e) => {
        setValues((state) => ({
            ...state,
            [e.target.name]: e.target.value,
        }));
    };

    const validateForm = (currentCategory) => {
        const newErrors = {
            title: "",
        };

        if (!currentCategory.title.trim()) {
            newErrors.title = "Заглавието не може да бъде празно";
        }
        setErrors(newErrors);

        // Return true if there are no errors
        return !newErrors.title;
    };

    const onSubmit = async (e) => {
        e.preventDefault();

        setErrors({
            title: "",
        });

        const newCategory = {
            title: values.title,
            description: values.description,
        };

        // Validate form fields
        if (!validateForm(newCategory)) {
            return;
        }

        try {
            await categoryService.create(householdId, newCategory);

            toast({
                title: "Успешно създаване на категория",
                status: "success",
                duration: 6000,
                isClosable: true,
                position: "bottom",
            });

            fetchCategories();
            onClose();
        } catch (error) {
            if (error.status === 401) {
                logoutHandler();
            } else {
                toast({
                    title:
                        error.message || "Неуспешно създаване на категория",
                    status: "error",
                    duration: 6000,
                    isClosable: true,
                    position: "bottom",
                });
            }
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent mx={{ base: "4", md: "0" }}>
                <ModalHeader>Създайте категория</ModalHeader>
                <ModalCloseButton />
                <ModalBody pb={6}>
                    <form onSubmit={onSubmit}>
                        <FormControl mb={4}>
                            <FormLabel>Заглавие</FormLabel>
                            <Input
                                type="text"
                                name="title"
                                value={values.title}
                                onChange={onChange}
                                placeholder="Заглавие"
                            />
                            {errors.title && (
                                <Text color="red.500" fontSize="sm">
                                    {errors.title}
                                </Text>
                            )}
                        </FormControl>
                        <FormControl mb={4}>
                            <FormLabel>Описание</FormLabel>
                            <Textarea 
                                name="description"
                                value={values.description}
                                onChange={onChange}
                                placeholder="Описание..."
                            />
                        </FormControl>
                    </form>
                </ModalBody>
                <ModalFooter>
                    <Button variant="primary" mr={3} onClick={onSubmit}>
                        Създайте
                    </Button>
                    <Button onClick={onClose}>Отменете</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
