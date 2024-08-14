import {
    Button,
    Flex,
    FormControl,
    FormLabel,
    Heading,
    Input,
    Stack,
    Text,
    useToast,
} from "@chakra-ui/react";
import moment from "moment";
import { useContext, useEffect, useState } from "react";
import ExpenseChart from "./expense-chart/ExpenseChart";
import { useParams } from "react-router-dom";
import AuthContext from "../../contexts/authContext";
import * as paidExpenseService from "../../services/paidExpenseService";
import CategoryExpenseChart from "./category-expense-chart/CategoryExpenseChart";
import StatisticsCard from "./statistics-card/StatisticsCard";

const initialSearchValues = {
    startDate: moment().subtract(3, "months").format("YYYY-MM-DD"),
    endDate: moment().format("YYYY-MM-DD"),
};

export default function Statistics() {
    const [searchValues, setSearchValues] = useState(initialSearchValues);
    const [totalAmount, setTotalAmount] = useState("");
    const [count, setCount] = useState("");
    const [totalAmountData, setTotalAmountData] = useState([]);
    const [uncategorizedPercentage, setUncategorizedPercentage] = useState([]);
    const [totalAmountCategoryData, setTotalAmountCategoryData] = useState([]);
    const { logoutHandler } = useContext(AuthContext);
    const { householdId } = useParams();
    const toast = useToast();

    const [errors, setErrors] = useState({
        startDate: "",
        endDate: "",
    });

    useEffect(() => {
        fetchTotalAmountAndCountStats();
        fetchTotalAmountData();
        fetchTotalAmountCategoryData();
    }, []);

    const fetchTotalAmountAndCountStats = async () => {
        try {
            const { totalAmount, count, uncategorizedPercentage } =
                await paidExpenseService.getTotalAmountAndCountStats(
                    householdId,
                    searchValues
                );
            setTotalAmount(totalAmount);
            setCount(count);
            setUncategorizedPercentage(uncategorizedPercentage);
        } catch (error) {
            if (error.status === 401) {
                logoutHandler();
            } else {
                toast({
                    title: "Грешка.",
                    description:
                        "Възникна грешка при зареждането на сумата и броят на разходите",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            }
        }
    };

    const fetchTotalAmountData = async () => {
        try {
            const data = await paidExpenseService.getTotalAmountStats(
                householdId,
                searchValues
            );
            setTotalAmountData(data);
        } catch (error) {
            if (error.status === 401) {
                logoutHandler();
            } else {
                toast({
                    title: "Грешка.",
                    description:
                        "Възникна грешка при зареждането на статистиката за сумата на разхода",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            }
        }
    };

    const fetchTotalAmountCategoryData = async () => {
        try {
            const data = await paidExpenseService.getTotalAmountByCategoryStats(
                householdId,
                searchValues
            );
            setTotalAmountCategoryData(data);
        } catch (error) {
            if (error.status === 401) {
                logoutHandler();
            } else {
                toast({
                    title: "Грешка.",
                    description:
                        "Възникна грешка при зареждането на статистиката за категориите",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            }
        }
    };

    const onChange = (e) => {
        setSearchValues((state) => ({
            ...state,
            [e.target.name]: e.target.value,
        }));
    };

    const validateForm = () => {
        const newErrors = {
            startDate: "",
            endDate: "",
        };

        if (!searchValues.startDate.trim()) {
            newErrors.date = "Началната дата не може да бъде празна";
        }

        if (!searchValues.endDate.trim()) {
            newErrors.date = "Крайната дата не може да бъде празна";
        }

        const startDateMoment = moment(searchValues.startDate, "YYYY-MM-DD");
        const endDateMoment = moment(searchValues.endDate, "YYYY-MM-DD");

        if (startDateMoment.isValid() && endDateMoment.isValid()) {
            if (startDateMoment.isAfter(endDateMoment)) {
                newErrors.startDate =
                    "Началната дата трябва да бъде преди крайната дата";
            }
        }

        setErrors(newErrors);

        return !Object.values(newErrors).some((error) => error);
    };

    const onSubmit = (e) => {
        e.preventDefault();

        const isValid = validateForm();
        if (!isValid) return;

        fetchTotalAmountAndCountStats();
        fetchTotalAmountData();
        fetchTotalAmountCategoryData();
    };

    return (
        <>
            <form onSubmit={onSubmit}>
                <Text fontWeight="bold" fontSize="lg">
                    Период
                </Text>
                <Stack spacing="2" direction={{ base: "column", lg: "row" }}>
                    <FormControl id="startDate" isInvalid={errors.startDate}>
                        <FormLabel>Начална дата</FormLabel>
                        <Input
                            size="md"
                            type="date"
                            name="startDate"
                            value={searchValues.startDate || ""}
                            onChange={onChange}
                        />
                        {errors.startDate && (
                            <Text color="red.500" fontSize="sm">
                                {errors.startDate}
                            </Text>
                        )}
                    </FormControl>

                    <FormControl id="endDate" isInvalid={errors.endDate}>
                        <FormLabel>Крайна дата</FormLabel>
                        <Input
                            size="md"
                            type="date"
                            name="endDate"
                            value={searchValues.endDate || ""}
                            onChange={onChange}
                        />
                        {errors.endDate && (
                            <Text color="red.500" fontSize="sm">
                                {errors.endDate}
                            </Text>
                        )}
                    </FormControl>
                </Stack>
                <Flex justify="flex-end" my="3" mx="1">
                    <Button variant="primary" type="submit">
                        Търсене
                    </Button>
                </Flex>
            </form>
            <Stack>
                <Heading as="h4" size="md" my={2}>
                    Анализ на одобрените разходи за избран период
                </Heading>
                <Flex direction={{ base: "column", md: "row" }} gap={4} mt={6}>
                    <StatisticsCard
                        label="Обща сума на разходите"
                        value={`${totalAmount} лв.`}
                    />
                    <StatisticsCard label="Брой разходи" value={count} />
                    <StatisticsCard
                        label="Процент некатегоризирани разходи"
                        value={`${uncategorizedPercentage}%`}
                    />
                </Flex>
                <ExpenseChart data={totalAmountData} />
                <CategoryExpenseChart data={totalAmountCategoryData} />
            </Stack>
        </>
    );
}
