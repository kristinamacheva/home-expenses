import {
    Button,
    Flex,
    FormControl,
    FormLabel,
    Heading,
    Input,
    Stack,
    useColorModeValue,
    HStack,
    Avatar,
    AvatarBadge,
    IconButton,
    Center,
    Card,
    InputGroup,
    InputRightElement,
    Icon,
} from "@chakra-ui/react";
import { useContext, useState, useEffect } from "react";
import { RiCloseFill } from "react-icons/ri";
import { FaEye, FaEyeSlash } from "react-icons/fa6";
import * as authService from "../../../services/authService";
import AuthContext from "../../../contexts/authContext";

const initialValues = {
    avatar: "",
    // currentAvatar: "",
    name: "",
    email: "",
    phone: "",
    oldPassword: "",
    password: "",
    repeatPassword: "",
};

export default function ProfileEdit() {
    const { updateSubmitHandler } = useContext(AuthContext);
    const [values, setValues] = useState(initialValues);
    const [originalValues, setOriginalValues] = useState({
        avatar: "",
        name: "",
        email: "",
        phone: "",
    });

    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showRePassword, setShowRePassword] = useState(false);

    useEffect(() => {
        authService
            .getProfile()
            .then((result) => {
                setValues((state) => ({
                    ...state,
                    avatar: result.avatar,
                    name: result.name,
                    email: result.email,
                    phone: result.phone,
                }));

                setOriginalValues({
                    avatar: result.avatar,
                    name: result.name,
                    email: result.email,
                    phone: result.phone,
                });
            })
            .catch((err) => {
                console.log(err);
            });
    }, []);

    const onChange = (e) => {
        setValues((state) => ({
            ...state,
            [e.target.name]: e.target.value,
        }));
    };

    const onSubmit = async (e) => {
        e.preventDefault();

        const newUser = {
            avatar: values.avatar,
            name: values.name,
            email: values.email,
            phone: values.phone,
            oldPassword: values.oldPassword,
            password: values.password,
            repeatPassword: values.repeatPassword,
        };

        try {
            await updateSubmitHandler(newUser);

            setOriginalValues({
                avatar: values.avatar,
                name: values.name,
                email: values.email,
                phone: values.phone,
            }); // Update original values on successful update

            setValues((state) => ({
                ...state,
                oldPassword: "",
                password: "",
                repeatPassword: "",
            }));
        } catch (error) {
            console.error("Error updating profile:", error);
            setValues({
                ...originalValues,
                oldPassword: "",
                password: "",
                repeatPassword: "",
            }); // Revert to original values on error
        }
    };

    return (
        <form onSubmit={onSubmit}>
            <Stack>
                <Card background="white" p="2" boxShadow="xs">
                    <HStack mx={4} my={2} alignItems="center" flexWrap="wrap">
                        <Heading as="h1" size="lg" color="themePurple.800">
                            Редактиране на профил
                        </Heading>
                    </HStack>
                </Card>
                <Stack
                    spacing={4}
                    bg="white"
                    rounded={"xl"}
                    boxShadow={"lg"}
                    p={6}
                    mt={3}
                >
                    <FormControl id="userName">
                        <FormLabel>Профилна снимка</FormLabel>
                        <Stack direction={["column", "row"]} spacing={6}>
                            <Center>
                                <Avatar size="xl" src={values.avatar}>
                                    {/* <AvatarBadge
                                        as={IconButton}
                                        size="sm"
                                        rounded="full"
                                        top="-10px"
                                        colorScheme="red"
                                        aria-label="remove Image"
                                        icon={<RiCloseFill />}
                                    /> */}
                                </Avatar>
                                <Input ml={6} type="file"></Input>
                            </Center>
                        </Stack>
                    </FormControl>
                    <Stack
                        direction={{ base: "column", lg: "row" }}
                        spacing={3}
                    >
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
                    </Stack>
                    <Stack
                        direction={{ base: "column", lg: "row" }}
                        spacing={3}
                    >
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
                        <FormControl id="oldPassword" isRequired>
                            <FormLabel>Стара парола</FormLabel>
                            <InputGroup>
                                <Input
                                    type={showOldPassword ? "text" : "password"}
                                    name="oldPassword"
                                    value={values.oldPassword}
                                    onChange={onChange}
                                    placeholder="Парола"
                                />
                                <InputRightElement h={"full"}>
                                    <Button
                                        bg="transparent"
                                        variant={"ghost"}
                                        onClick={() =>
                                            setShowOldPassword(
                                                (showOldPassword) =>
                                                    !showOldPassword
                                            )
                                        }
                                    >
                                        {showOldPassword ? (
                                            <Icon as={FaEye} boxSize={3} />
                                        ) : (
                                            <Icon as={FaEyeSlash} boxSize={3} />
                                        )}
                                    </Button>
                                </InputRightElement>
                            </InputGroup>
                        </FormControl>
                    </Stack>
                    <Stack
                        direction={{ base: "column", lg: "row" }}
                        spacing={3}
                    >
                        <FormControl id="password">
                            <FormLabel>Нова парола</FormLabel>
                            <InputGroup>
                                <Input
                                    type={showPassword ? "text" : "password"}
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
                        <FormControl id="repeatPassword">
                            <FormLabel>Повторете парола</FormLabel>
                            <InputGroup>
                                <Input
                                    type={showRePassword ? "text" : "password"}
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
                                            <Icon as={FaEyeSlash} boxSize={3} />
                                        )}
                                    </Button>
                                </InputRightElement>
                            </InputGroup>
                        </FormControl>
                    </Stack>
                    <Stack alignItems="end" mt="2">
                        <Button
                            variant="primary"
                            onClick={onSubmit}
                            width={{ base: "100%", lg: "180px" }}
                        >
                            Редактиране
                        </Button>
                    </Stack>
                </Stack>
            </Stack>
        </form>
    );
}
