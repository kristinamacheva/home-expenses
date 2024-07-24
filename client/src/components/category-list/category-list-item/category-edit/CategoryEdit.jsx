import { useContext, useEffect, useState } from "react";
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

import * as categoryService from "../../../../services/categoryService";
import AuthContext from "../../../../contexts/authContext";

export default function CategoryEdit({
    isOpen,
    onClose,
    categoryId,
    householdId,
    fetchCategories,
}) {
    const [values, setValues] = useState({
        title: "",
        description: "",
    });
    const [errors, setErrors] = useState({
        title: "",
    });

    const { logoutHandler } = useContext(AuthContext);
    const toast = useToast();

    useEffect(() => {
        categoryService
            .getOne(householdId, categoryId)
            .then((result) => {
                setValues({
                    title: result.title,
                    description: result.description,
                });
            })
            .catch((error) => {
                if (error.status === 401) {
                    logoutHandler();
                } else {
                    toast({
                        title: "Грешка.",
                        description:
                            error.message ||
                            "Неуспешно зареждане на категорията.",
                        status: "error",
                        duration: 5000,
                        isClosable: true,
                    });
                }
            });
    }, []);

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

        const updatedCategory = {
            title: values.title,
            description: values.description,
        };

        // Validate form fields
        if (!validateForm(updatedCategory)) {
            return;
        }

        try {
            await categoryService.edit(householdId, categoryId, updatedCategory);

            toast({
                title: "Успешно редактиране на категория",
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
                        error.message || "Неуспешно редактиране на категория",
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
                <ModalHeader>Редактирайте категория</ModalHeader>
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
                        Редактирайте
                    </Button>
                    <Button onClick={onClose}>Отменете</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
