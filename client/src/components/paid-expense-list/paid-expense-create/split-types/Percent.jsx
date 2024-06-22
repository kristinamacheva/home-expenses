import {
    Avatar,
    Card,
    Flex,
    HStack,
    IconButton,
    Input,
    InputGroup,
    InputLeftAddon,
    Stack,
    Text,
} from "@chakra-ui/react";
import { useContext, useEffect, useState } from "react";
import { FaRegTrashCan } from "react-icons/fa6";
import AuthContext from "../../../../contexts/authContext";

export default function Percent({
    amount,
    members,
    onUpdate,
    showCreatorDeleteButton,
}) {
    const { userId } = useContext(AuthContext);
    const [splitPercentMembers, setSplitPercentMembers] = useState([]);
    const [percentAmounts, setPercentAmounts] = useState([]);
    const [percentages, setPercentages] = useState([]);
    const [message, setMessage] = useState("");
    const [messageColor, setMessageColor] = useState("");

    useEffect(() => {
        const updatedMembers = members.map((member) => ({
            _id: member.user._id,
            name: member.user.name,
        }));

        setSplitPercentMembers(updatedMembers);
        if (percentAmounts.length === 0) {
            setPercentAmounts(
                updatedMembers.map((member) => ({
                    _id: member._id,
                    sum: 0,
                }))
            );

            setPercentages(
                updatedMembers.map((member) => ({
                    _id: member._id,
                    percentage: 0,
                }))
            );
        }
    }, []);

    useEffect(() => {
        handleAmountChange(percentages);
    }, [amount, percentages]);

    useEffect(() => {
        handleMessageChange(percentages);
    }, [percentAmounts]);

    const handleMessageChange = (newPercentages) => {
        const totalEnteredPercentage = newPercentages.reduce(
            (acc, member) => acc + Number(member.percentage),
            0
        );

        const difference = totalEnteredPercentage - 100;

        if (totalEnteredPercentage !== 100) {
            setMessageColor("red.400");
            if (difference > 0) {
                setMessage(
                    `Въведохте с ${difference}% повече от общия процент (100%).`
                );
            } else {
                setMessage(
                    `Трябва да въведете още ${Math.abs(
                        difference
                    )}%, за да достигнете 100%.`
                );
            }
        } else {
            setMessageColor("green.400");
            setMessage("Общият процент е 100%.");
        }

        onUpdate(percentAmounts, message);
    };

    const handleAmountChange = (newPercentages) => {
        const totalAmountInCents = amount * 100;

        const updatedAmounts = newPercentages.map((member) => ({
            _id: member._id,
            sum: Number(((member.percentage / 100) * totalAmountInCents) / 100),
        }));
        console.log("updatedAmounts");
        console.log(updatedAmounts);

        setPercentAmounts(updatedAmounts);
    };

    const handleChange = (id, value) => {
        // Restricting input to 2 digits
        const regex = /^\d{0,2}$/;

        if (!regex.test(value)) {
            // If input does not match the regex, do not update state
            return;
        }

        const percentage = Number(value) || 0;

        const newPercentages = percentages.map((entry) =>
            entry._id === id ? { ...entry, percentage: percentage } : entry
        );

        setPercentages(newPercentages);
    };

    const onMemberRemove = (id) => {
        if (splitPercentMembers.length <= 2) {
            return;
        }

        const updatedMembers = splitPercentMembers.filter(
            (member) => member._id !== id
        );
        setSplitPercentMembers(updatedMembers);

        const newPercentages = percentages.filter((entry) => entry._id !== id);
        setPercentages(newPercentages);
    };

    return (
        <Stack>
            <Flex
                wrap={{ base: "nowrap", lg: "wrap" }}
                direction={{ base: "column", lg: "row" }}
                justifyContent="space-between"
            >
                {splitPercentMembers.map((member) => (
                    <Stack
                        key={member._id}
                        width={{ base: "100%", lg: "48%" }}
                        spacing="0.5"
                        mt={2}
                    >
                        <Card
                            key={member._id}
                            p="4"
                            display="flex"
                            direction="row"
                            alignItems="center"
                            justifyContent="space-between"
                            mb={{ base: "2", lg: "3" }}
                        >
                            <Stack
                                display="flex"
                                alignItems="center"
                                direction="row"
                                mr="2"
                            >
                                <Avatar
                                    name={member.name}
                                    background={"themeYellow.900"}
                                    mr="3"
                                />
                                <Text>{member.name}</Text>
                            </Stack>
                            <Stack
                                display="flex"
                                alignItems="center"
                                direction="row"
                            >
                                <Text mr="1">
                                    {(
                                        percentAmounts.find(
                                            (entry) => entry._id === member._id
                                        )?.sum || 0
                                    ).toFixed(2) + " лв."}
                                </Text>
                                <Text>
                                    {percentages.find(
                                        (entry) => entry._id === member._id
                                    )?.percentage || 0}
                                    %
                                </Text>
                                {splitPercentMembers.length > 2 &&
                                    ((member._id !== userId && (
                                        <IconButton
                                            aria-label="Изтрийте"
                                            title="Изтрийте"
                                            icon={
                                                <FaRegTrashCan fontSize="20px" />
                                            }
                                            variant="ghost"
                                            color="themePurple.800"
                                            onClick={() =>
                                                onMemberRemove(member._id)
                                            }
                                        />
                                    )) ||
                                        (member._id === userId &&
                                            showCreatorDeleteButton && (
                                                <IconButton
                                                    aria-label="Изтрийте"
                                                    title="Изтрийте"
                                                    icon={
                                                        <FaRegTrashCan fontSize="20px" />
                                                    }
                                                    variant="ghost"
                                                    color="themePurple.800"
                                                    onClick={() =>
                                                        onMemberRemove(
                                                            member._id
                                                        )
                                                    }
                                                />
                                            )))}
                            </Stack>
                        </Card>
                        <InputGroup>
                            <InputLeftAddon>Процент</InputLeftAddon>
                            <Input
                                type="number"
                                value={
                                    percentages.find(
                                        (entry) => entry._id === member._id
                                    )?.percentage || 0
                                }
                                onChange={(e) =>
                                    handleChange(member._id, e.target.value)
                                }
                            />
                        </InputGroup>
                    </Stack>
                ))}
            </Flex>
            {message && (
                <Text mt="2" color={messageColor}>
                    {message}
                </Text>
            )}
        </Stack>
    );
}
