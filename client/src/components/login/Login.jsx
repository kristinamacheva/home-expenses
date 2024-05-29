import {
    Flex,
    Box,
    FormControl,
    FormLabel,
    Input,
    Checkbox,
    Stack,
    Button,
    Heading,
    Text,
    Link as ChakraLink,
    useColorModeValue,
} from "@chakra-ui/react";
import { useState } from "react";
import { Link } from "react-router-dom";
import * as authService from "../../services/authService";

export default function Login() {
    const [values, setValues] = useState({
        email: "",
        password: "",
    });

    const onChange = (e) => {
        setValues((state) => ({
            ...state,
            [e.target.name]: e.target.value,
        }));
    };

    const onSubmit = async (e) => {
        e.preventDefault();

        const currentUser = {
            email: values.email,
            password: values.password,
        };

        const result = await authService.login(currentUser);
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
            email: "",
            password: "",
        });
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
                            <FormControl id="email">
                                <FormLabel>Имейл</FormLabel>
                                <Input
                                    type="email"
                                    name="email"
                                    value={values.email}
                                    onChange={onChange}
                                    placeholder="Имейл"
                                />
                            </FormControl>
                            <FormControl id="password">
                                <FormLabel>Парола</FormLabel>
                                <Input
                                    type="password"
                                    name="password"
                                    value={values.password}
                                    onChange={onChange}
                                    placeholder="Парола"
                                />
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
                                        to={`/registraciq`}
                                        color={"themePurple.700"}
                                    >
                                        Регистрация
                                    </ChakraLink>
                                </Text>
                            </Stack>
                            {/* <Stack spacing={10}>
                            <Stack
                                direction={{ base: "column", sm: "row" }}
                                align={"start"}
                                justify={"space-between"}
                            >
                                <Checkbox>Запомни ме</Checkbox>
                                <Text color={"themePurple.700"}>
                                    Забравена парола?
                                </Text>
                            </Stack>
                            <Button variant="primary">
                                Вход
                            </Button>
                        </Stack> */}
                        </Stack>
                    </form>
                </Box>
            </Stack>
        </Flex>
    );
}
