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
    InputGroup,
    InputRightElement,
    Link as ChakraLink,
    useColorModeValue,
    Icon,
    useToast,
} from "@chakra-ui/react";

import moment from "moment";
import { FaEye, FaEyeSlash } from "react-icons/fa6";
import { Link } from "react-router-dom";
import { useState, useContext } from "react";
import AuthContext from "../../contexts/authContext";

export default function Register() {
    const { registerSubmitHandler } = useContext(AuthContext);
    const toast = useToast();

    const [values, setValues] = useState({
        name: "",
        email: "",
        birthdate: "",
        phone: "",
        password: "",
        repeatPassword: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showRePassword, setShowRePassword] = useState(false);

    const [errors, setErrors] = useState({
        name: "",
        email: "",
        password: "",
        repeatPassword: "",
    });

    const onChange = (e) => {
        setValues((state) => ({
            ...state,
            [e.target.name]: e.target.value,
        }));
    };

    const validateForm = (currentUser) => {
        const newErrors = {};

        if (!currentUser.name.trim()) {
            newErrors.name = "Името не може да бъде празно";
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!currentUser.email.trim()) {
            newErrors.email = "Имейлът не може да бъде празен";
        } else if (!emailRegex.test(currentUser.email)) {
            newErrors.email = "Имейлът трябва да бъде валиден";
        }

        if (!currentUser.password.trim()) {
            newErrors.password = "Паролата не може да бъде празна";
        } else if (currentUser.password.length < 8) {
            newErrors.password = "Паролата трябва да е поне 8 символа";
        } else if (!/\d/.test(currentUser.password)) {
            newErrors.password = "Паролата трябва да съдържа поне една цифра";
        } else if (!/[a-zA-Z]/.test(currentUser.password)) {
            newErrors.password = "Паролата трябва да съдържа поне една буква";
        } else if (!/[!@#$%^&*(),.?":{}|<>\-_]/.test(currentUser.password)) {
            newErrors.password =
                "Паролата трябва да съдържа поне един специален символ";
        }

        if (!currentUser.repeatPassword.trim()) {
            newErrors.repeatPassword =
                "Повторната парола не може да бъде празна";
        } else if (currentUser.repeatPassword !== currentUser.password) {
            newErrors.repeatPassword = "Паролите трябва да съвпадат";
        }

        if (!currentUser.birthdate.trim()) {
            newErrors.birthdate = "Трябва да изберете дата на раждане";
        } else {
            // Age validation
            const today = moment();
            const birthdate = moment(currentUser.birthdate);
            const age = today.diff(birthdate, "years");
            if (age < 6) {
                newErrors.birthdate =
                    "Трябва да сте поне на 6 години, за да се регистрирате";
            }
        }

        setErrors(newErrors);

        // Return true if there are no errors
        return Object.keys(newErrors).length === 0;
    };

    const onSubmit = async (e) => {
        e.preventDefault();

        setErrors({
            name: "",
            birthdate: "",
            email: "",
            password: "",
            repeatPassword: "",
        });

        const currentUser = {
            name: values.name,
            birthdate: values.birthdate,
            email: values.email,
            phone: values.phone,
            password: values.password,
            repeatPassword: values.repeatPassword,
        };

        // Validate form fields based on currentUser
        if (!validateForm(currentUser)) {
            return;
        }

        try {
            await registerSubmitHandler(currentUser);
        } catch (error) {
            toast({
                title: error.message || "Неуспешна регистрация",
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
            <Stack spacing={6} mx={"auto"} maxW={"auto"} py={12} px={6}>
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
                    py={10}
                    px={{ base: 10, md: 20 }}
                >
                    <form onSubmit={onSubmit}>
                        <Stack spacing={4}>
                            <Heading fontSize={"2xl"} mb={3} align={"center"}>
                                Създайте нов профил
                            </Heading>

                            <Stack direction={{ base: "column", md: "row" }} spacing={3}>
                                <FormControl id="name" isRequired>
                                    <FormLabel>Име</FormLabel>
                                    <Input
                                        type="text"
                                        name="name"
                                        value={values.name}
                                        onChange={onChange}
                                        placeholder="Име"
                                    />
                                    {errors.name && (
                                        <Text color="red.500" fontSize="sm">
                                            {errors.name}
                                        </Text>
                                    )}
                                </FormControl>
                                <FormControl id="email" isRequired isInvalid={!!errors.email}>
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
                            </Stack>
                            <Stack direction={{ base: "column", md: "row" }} spacing={3}>
                                <FormControl id="birthdate" isRequired>
                                    <FormLabel>Дата на раждане</FormLabel>
                                    <Input
                                        type="date"
                                        name="birthdate"
                                        value={values.birthdate}
                                        onChange={onChange}
                                        placeholder="Изберете дата на раждане"
                                    />
                                    {errors.birthdate && (
                                        <Text color="red.500" fontSize="sm">
                                            {errors.birthdate}
                                        </Text>
                                    )}
                                </FormControl>
                                <FormControl id="phone">
                                    <FormLabel>Телефон</FormLabel>
                                    <Input
                                        type="phone"
                                        name="phone"
                                        value={values.phone}
                                        onChange={onChange}
                                        placeholder="Телефон"
                                    />
                                </FormControl>
                            </Stack>
                            <Stack direction={{ base: "column", md: "row" }} spacing={3}>
                                <FormControl id="password" isRequired>
                                    <FormLabel>Парола</FormLabel>
                                    <InputGroup>
                                        <Input
                                            type={
                                                showPassword
                                                    ? "text"
                                                    : "password"
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
                                                    <Icon
                                                        as={FaEye}
                                                        boxSize={3}
                                                    />
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
                                <FormControl id="repeatPassword" isRequired>
                                    <FormLabel>Повторете парола</FormLabel>
                                    <InputGroup>
                                        <Input
                                            type={
                                                showRePassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            name="repeatPassword"
                                            value={values.repeatPassword}
                                            onChange={onChange}
                                            placeholder="Повторете парола"
                                        />
                                        <InputRightElement h={"full"}>
                                            <Button
                                                bg="transparent"
                                                variant={"ghost"}
                                                onClick={() =>
                                                    setShowRePassword(
                                                        (showRePassword) =>
                                                            !showRePassword
                                                    )
                                                }
                                            >
                                                {showRePassword ? (
                                                    <Icon
                                                        as={FaEye}
                                                        boxSize={3}
                                                    />
                                                ) : (
                                                    <Icon
                                                        as={FaEyeSlash}
                                                        boxSize={3}
                                                    />
                                                )}
                                            </Button>
                                        </InputRightElement>
                                    </InputGroup>
                                    {errors.repeatPassword && (
                                        <Text color="red.500" fontSize="sm">
                                            {errors.repeatPassword}
                                        </Text>
                                    )}
                                </FormControl>
                            </Stack>
                            <Stack spacing={10} pt={4} margin={{ md: "auto"}}>
                                <Button
                                    loadingText="Изпращане"
                                    variant="primary"
                                    onClick={onSubmit}
                                    width={{ md: "270px"}}
                                >
                                    Регистрация
                                </Button>
                            </Stack>
                            <Stack pt={4}>
                                <Text align={"center"}>
                                    Вече имате профил?{" "}
                                    <ChakraLink
                                        as={Link}
                                        to={`/vhod`}
                                        color={"themePurple.700"}
                                    >
                                        Вход
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
