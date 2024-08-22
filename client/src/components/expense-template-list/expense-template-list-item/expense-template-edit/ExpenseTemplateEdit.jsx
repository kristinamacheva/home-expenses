import { useEffect, useState } from "react";
import {
    Avatar,
    Box,
    Button,
    Card,
    Divider,
    FormControl,
    FormLabel,
    Input,
    InputGroup,
    InputRightAddon,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Select,
    Stack,
    Text,
    useToast,
} from "@chakra-ui/react";
import { useContext } from "react";
import AuthContext from "../../../../contexts/authContext";
import * as householdService from "../../../../services/householdService";
import * as categoryService from "../../../../services/categoryService";
import * as expenseTemplateService from "../../../../services/expenseTemplateService";
import Equally from "../../../split-types/Equally";
import Manual from "../../../split-types/Manual";
import Percent from "../../../split-types/Percent";
import CurrentUser from "../../../split-types/CurrentUser";

const initialValues = {
    templateName: "",
    amount: "",
    category: "",
    title: "",
    payersOptionField: "",
    paidSplitTypeField: "",
    owedSplitTypeField: "",
};

export default function ExpenseTemplateEdit({
    isOpen,
    onClose,
    fetchExpenseTemplates,
    expenseTemplateId,
    householdId,
}) {
    const { userId, logoutHandler, name, avatar, avatarColor } =
        useContext(AuthContext);

    const [householdMembers, setHouseholdMembers] = useState([]);
    const [childMembers, setChildMembers] = useState([]);
    const [selectedChild, setSelectedChild] = useState(null);
    const [householdCategories, setHouseholdCategories] = useState([]);
    const [paid, setPaid] = useState([]);
    const [owed, setOwed] = useState([]);

    const [values, setValues] = useState(initialValues);
    const toast = useToast();

    const [errors, setErrors] = useState({
        templateName: "",
        amount: "",
    });

    useEffect(() => {
        fetchAllNonChildMembers();
        fetchCategories();
        fetchExpenseTemplate();
    }, [householdId]);

    const fetchAllNonChildMembers = () => {
        householdService
            .getOneNonChildAndOver18Members(householdId)
            .then((result) => setHouseholdMembers(result))
            .catch((error) => {
                if (error.status === 401) {
                    logoutHandler();
                } else {
                    toast({
                        title:
                            error.message ||
                            "Неуспешно зареждане на членовете на домакинството",
                        status: "error",
                        duration: 6000,
                        isClosable: true,
                        position: "bottom",
                    });
                }
            });
    };

    const fetchCategories = () => {
        categoryService
            .getAll(householdId)
            .then((result) => setHouseholdCategories(result))
            .catch((error) => {
                if (error.status === 401) {
                    logoutHandler();
                } else {
                    toast({
                        title:
                            error.message ||
                            "Неуспешно зареждане на категориите на домакинството",
                        status: "error",
                        duration: 6000,
                        isClosable: true,
                        position: "bottom",
                    });
                }
            });
    };

    const fetchExpenseTemplate = () => {
        expenseTemplateService
            .getEditableFields(householdId, expenseTemplateId)
            .then(async (expenseTemplate) => {
                setValues({
                    templateName: expenseTemplate.templateName,
                    title: expenseTemplate.title,
                    amount: expenseTemplate.amount,
                    category: expenseTemplate.category,
                    payersOptionField:
                        expenseTemplate.paidSplitType === ""
                            ? expenseTemplate.paidSplitType
                            : expenseTemplate.paidSplitType === "Единично"
                            ? "currentUser"
                            : "changedUser",
                    paidSplitTypeField:
                        expenseTemplate.paidSplitType === "Поравно"
                            ? "equally"
                            : expenseTemplate.paidSplitType === "Ръчно"
                            ? "manual"
                            : "",
                    splittingOption:
                        expenseTemplate.owedSplitType === ""
                            ? expenseTemplate.owedSplitType
                            : expenseTemplate.owedSplitType === "Поравно"
                            ? "equally"
                            : expenseTemplate.owedSplitType === "Процентно"
                            ? "percent"
                            : "manual",
                });
                setPaid(expenseTemplate.paid);
                setOwed(expenseTemplate.owed);
                if (expenseTemplate.child) {
                    const childMembersResult =
                        await householdService.getOneChildMembers(householdId);

                    if (childMembersResult.length > 0) {
                        setChildMembers(childMembersResult);
                    } else {
                        toast({
                            title: "Грешка при зареждане на децата",
                            description:
                                "Няма членове с роля Дете в домакинството",
                            status: "error",
                            duration: 6000,
                            isClosable: true,
                            position: "bottom",
                        });
                    }

                    const child = childMembersResult.find(
                        (child) => child._id === expenseTemplate.child
                    );
                    child ? setSelectedChild(child) : setSelectedChild(null);
                } else {
                    setSelectedChild(null);
                }
            })
            .catch((error) => {
                if (error.status === 401) {
                    logoutHandler();
                } else {
                    toast({
                        title:
                            error.message || "Неуспешно зареждане на шаблона",
                        status: "error",
                        duration: 6000,
                        isClosable: true,
                        position: "bottom",
                    });
                }
            });
    };

    const onChange = async (e) => {
        let value = e.target.value;
        setErrors((prevErrors) => ({ ...prevErrors, [e.target.name]: "" }));

        if (e.target.name === "amount") {
            const regex = /^\d*([\,\.]?\d{0,2})?$/;

            if (!regex.test(e.target.value)) {
                // If input does not match the regex, do not update state
                return;
            }

            value = Number(value) || 0;
        }

        if (e.target.name === "category") {
            const selectedCategory = householdCategories.find(
                (cat) => cat._id === value
            );

            if (selectedCategory && selectedCategory.title === "Джобни") {
                try {
                    const childMembersResult =
                        await householdService.getOneChildMembers(householdId);

                    if (childMembersResult.length > 0) {
                        if (
                            childMembersResult.some(
                                (child) => child._id === userId
                            )
                        ) {
                            toast({
                                title: "Грешка при избор на категорията",
                                description:
                                    "Членове с роля Дете не могат да създават шаблони с категория Джобни",
                                status: "error",
                                duration: 6000,
                                isClosable: true,
                                position: "bottom",
                            });

                            value = "";
                            setValues((state) => ({
                                ...state,
                                [e.target.name]: value,
                            }));

                            return;
                        }

                        setChildMembers(childMembersResult);
                    } else {
                        toast({
                            title: "Грешка при зареждане на децата",
                            description:
                                "Няма членове с роля Дете в домакинството",
                            status: "error",
                            duration: 6000,
                            isClosable: true,
                            position: "bottom",
                        });
                        value = "";
                    }
                } catch (error) {
                    if (error.status === 401) {
                        logoutHandler();
                    } else {
                        toast({
                            title: "Грешка при зареждане на децата",
                            description:
                                "Възникна грешка при зареждането на детските членове",
                            status: "error",
                            duration: 6000,
                            isClosable: true,
                            position: "bottom",
                        });
                    }
                }
            } else {
                setChildMembers([]);
                setSelectedChild(null);
            }
        }

        setValues((state) => ({
            ...state,
            [e.target.name]: value,
        }));
    };

    // Function to handle child member selection
    const handleChildSelection = (e) => {
        const selectedChildId = e.target.value;
        const selectedChildObject = childMembers.find(
            (child) => child._id === selectedChildId
        );
        setSelectedChild(selectedChildObject);
    };

    const handlePaidCurrentUpdate = () => {
        setPaid([
            {
                _id: userId,
                sum: values.amount,
                name: name,
                avatar: avatar,
                avatarColor: avatarColor,
            },
        ]);
    };

    const handlePaidEquallyUpdate = (splitEquallyMembers) => {
        setPaid(splitEquallyMembers);
    };

    const handlePaidManualUpdate = (paidManualMembers) => {
        setPaid(paidManualMembers);
    };

    const handleOwedEquallyUpdate = (owedEquallyMembers) => {
        setOwed(owedEquallyMembers);
    };

    const handleOwedPercentUpdate = (owedPercentMembers) => {
        setOwed(owedPercentMembers);
    };

    const handleOwedManualUpdate = (owedManualMembers) => {
        setOwed(owedManualMembers);
    };

    const getCategoryTitleById = (categoryId) => {
        const category = householdCategories.find(
            (cat) => cat._id === categoryId
        );
        return category ? category.title : "";
    };

    const validateForm = (values, paid, owed) => {
        const newErrors = {
            templateName: "",
            amount: "",
        };

        if (!values.templateName.trim()) {
            newErrors.templateName = "Името не може да бъде празно";
        }

        if (
            !values.amount ||
            isNaN(values.amount) ||
            Number(values.amount) <= 0
        ) {
            newErrors.amount = "Сумата трябва да бъде число, по-голямо от 0";
        }

        if (values.payersOptionField) {
            if (
                values.payersOptionField !== "currentUser" &&
                !values.paidSplitTypeField
            ) {
                newErrors.paid =
                    "Методът на разпределение трябва да бъде избран";
            } else if (paid.length === 0) {
                newErrors.paid =
                    "Платците трябва да бъдат определени при избран метод за разпределение";
            } else if (
                values.payersOptionField !== "currentUser" &&
                paid.length < 2
            ) {
                newErrors.paid =
                    "Разходът трябва да се разпредели минимум между двама членове на домакинството";
            }
        }

        if (values.splittingOption) {
            if (owed.length === 0) {
                newErrors.owed =
                    "Дължимите суми трябва да бъдат определени при избран метод за разпределение";
            } else if (owed.length < 2) {
                newErrors.owed =
                    "Разходът трябва да се разпредели минимум между двама членове на домакинството";
            }
        }

        setErrors(newErrors);

        return !Object.values(newErrors).some((error) => error);
    };

    const onSubmit = async (e) => {
        e.preventDefault();

        const isValid = validateForm(values, paid, owed);
        if (!isValid) return;

        let paidSplitType = "";
        if (values.payersOptionField === "currentUser") {
            paidSplitType = "Единично";
        } else if (values.paidSplitTypeField) {
            values.paidSplitTypeField === "equally"
                ? (paidSplitType = "Поравно")
                : (paidSplitType = "Ръчно");
        }

        let owedSplitType = "";
        if (values.splittingOption) {
            owedSplitType =
                values.splittingOption === "equally"
                    ? "Поравно"
                    : values.splittingOption === "percent"
                    ? "Процентно"
                    : "Ръчно";
        }

        // Map the `paid` and `owed` arrays to include only `_id` and `sum`
        let formattedPaid = [];
        if (paid) {
            formattedPaid = paid.map((payer) => ({
                _id: payer._id,
                sum: payer.sum,
            }));
        }

        let formattedOwed = [];

        if (owed) {
            formattedOwed = owed.map((owee) => ({
                _id: owee._id,
                sum: owee.sum,
            }));
        }

        const updatedExpenseTemplate = {
            templateName: values.templateName,
            title: values.title,
            category: values.category,
            amount: values.amount,
            paidSplitType,
            paid: formattedPaid,
            owedSplitType,
            owed: formattedOwed,
        };

        // Include child ID only if category is "Джобни"
        const categoryTitle = getCategoryTitleById(values.category);
        if (categoryTitle === "Джобни" && selectedChild) {
            updatedExpenseTemplate.child = selectedChild._id;
        }

        try {
            await expenseTemplateService.edit(
                householdId,
                expenseTemplateId,
                updatedExpenseTemplate
            );

            toast({
                title: "Шаблонът е редактиран успешно.",
                description: "Успешно редактирахте шаблона.",
                status: "success",
                duration: 5000,
                isClosable: true,
            });

            fetchExpenseTemplates(true);
            onCloseForm();
        } catch (error) {
            if (error.status === 401) {
                logoutHandler();
            } else {
                toast({
                    title: "Грешка.",
                    description:
                        error.message ||
                        "Възникна грешка при редактирането на шаблона",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            }
        }
    };

    const onCloseForm = () => {
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onCloseForm}>
            <ModalOverlay />
            <ModalContent
                mx={{ base: "4", md: "0" }}
                maxW={{ base: "90vw", md: "80vw", lg: "65vw" }}
            >
                <ModalHeader>Редактирайте шаблон</ModalHeader>
                <ModalCloseButton />
                <ModalBody pb={6}>
                    <form onSubmit={onSubmit}>
                        <Stack
                            direction={{ base: "column", lg: "row" }}
                            spacing={{ lg: "4" }}
                        >
                            <FormControl mb={4} isInvalid={errors.templateName}>
                                <FormLabel>Име на шаблон*</FormLabel>
                                <Input
                                    type="text"
                                    name="templateName"
                                    value={values.templateName}
                                    onChange={onChange}
                                    placeholder="Въведете име"
                                />
                                {errors.templateName && (
                                    <Text color="red.500" fontSize="sm">
                                        {errors.templateName}
                                    </Text>
                                )}
                            </FormControl>

                            <FormControl mb={4} isInvalid={errors.title}>
                                <FormLabel>Заглавие на разход</FormLabel>
                                <Input
                                    type="text"
                                    name="title"
                                    value={values.title}
                                    onChange={onChange}
                                    placeholder="Въведете заглавие"
                                />
                                {errors.title && (
                                    <Text color="red.500" fontSize="sm">
                                        {errors.title}
                                    </Text>
                                )}
                            </FormControl>
                        </Stack>
                        <Stack
                            direction={{ base: "column", lg: "row" }}
                            spacing={{ lg: "4" }}
                        >
                            <FormControl mb={4} isInvalid={errors.amount}>
                                <FormLabel>Обща сума*</FormLabel>
                                <InputGroup>
                                    <Input
                                        type="number"
                                        name="amount"
                                        value={values.amount}
                                        onChange={onChange}
                                        placeholder="Въведете обща сума"
                                    />
                                    <InputRightAddon>лв.</InputRightAddon>
                                </InputGroup>
                                {errors.amount && (
                                    <Text color="red.500" fontSize="sm">
                                        {errors.amount}
                                    </Text>
                                )}
                            </FormControl>

                            <FormControl mb={4} isInvalid={errors.category}>
                                <FormLabel>Категория</FormLabel>
                                <Select
                                    name="category"
                                    value={values.category}
                                    onChange={onChange}
                                    placeholder="Изберете категория"
                                >
                                    {householdCategories.map((category) => (
                                        <option
                                            key={category._id}
                                            value={category._id}
                                        >
                                            {category.title}
                                        </option>
                                    ))}
                                </Select>
                            </FormControl>
                        </Stack>
                        <Divider mb="3" />
                        {childMembers.length > 0 && (
                            <Stack
                                direction={{ base: "column", lg: "row" }}
                                spacing={{ lg: "4" }}
                            >
                                <FormControl mb={{ base: 2, md: 4 }}>
                                    <FormLabel>Изберете дете</FormLabel>
                                    <Select
                                        name="childMember"
                                        value={
                                            selectedChild
                                                ? selectedChild._id
                                                : ""
                                        }
                                        onChange={handleChildSelection}
                                        placeholder="Изберете дете"
                                    >
                                        {childMembers.map((child) => (
                                            <option
                                                key={child._id}
                                                value={child._id}
                                            >
                                                {child.email}
                                            </option>
                                        ))}
                                    </Select>
                                    {errors.child && (
                                        <Text color="red.500" fontSize="sm">
                                            {errors.child}
                                        </Text>
                                    )}
                                </FormControl>
                                {selectedChild && (
                                    <Card
                                        mt={4}
                                        mb={{ base: 4, md: 0 }}
                                        p={4}
                                        width="100%"
                                    >
                                        <Stack
                                            direction="row"
                                            align="center"
                                            spacing="4"
                                        >
                                            <Avatar
                                                src={selectedChild.avatar}
                                                bg={selectedChild.avatarColor}
                                            />
                                            <Box>
                                                <Text>
                                                    {selectedChild.name}
                                                </Text>
                                            </Box>
                                        </Stack>
                                    </Card>
                                )}
                            </Stack>
                        )}
                        <Stack spacing="4">
                            <FormControl
                                mb={2}
                                isInvalid={errors.paidSplitType}
                            >
                                <FormLabel>Платец</FormLabel>
                                <Select
                                    name="payersOptionField"
                                    value={values.payersOptionField}
                                    onChange={onChange}
                                    placeholder="Изберете платец"
                                >
                                    <option value="currentUser">
                                        Текущ потребител
                                    </option>
                                    <option value="changedUser">
                                        Други потребители
                                    </option>
                                </Select>
                                {errors.paidSplitType && (
                                    <Text color="red.500" fontSize="sm">
                                        {errors.paidSplitType}
                                    </Text>
                                )}
                            </FormControl>
                            {values.payersOptionField === "currentUser" && (
                                <CurrentUser
                                    amount={values.amount}
                                    onUpdate={handlePaidCurrentUpdate}
                                />
                            )}
                            {values.payersOptionField === "changedUser" && (
                                <Stack>
                                    <Stack>
                                        <FormControl
                                            mb={2}
                                            isInvalid={errors.paid}
                                        >
                                            <FormLabel>
                                                Метод на разпределение (платци)*
                                            </FormLabel>
                                            <Select
                                                name="paidSplitTypeField"
                                                value={
                                                    values.paidSplitTypeField
                                                }
                                                onChange={onChange}
                                                placeholder="Изберете метод"
                                            >
                                                <option value="equally">
                                                    Поравно
                                                </option>
                                                <option value="manual">
                                                    Ръчно
                                                </option>
                                            </Select>
                                            {errors.paid && (
                                                <Text
                                                    color="red.500"
                                                    fontSize="sm"
                                                >
                                                    {errors.paid}
                                                </Text>
                                            )}
                                        </FormControl>
                                    </Stack>
                                    {values.paidSplitTypeField ===
                                        "equally" && (
                                        <Equally
                                            amount={values.amount}
                                            members={householdMembers}
                                            currentMembers={paid}
                                            onUpdate={handlePaidEquallyUpdate}
                                            showCreatorDeleteButton={false}
                                        />
                                    )}
                                    {values.paidSplitTypeField === "manual" && (
                                        <Manual
                                            amount={values.amount}
                                            members={householdMembers}
                                            currentMembers={paid}
                                            onUpdate={handlePaidManualUpdate}
                                            showCreatorDeleteButton={false}
                                        />
                                    )}
                                </Stack>
                            )}
                        </Stack>
                        <Stack mt="3" spacing="4">
                            <FormControl
                                mb={4}
                                isInvalid={errors.owedSplitType}
                            >
                                <FormLabel>Метод на разпределение</FormLabel>
                                <Select
                                    name="splittingOption"
                                    value={values.splittingOption}
                                    onChange={onChange}
                                    placeholder="Изберете метод"
                                >
                                    <option value="equally">Поравно</option>
                                    <option value="percent">Процентно</option>
                                    <option value="manual">Ръчно</option>
                                </Select>
                                {errors.owedSplitType && (
                                    <Text color="red.500" fontSize="sm">
                                        {errors.owedSplitType}
                                    </Text>
                                )}
                                {errors.owed && (
                                    <Text color="red.500" fontSize="sm">
                                        {errors.owed}
                                    </Text>
                                )}
                            </FormControl>
                            {values.splittingOption === "equally" && (
                                <Equally
                                    amount={values.amount}
                                    members={householdMembers}
                                    currentMembers={owed}
                                    onUpdate={handleOwedEquallyUpdate}
                                    showCreatorDeleteButton={true}
                                />
                            )}

                            {values.splittingOption === "percent" && (
                                <Percent
                                    amount={values.amount}
                                    members={householdMembers}
                                    currentMembers={owed}
                                    onUpdate={handleOwedPercentUpdate}
                                    showCreatorDeleteButton={true}
                                />
                            )}

                            {values.splittingOption === "manual" && (
                                <Manual
                                    amount={values.amount}
                                    members={householdMembers}
                                    currentMembers={owed}
                                    onUpdate={handleOwedManualUpdate}
                                    showCreatorDeleteButton={true}
                                />
                            )}
                        </Stack>
                    </form>
                </ModalBody>
                <ModalFooter>
                    <Button variant="primary" mr={3} onClick={onSubmit}>
                        Редактирайте
                    </Button>
                    <Button onClick={onCloseForm}>Отменете</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
