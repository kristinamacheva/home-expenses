import { useEffect, useState } from "react";
import {
    Button,
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
import categoriesOptions from "../../../data/categoriesOptions ";
import moment from "moment";
import { useContext } from "react";
import AuthContext from "../../../contexts/authContext";
import * as householdService from "../../../services/householdService";
import * as paidExpenseService from "../../../services/paidExpenseService";
import { useParams } from "react-router-dom";
import Equally from "./split-types/Equally";
import Manual from "./split-types/Manual";
import Percent from "./split-types/Percent";
import CurrentUser from "./split-types/CurrentUser";

const initialValues = {
    title: "",
    amount: "0",
    category: "",
    date: moment().format("YYYY-MM-DD"),
    payersOptionField: "",
    paidSplitTypeField: "",
    owedSplitTypeField: "",
};

export default function PaidExpenseCreate({
    isOpen,
    onClose,
    fetchPaidExpenses,
}) {
    const { userId } = useContext(AuthContext);
    const { householdId } = useParams();
    const { logoutHandler } = useContext(AuthContext);

    const [householdMembers, setHouseholdMembers] = useState([]);
    const [paid, setPaid] = useState([]);
    const [owed, setOwed] = useState([]);

    const [values, setValues] = useState(initialValues);
    const toast = useToast();

    useEffect(() => {
        householdService
            .getOneNonChildMembers(householdId)
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
    }, []);

    // TODO: error?
    const onChange = (e) => {
        let value = e.target.value;
        if (e.target.name === "amount") {
            const regex = /^\d*([\,\.]?\d{0,2})?$/;

            if (!regex.test(e.target.value)) {
                // If input does not match the regex, do not update state
                return;
            }

            value = Number(value) || 0;
        }

        setValues((state) => ({
            ...state,
            [e.target.name]: value,
        }));
    };

    const handlePaidCurrentUpdate = () => {
        setPaid([{ _id: userId, sum: values.amount }]);
    };

    const handlePaidEquallyUpdate = (splitEquallyMembers) => {
        setPaid(splitEquallyMembers);
    };

    const handlePaidManualUpdate = (paidManualMembers, message) => {
        // Filter out users with sum === 0
        const filteredPaidMembers = paidManualMembers.filter(
            (member) => member.sum !== 0
        );

        if (message === "Сборът от сумите е равен на сумата на разхода.") {
            setPaid(filteredPaidMembers);
        } else {
            setPaid([]);
            // TODO: put message in array of errors
            console.log(message);
        }
    };

    const handleOwedEquallyUpdate = (owedEquallyMembers) => {
        setOwed(owedEquallyMembers);
    };

    const handleOwedPercentUpdate = (owedPercentMembers, message) => {
        // Filter out users with sum === 0
        const filteredOwedMembers = owedPercentMembers.filter(
            (member) => member.sum !== 0
        );

        if (message === "Общият процент е 100%.") {
            setOwed(filteredOwedMembers);
        } else {
            setOwed([]);
            // TODO: put message in array of errors
            console.log(message);
        }
    };

    const handleOwedManualUpdate = (owedManualMembers, message) => {
        // Filter out users with sum === 0
        const filteredOwedMembers = owedManualMembers.filter(
            (member) => member.sum !== 0
        );

        if (message === "Сборът от сумите е равен на сумата на разхода.") {
            setOwed(filteredOwedMembers);
        } else {
            setOwed([]);
            // TODO: put message in array of errors
            console.log(message);
        }
    };

    const onSubmit = async (e) => {
        e.preventDefault();

        // TODO: Validate date
        // TODO: Check if the options are selected first
        // ["Единично", "Поравно", "Ръчно"],
        let paidSplitType = "";
        if (values.payersOptionField === "currentUser") {
            console.log(paid);
            paidSplitType = "Единично";
        } else {
            values.paidSplitTypeField === "equally"
                ? (paidSplitType = "Поравно")
                : (paidSplitType = "Ръчно");
        }

        const owedSplitType =
            values.splittingOption === "equally"
                ? "Поравно"
                : values.splittingOption === "percent"
                ? "Процентно"
                : "Ръчно";

        const newPaidExpense = {
            title: values.title,
            // category,
            amount: values.amount,
            date: values.date,
            paidSplitType: paidSplitType,
            paid: paid,
            owedSplitType: owedSplitType,
            owed: owed,
        };

        console.log(newPaidExpense);
        try {
            const result = await paidExpenseService.create(
                householdId,
                newPaidExpense
            );

            toast({
                title: "Разходът е създанен.",
                description: "Успешно създадохте платен разход.",
                status: "success",
                duration: 5000,
                isClosable: true,
            });

            fetchPaidExpenses(true);
            onCloseForm();
        } catch (error) {
            if (error.status === 401) {
                logoutHandler();
            } else {
                toast({
                    title: "Грешка.",
                    description: "Възникна грешка при създаването на разхода",
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

    // TODO: Други потребители, единично опция
    return (
        <Modal isOpen={isOpen} onClose={onCloseForm}>
            <ModalOverlay />
            <ModalContent
                mx={{ base: "4", md: "0" }}
                maxW={{ base: "90vw", md: "80vw", lg: "65vw" }}
            >
                <ModalHeader>Създайте разход</ModalHeader>
                <ModalCloseButton />
                <ModalBody pb={6}>
                    <form onSubmit={onSubmit}>
                        <Stack
                            direction={{ base: "column", lg: "row" }}
                            spacing={{ lg: "4" }}
                        >
                            <FormControl mb={4}>
                                <FormLabel>Заглавие*</FormLabel>
                                <Input
                                    type="text"
                                    name="title"
                                    value={values.title}
                                    onChange={onChange}
                                    placeholder="Въведете заглавие"
                                />
                            </FormControl>

                            <FormControl mb={4}>
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
                            </FormControl>
                        </Stack>
                        <Stack
                            direction={{ base: "column", lg: "row" }}
                            spacing={{ lg: "4" }}
                        >
                            <FormControl mb={4}>
                                <FormLabel>Дата*</FormLabel>
                                <Input
                                    type="date"
                                    name="date"
                                    value={values.date}
                                    onChange={onChange}
                                    placeholder="Изберете дата"
                                />
                            </FormControl>

                            <FormControl mb={4}>
                                <FormLabel>Категория</FormLabel>
                                <Select
                                    name="category"
                                    value={values.category}
                                    onChange={onChange}
                                    placeholder="Изберете категория"
                                >
                                    {categoriesOptions.map(
                                        (categoryGroup, index) => (
                                            <optgroup
                                                label={categoryGroup.category}
                                                key={index}
                                            >
                                                {categoryGroup.items.map(
                                                    (item, i) => (
                                                        <option
                                                            value={item}
                                                            key={`${index}-${i}`}
                                                        >
                                                            {item}
                                                        </option>
                                                    )
                                                )}
                                            </optgroup>
                                        )
                                    )}
                                </Select>
                            </FormControl>
                        </Stack>
                        <Divider />
                        <Stack mt="3" spacing="4">
                            <FormControl mb={2}>
                                <FormLabel>Платец*</FormLabel>
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
                                        <FormControl mb={2}>
                                            <FormLabel>
                                                Метод на разпределяне*
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
                                        </FormControl>
                                    </Stack>
                                    {values.paidSplitTypeField ===
                                        "equally" && (
                                        <Equally
                                            amount={values.amount}
                                            members={householdMembers}
                                            onUpdate={handlePaidEquallyUpdate}
                                            showCreatorDeleteButton={false}
                                        />
                                    )}
                                    {values.paidSplitTypeField === "manual" && (
                                        <Manual
                                            amount={values.amount}
                                            members={householdMembers}
                                            onUpdate={handlePaidManualUpdate}
                                            showCreatorDeleteButton={false}
                                        />
                                    )}
                                </Stack>
                            )}
                        </Stack>
                        <Stack mt="3" spacing="4">
                            <FormControl mb={4}>
                                <FormLabel>Метод на разпределяне*</FormLabel>
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
                            </FormControl>
                            {values.splittingOption === "equally" && (
                                <Equally
                                    amount={values.amount}
                                    members={householdMembers}
                                    onUpdate={handleOwedEquallyUpdate}
                                    showCreatorDeleteButton={true}
                                />
                            )}

                            {values.splittingOption === "percent" && (
                                <Percent
                                    amount={values.amount}
                                    members={householdMembers}
                                    onUpdate={handleOwedPercentUpdate}
                                    showCreatorDeleteButton={true}
                                />
                            )}

                            {values.splittingOption === "manual" && (
                                <Manual
                                    amount={values.amount}
                                    members={householdMembers}
                                    onUpdate={handleOwedManualUpdate}
                                    showCreatorDeleteButton={true}
                                />
                            )}
                        </Stack>
                    </form>
                </ModalBody>
                <ModalFooter>
                    <Button variant="primary" mr={3} onClick={onSubmit}>
                        Създайте
                    </Button>
                    <Button onClick={onCloseForm}>Отменете</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
