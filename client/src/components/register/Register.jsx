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
} from "@chakra-ui/react";

import * as authService from '../../services/authService';
import { FaEye, FaEyeSlash } from "react-icons/fa6";
import { Link } from "react-router-dom";
import { useState } from "react";

export default function Register() {
    const [values, setValues] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        repeatPassword: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showRePassword, setShowRePassword] = useState(false);

    const onChange = (e) => {
        setValues((state) => ({
            ...state,
            [e.target.name]: e.target.value,
        }));
    };

    const onSubmit = async (e) => {
        e.preventDefault();

        const newUser = {
            name: values.name,
            email: values.email,
            phone: values.phone,
            password: values.password,
            repeatPassword: values.repeatPassword,
        };
        console.log(newUser);
        const result = await authService.register(newUser);
        console.log(result);


        // try {
        //     const result = await householdService.create(newHousehold);
        //     console.log(result);

        //     addHouseholdToState(result);
        //     onCloseForm();
        // } catch (err) {
        //     //TODO Error notification - toast
        //     console.log(err);
        // }
    };

    const clearFormHandler = () => {
        setValues({
            name: "",
            email: "",
            phone: "",
            password: "",
            repeatPassword: "",
        });
    };

    return (
        <Flex
            minH={"100vh"}
            align={"center"}
            justify={"center"}
            bg={`linear-gradient(135deg, rgba(103,111,157,1) 0%, rgba(135,141,177,1) 25%, rgba(158,162,192,1) 50%, rgba(129,135,174,1) 75%, rgba(103,111,157,1) 100%);`}
        >
            <Stack spacing={6} mx={"auto"} maxW={"xl"} py={12} px={6}>
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

                            <FormControl id="name" isRequired>
                                <FormLabel>Име</FormLabel>
                                <Input
                                    type="text"
                                    name="name"
                                    value={values.name}
                                    onChange={onChange}
                                    placeholder="Име"
                                />
                            </FormControl>
                            <FormControl id="email" isRequired>
                                <FormLabel>Имейл</FormLabel>
                                <Input
                                    type="email"
                                    name="email"
                                    value={values.email}
                                    onChange={onChange}
                                    placeholder="Имейл"
                                />
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
                            <FormControl id="password" isRequired>
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
                            </FormControl>
                            <FormControl id="repeatPassword" isRequired>
                                <FormLabel>Повторете парола</FormLabel>
                                <InputGroup>
                                    <Input
                                        type={
                                            showRePassword ? "text" : "password"
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
                            </FormControl>
                            <Stack spacing={10} pt={4}>
                                <Button
                                    loadingText="Изпращане"
                                    variant="primary"
                                    onClick={onSubmit}
                                >
                                    Регистрация
                                </Button>
                            </Stack>
                            <Stack pt={4}>
                                <Text align={"center"}>
                                    Вече имате профил?{" "}
                                    <ChakraLink as={Link} to={`/vhod`} color={"themePurple.700"}>Вход</ChakraLink>
                                </Text>
                            </Stack>
                        </Stack>
                    </form>
                </Box>
            </Stack>
        </Flex>
    );
}
