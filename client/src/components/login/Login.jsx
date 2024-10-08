import {
    Flex,
    Box,
    FormControl,
    FormLabel,
    Input,
    Stack,
    Button,
    Heading,
    Text,
    Link as ChakraLink,
    useColorModeValue,
    useToast,
    InputGroup,
    Icon,
    InputRightElement,
} from "@chakra-ui/react";
import { useState, useContext } from "react";
import { Link } from "react-router-dom";
import AuthContext from "../../contexts/authContext";
import Path from "../../paths";
import { FaEye, FaEyeSlash } from "react-icons/fa6";

export default function Login() {
    const { loginSubmitHandler } = useContext(AuthContext);
    const [showPassword, setShowPassword] = useState(false);
    const toast = useToast();

    const [values, setValues] = useState({
        email: "",
        password: "",
    });

    const [errors, setErrors] = useState({
        email: "",
        password: "",
    });

    const onChange = (e) => {
        setValues((state) => ({
            ...state,
            [e.target.name]: e.target.value,
        }));
    };

    const validateForm = (currentUser) => {
        const newErrors = {};

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!currentUser.email.trim()) {
            newErrors.email = "Имейлът не може да бъде празен";
        } else if (!emailRegex.test(currentUser.email)) {
            newErrors.email = "Имейлът трябва да бъде валиден";
        }

        if (!currentUser.password.trim()) {
            newErrors.password = "Паролата не може да бъде празна";
        }

        setErrors(newErrors);

        // Return true if there are no errors
        return Object.keys(newErrors).length === 0;
    };

    const onSubmit = async (e) => {
        e.preventDefault();

        setErrors({
            email: "",
            password: "",
        });

        const currentUser = {
            email: values.email,
            password: values.password,
        };

        // Validate form fields based on currentUser
        if (!validateForm(currentUser)) {
            return;
        }

        try {
            await loginSubmitHandler(currentUser);
        } catch (error) {
            toast({
                title: error.message || "Неуспешно вписване в системата",
                status: "error",
                duration: 6000,
                isClosable: true,
                position: "bottom",
            });

            handleErrors(error);
        }
    };

    const handleErrors = (error) => {
        if (error.errors && Array.isArray(error.errors)) {
            const newErrors = {};
            error.errors.forEach((err) => {
                if (err.field) {
                    newErrors[err.field] = err.message;
                }
            });
            setErrors(newErrors);
        }
    };

    return (
        <Flex
            minH={"100vh"}
            align={"center"}
            justify={"center"}
            bg={`linear-gradient(135deg, rgba(103,111,157,1) 0%, rgba(135,141,177,1) 25%, rgba(158,162,192,1) 50%, rgba(129,135,174,1) 75%, rgba(103,111,157,1) 100%);`}
        >
            <Stack spacing={6} mx={"auto"} maxW={"lg"} py={12} px={6}>
                <Stack align={"center"}>
                    <Heading
                        fontSize={"4xl"}
                        color={useColorModeValue("white")}
                    >
                        Домоводител
                    </Heading>
                </Stack>
                <Box
                    rounded={"lg"}
                    bg={useColorModeValue("white")}
                    boxShadow={"lg"}
                    py={12}
                    px={{ base: 10, md: 20 }}
                >
                    <form onSubmit={onSubmit}>
                        <Stack spacing={4}>
                            <Heading fontSize={"2xl"} mb={3} align={"center"}>
                                Влезте в профила си
                            </Heading>
                            <FormControl id="email" isInvalid={!!errors.email}>
                                <FormLabel>Имейл</FormLabel>
                                <Input
                                    type="email"
                                    name="email"
                                    value={values.email}
                                    onChange={onChange}
                                    placeholder="Имейл"
                                />
                                {errors.email && (
                                    <Text color="red.500" fontSize="sm">
                                        {errors.email}
                                    </Text>
                                )}
                            </FormControl>

                            <FormControl
                                id="password"
                                isInvalid={!!errors.password}
                            >
                                <FormLabel>Парола</FormLabel>
                                <InputGroup>
                                    <Input
                                        type={
                                            showPassword ? "text" : "password"
                                        }
                                        name="password"
                                        value={values.password}
                                        onChange={onChange}
                                        placeholder="Парола"
                                    />
                                    <InputRightElement h={"full"}>
                                        <Button
                                            bg="transparent"
                                            variant={"ghost"}
                                            onClick={() =>
                                                setShowPassword(
                                                    (showPassword) =>
                                                        !showPassword
                                                )
                                            }
                                        >
                                            {showPassword ? (
                                                <Icon as={FaEye} boxSize={3} />
                                            ) : (
                                                <Icon
                                                    as={FaEyeSlash}
                                                    boxSize={3}
                                                />
                                            )}
                                        </Button>
                                    </InputRightElement>
                                </InputGroup>
                                {errors.password && (
                                    <Text color="red.500" fontSize="sm">
                                        {errors.password}
                                    </Text>
                                )}
                            </FormControl>
                            <Button
                                variant="primary"
                                spacing={10}
                                onClick={onSubmit}
                            >
                                Вход
                            </Button>
                            <Stack pt={4}>
                                <Text align={"center"}>
                                    Нямате профил?{" "}
                                    <ChakraLink
                                        as={Link}
                                        to={Path.Register}
                                        color={"themePurple.700"}
                                    >
                                        Регистрация
                                    </ChakraLink>
                                </Text>
                            </Stack>
                        </Stack>
                    </form>
                </Box>
            </Stack>
        </Flex>
    );
}
