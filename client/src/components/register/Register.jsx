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
    Link,
    useColorModeValue,
    Icon,
} from "@chakra-ui/react";

import { FaEye, FaEyeSlash } from "react-icons/fa6";

import { useState } from "react";

export default function Register() {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <Flex
            minH={"100vh"}
            align={"center"}
            justify={"center"}
            bg={`linear-gradient(135deg, rgba(103,111,157,1) 0%, rgba(135,141,177,1) 25%, rgba(158,162,192,1) 50%, rgba(129,135,174,1) 75%, rgba(103,111,157,1) 100%);`}
        >
            <Stack spacing={6} mx={"auto"} maxW={"xl"} py={12} px={6}>
                <Stack align={"center"}>
                    <Heading fontSize={"4xl"} color={useColorModeValue("white")}>Домоводител</Heading>
                </Stack>
                <Box
                    rounded={"lg"}
                    bg={useColorModeValue("white")}
                    boxShadow={"lg"}
                    py={10} 
                    px={{ base: 10, md: 20 }} 
                >
                    <Stack spacing={4}>
                    <Heading fontSize={'2xl'} mb={3} align={"center"}>Създайте нов профил</Heading>
                        <FormControl id="name" isRequired>
                            <FormLabel>Име</FormLabel>
                            <Input type="text" />
                        </FormControl>
                        <FormControl id="email" isRequired>
                            <FormLabel>Имейл</FormLabel>
                            <Input type="email" />
                        </FormControl>
                        <FormControl id="phone">
                            <FormLabel>Телефон</FormLabel>
                            <Input type="phone" />
                        </FormControl>
                        <FormControl id="password" isRequired>
                            <FormLabel>Парола</FormLabel>
                            <InputGroup>
                                <Input
                                    type={showPassword ? "text" : "password"}
                                />
                                <InputRightElement h={"full"}>
                                    <Button
                                        bg="transparent"
                                        variant={"ghost"}
                                        onClick={() =>
                                            setShowPassword(
                                                (showPassword) => !showPassword
                                            )
                                        }
                                    >
                                        {showPassword ? (
                                            <Icon as={FaEye} boxSize={3} />
                                        ) : (
                                            <Icon as={FaEyeSlash} boxSize={3} />
                                        )}
                                    </Button>
                                </InputRightElement>
                            </InputGroup>
                        </FormControl>
                        <Stack spacing={10} pt={4}>
                            <Button
                                loadingText="Изпращане"
                                variant="primary"
                            >
                                Регистрация
                            </Button>
                        </Stack>
                        <Stack pt={4}>
                            <Text align={"center"}>
                                Вече имате профил?{" "}
                                <Link color={"themeBlue.700"}>Вход</Link>
                            </Text>
                        </Stack>
                    </Stack>
                </Box>
            </Stack>
        </Flex>
    );
}
