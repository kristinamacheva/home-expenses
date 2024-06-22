import { useEffect, useState } from "react";
import {
    Avatar,
    Box,
    Button,
    ButtonGroup,
    Card,
    Divider,
    FormControl,
    FormLabel,
    HStack,
    IconButton,
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
} from "@chakra-ui/react";
import categoriesOptions from "../../../data/categoriesOptions ";
import moment from "moment";
import { useContext } from "react";
import AuthContext from "../../../contexts/authContext";
import { FaRegTrashCan } from "react-icons/fa6";
import * as householdService from "../../../services/householdService";
import * as paidExpenseService from "../../../services/paidExpenseService";
import { useParams } from "react-router-dom";
import Equally from "./split-types/Equally";
import Manual from "./split-types/Manual";

const initialValues = {
    title: "",
    amount: "0",
    category: "",
    date: moment().format("YYYY-MM-DD"),
    payersOptionField: "",
    paidSplitTypeField: "",
    owedSplitTypeField: "",
};

export default function PaidExpenseCreate({ isOpen, onClose }) {
    // const newPaidExpense = await paidExpenseManager.create({
    //     title,
    //     category,
    //     // creator: req.user._id,
    //     creator: '664f630fb14becfeb98d2e1f',
    //     amount,
    //     date,
    //     paidSplitType,
    //     paid,
    //     owedSplitType,
    //     owed,
    //     household: req.householdId,
    // });
    const { userId, name } = useContext(AuthContext);
    const { householdId } = useParams();

    const [householdMembers, setHouseholdMembers] = useState([]);
    const [paid, setPaid] = useState([]);
    const [owed, setOwed] = useState([]);

    const [values, setValues] = useState(initialValues);

    useEffect(() => {
        householdService
            .getAllNonChildMembers(householdId)
            .then((result) => setHouseholdMembers(result))
            .catch((err) => {
                console.log(err);
            });
    }, []);

    console.log(householdMembers);

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

    const onSubmit = (e) => {
        e.preventDefault();

        // TODO: Check if the options are selected first
        // ["Единично", "Поравно", "Ръчно"],
        let paidSplitType = "";
        if (values.payersOptionField === "currentUser") {
            setPaid([{ _id: userId, sum: values.amount }]);
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
                ? "Процент"
                : "Ръчно";

        const newPaidExpense = {
            title: values.title,
            amount: values.amount,
            date: values.date,
            paidSplitType: paidSplitType,
            paid: paid,
            owedSplitType: owedSplitType,
            owed: owed,
        };

        console.log(newPaidExpense);
        paidExpenseService.create(householdId, newPaidExpense);
    };

    // const clearFormHandler = () => {
    //     setValues(initialValues);
    // };

    const onCloseForm = () => {
        // clearFormHandler();
        onClose();
    };

    const handlePaidEquallyUpdate = (splitEquallyMembers) => {
        setPaid(splitEquallyMembers);
    };

    const handlePaidManualUpdate = (paidManualMembers, message) => {
        if (message === "Сборът от сумите е равен на сумата на разхода.") {
            setPaid(paidManualMembers);
        }
    };

    const handleOwedEquallyUpdate = (owedEquallyMembers) => {
        setOwed(owedEquallyMembers);
    };

    const handleOwedManualUpdate = (owedManualMembers, message) => {
        if (message === "Сборът от сумите е равен на сумата на разхода.") {
            setOwed(owedManualMembers);
        }
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
                                <Card
                                    p="4"
                                    width="47%"
                                    display="flex"
                                    direction="row"
                                    alignItems="center"
                                    justifyContent="space-between"
                                >
                                    <Stack
                                        display="flex"
                                        alignItems="center"
                                        direction="row"
                                        mr="2"
                                    >
                                        <Avatar
                                            name={name}
                                            // src={avatar || ""}
                                            background={"themeYellow.900"}
                                            mr="3"
                                        />
                                        <Text>{name}</Text>
                                    </Stack>
                                    <Stack
                                        display="flex"
                                        alignItems="center"
                                        direction="row"
                                    >
                                        <Text mr="1">{((values.amount * 100) / 100).toFixed(2)} лв.</Text>
                                    </Stack>
                                </Card>
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
                                    <option value="percent">Процент</option>
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
                                <Text>Процент</Text>
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
