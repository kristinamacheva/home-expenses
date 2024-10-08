import {
    Button,
    FormControl,
    FormLabel,
    Heading,
    Input,
    Stack,
    HStack,
    Avatar,
    Center,
    Card,
    InputGroup,
    InputRightElement,
    Icon,
    useToast,
    Text,
    Checkbox,
} from "@chakra-ui/react";
import { useContext, useState, useEffect, useRef } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa6";
import * as authService from "../../../services/authService";
import AuthContext from "../../../contexts/authContext";
import useImagePreview from "../../../hooks/useImagePreview";
import { isChildUnder14 } from "../../../utils/ageUtils";

const initialValues = {
    name: "",
    email: "",
    phone: "",
    oldPassword: "",
    password: "",
    repeatPassword: "",
    bankDetails: { iban: "", fullName: "" },
};

export default function ProfileEdit() {
    const { updateSubmitHandler, logoutHandler, birthdate } =
        useContext(AuthContext);
    const toast = useToast();

    const [values, setValues] = useState(initialValues);
    const [originalValues, setOriginalValues] = useState({
        avatar: "",
        name: "",
        email: "",
        phone: "",
        avatarColor: "",
        bankDetails: { iban: "", fullName: "" },
    });

    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showRePassword, setShowRePassword] = useState(false);
    const [bankPaymentEnabled, setBankPaymentEnabled] = useState(false);

    const fileRef = useRef(null);
    const { handleImageChange, imgUrl, setImage } = useImagePreview();

    const [errors, setErrors] = useState({
        name: "",
        email: "",
        oldPassword: "",
        password: "",
        repeatPassword: "",
        iban: "",
        fullName: "",
    });

    useEffect(() => {
        authService
            .getProfile()
            .then((result) => {
                setValues((state) => ({
                    ...state,
                    name: result.name,
                    email: result.email,
                    phone: result.phone,
                    bankDetails: result.bankDetails
                        ? {
                              iban: result.bankDetails.iban,
                              fullName: result.bankDetails.fullName,
                          }
                        : {
                              iban: "",
                              fullName: "",
                          },
                }));

                setOriginalValues({
                    avatar: result.avatar,
                    avatarColor: result.avatarColor,
                    name: result.name,
                    email: result.email,
                    phone: result.phone,
                    bankDetails: result.bankDetails
                        ? {
                              iban: result.bankDetails.iban,
                              fullName: result.bankDetails.fullName,
                          }
                        : {
                              iban: "",
                              fullName: "",
                          },
                });

                // Check if bank details exist and set the state accordingly
                if (result.bankDetails?.iban) {
                    setBankPaymentEnabled(true);
                }
            })
            .catch((error) => {
                if (error.status === 401) {
                    logoutHandler();
                } else {
                    toast({
                        title:
                            error.message ||
                            "Неуспешно зареждане на данните на профила",
                        status: "error",
                        duration: 6000,
                        isClosable: true,
                        position: "bottom",
                    });
                }
            });
    }, []);

    const onChange = (e) => {
        const { name, value } = e.target;

        if (name.startsWith("bankDetails.")) {
            const bankDetailKey = name.split(".")[1];
            setValues((state) => ({
                ...state,
                bankDetails: {
                    ...state.bankDetails,
                    [bankDetailKey]: value,
                },
            }));
        } else {
            setValues((state) => ({
                ...state,
                [name]: value,
            }));
        }
    };

    const handleBankPaymentToggle = () => {
        setBankPaymentEnabled((prevState) => {
            if (!prevState) {
                setValues((state) => ({
                    ...state,
                    bankDetails: {
                        iban: originalValues.bankDetails.iban || "",
                        fullName: originalValues.bankDetails.fullName || "",
                    },
                }));
            } else {
                setValues((state) => ({
                    ...state,
                    bankDetails: { iban: "", fullName: "" },
                }));
            }
            return !prevState;
        });
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

        if (!currentUser.oldPassword.trim()) {
            newErrors.oldPassword = "Трябва да въведете старата си парола";
        }

        // Validate password if present
        if (currentUser.password) {
            if (currentUser.password.length < 8) {
                newErrors.password = "Паролата трябва да е поне 8 символа";
            } else if (!/\d/.test(currentUser.password)) {
                newErrors.password =
                    "Паролата трябва да съдържа поне една цифра";
            } else if (!/[a-zA-Z]/.test(currentUser.password)) {
                newErrors.password =
                    "Паролата трябва да съдържа поне една буква";
            } else if (
                !/[!@#$%^&*(),.?":{}|<>\-_]/.test(currentUser.password)
            ) {
                newErrors.password =
                    "Паролата трябва да съдържа поне един специален символ";
            }
        }

        // Validate repeatPassword if present
        if (currentUser.repeatPassword) {
            if (!currentUser.password) {
                newErrors.password = "Трябва да въведете парола";
            } else if (currentUser.repeatPassword !== currentUser.password) {
                newErrors.repeatPassword = "Паролите трябва да съвпадат";
            }
        }

        // Bank details validation if bankPaymentEnabled is true
        if (bankPaymentEnabled) {
            // Full name validation
            if (!currentUser.bankDetails.fullName?.trim()) {
                newErrors.fullName = "Трите имена не могат да бъдат празни";
            } else if (currentUser.bankDetails.fullName.length < 3) {
                newErrors.fullName =
                    "Трите имена трябва да бъдат поне 3 символа";
            }

            // IBAN validation
            const ibanRegex = /^[A-Z]{2}\d{2}[A-Z\d]{11,30}$/;
            if (!currentUser.bankDetails.iban?.trim()) {
                newErrors.iban = "IBAN не може да бъде празен";
            } else if (!ibanRegex.test(currentUser.bankDetails.iban)) {
                newErrors.iban = "Въведеният IBAN не е валиден";
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
            email: "",
            oldPassword: "",
            password: "",
            repeatPassword: "",
            iban: "",
            fullName: "",
        });

        const currentUser = {
            avatar: imgUrl === null ? "" : imgUrl,
            name: values.name,
            email: values.email,
            phone: values.phone,
            oldPassword: values.oldPassword,
            ...(values.password && { password: values.password }),
            ...(values.repeatPassword && {
                repeatPassword: values.repeatPassword,
            }),
            ...(bankPaymentEnabled && {
                bankDetails: {
                    iban: values.bankDetails.iban,
                    fullName: values.bankDetails.fullName,
                },
            }),
        };

        // Validate form fields based on currentUser
        if (!validateForm(currentUser)) {
            return;
        }

        try {
            const updatedUser = await updateSubmitHandler(currentUser);

            toast({
                title: "Успешно редактирахте профила си",
                status: "success",
                duration: 6000,
                isClosable: true,
                position: "bottom",
            });

            setImage(null);

            setOriginalValues({
                avatar: updatedUser.avatar,
                avatarColor: updatedUser.avatarColor,
                name: updatedUser.name,
                email: updatedUser.email,
                phone: updatedUser.phone,
                bankDetails: updatedUser.bankDetails
                    ? {
                          iban: updatedUser.bankDetails.iban,
                          fullName: updatedUser.bankDetails.fullName,
                      }
                    : { iban: "", fullName: "" },
            }); // Update original values on successful update

            setValues((state) => ({
                ...state,
                bankDetails: updatedUser.bankDetails
                    ? {
                          iban: updatedUser.bankDetails.iban,
                          fullName: updatedUser.bankDetails.fullName,
                      }
                    : { iban: "", fullName: "" },
                oldPassword: "",
                password: "",
                repeatPassword: "",
            }));
        } catch (error) {
            if (error.status === 401) {
                logoutHandler();
            } else {
                toast({
                    title: error.message || "Неуспешно редактиране на профила",
                    status: "error",
                    duration: 6000,
                    isClosable: true,
                    position: "bottom",
                });

                setImage(null);

                handleErrors(error);

                setValues({
                    name: originalValues.name,
                    phone: originalValues.phone,
                    email: originalValues.email,
                    bankDetails: originalValues.bankDetails
                        ? {
                              iban: originalValues.bankDetails.iban,
                              fullName: originalValues.bankDetails.fullName,
                          }
                        : { iban: "", fullName: "" },
                    oldPassword: "",
                    password: "",
                    repeatPassword: "",
                }); // Revert to original values on error
            }
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
                                <Avatar
                                    size="xl"
                                    src={
                                        imgUrl === null
                                            ? originalValues.avatar
                                            : imgUrl
                                    }
                                    background={originalValues.avatarColor}
                                />
                                <Input
                                    ml={6}
                                    type="file"
                                    hidden
                                    ref={fileRef}
                                    onChange={handleImageChange}
                                ></Input>
                            </Center>
                            <Center>
                                <Button onClick={() => fileRef.current.click()}>
                                    Сменете снимката
                                </Button>
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
                            {errors.name && (
                                <Text color="red.500" fontSize="sm">
                                    {errors.name}
                                </Text>
                            )}
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
                            {errors.email && (
                                <Text color="red.500" fontSize="sm">
                                    {errors.email}
                                </Text>
                            )}
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
                            {errors.oldPassword && (
                                <Text color="red.500" fontSize="sm">
                                    {errors.oldPassword}
                                </Text>
                            )}
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
                            {errors.password && (
                                <Text color="red.500" fontSize="sm">
                                    {errors.password}
                                </Text>
                            )}
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
                            {errors.repeatPassword && (
                                <Text color="red.500" fontSize="sm">
                                    {errors.repeatPassword}
                                </Text>
                            )}
                        </FormControl>
                    </Stack>
                    {!isChildUnder14(birthdate) && (
                        <FormControl id="bankPayment">
                            <FormLabel>Разплащания</FormLabel>
                            <Checkbox
                                isChecked={bankPaymentEnabled}
                                onChange={handleBankPaymentToggle}
                            >
                                Позволете банкови преводи
                            </Checkbox>
                            {bankPaymentEnabled && (
                                <Stack
                                    direction={{ base: "column", lg: "row" }}
                                    spacing={3}
                                    mt={2}
                                >
                                    <FormControl id="fullName" isRequired>
                                        <FormLabel>Три имена</FormLabel>
                                        <Input
                                            type="text"
                                            name="bankDetails.fullName"
                                            value={values.bankDetails.fullName}
                                            onChange={onChange}
                                            placeholder="Три имена"
                                        />
                                        {errors.fullName && (
                                            <Text color="red.500" fontSize="sm">
                                                {errors.fullName}
                                            </Text>
                                        )}
                                    </FormControl>
                                    <FormControl id="iban" isRequired>
                                        <FormLabel>IBAN</FormLabel>
                                        <Input
                                            type="text"
                                            name="bankDetails.iban"
                                            value={values.bankDetails.iban}
                                            onChange={onChange}
                                            placeholder="IBAN"
                                        />
                                        {errors.iban && (
                                            <Text color="red.500" fontSize="sm">
                                                {errors.iban}
                                            </Text>
                                        )}
                                    </FormControl>
                                </Stack>
                            )}
                        </FormControl>
                    )}
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
