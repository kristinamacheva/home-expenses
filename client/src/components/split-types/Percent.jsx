import {
    Avatar,
    Card,
    Flex,
    HStack,
    IconButton,
    Input,
    InputGroup,
    InputLeftAddon,
    Select,
    Stack,
    Text,
    useToast,
} from "@chakra-ui/react";
import { useContext, useEffect, useState } from "react";
import { FaRegTrashCan } from "react-icons/fa6";
import AuthContext from "../../contexts/authContext";
import { IoPersonAddSharp } from "react-icons/io5";

const calculatePercentages = (amount, filteredMembers) => {
    // Ensure amount is a number. If amount is an empty string, treat it as 0.
    const validAmount = Number(amount) || 0;

    return filteredMembers.map((member) => {
        const percentage =
            validAmount !== 0 ? (member.sum / validAmount) * 100 : 0;

        return {
            _id: member._id,
            name: member.name,
            avatar: member.avatar,
            avatarColor: member.avatarColor,
            percentage: Math.round(percentage), // Round to the nearest whole number
            role: member.role,
        };
    });
};

const filterMembers = (currentMembers, childrenIncluded) => {
    return childrenIncluded
        ? currentMembers
        : currentMembers.filter((member) => member.role !== "Дете");
};

export default function Percent({
    amount,
    members,
    currentMembers,
    onUpdate,
    showCreatorDeleteButton,
    childrenIncluded,
}) {
    const { userId } = useContext(AuthContext);
    const [filteredMembers, setFilteredMembers] = useState(
        filterMembers(currentMembers, childrenIncluded)
    );
    const [splitPercentMembers, setSplitPercentMembers] =
        useState(filteredMembers);
    const [percentAmounts, setPercentAmounts] = useState(filteredMembers);
    const [percentages, setPercentages] = useState(
        calculatePercentages(amount, filteredMembers)
    );
    const [message, setMessage] = useState("");
    const [messageColor, setMessageColor] = useState("");
    const [selectedMemberId, setSelectedMemberId] = useState("");
    const toast = useToast();

    useEffect(() => {
        const filteredSplitPercentMembers = childrenIncluded
            ? splitPercentMembers
            : splitPercentMembers.filter((member) => member.role !== "Дете");

        const filteredPercentages = childrenIncluded
            ? percentages
            : percentages.filter((member) => member.role !== "Дете");

        setSplitPercentMembers(filteredSplitPercentMembers);
        setPercentages(filteredPercentages);
    }, [childrenIncluded]);

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

        let message = "";
        const difference = totalEnteredPercentage - 100;

        if (totalEnteredPercentage === 0) {
            setMessage("Процентите не могат да бъдат нула.");
            setMessageColor("red.400");
        } else if (totalEnteredPercentage !== 100) {
            setMessageColor("red.400");
            if (difference > 0) {
                message = `Въведохте с ${difference}% повече от общия процент (100%).`;
                setMessage(message);
            } else {
                message = `Трябва да въведете още ${Math.abs(
                    difference
                )}%, за да достигнете 100%.`;
                setMessage(message);
            }
        } else {
            message = "Общият процент е 100%.";
            setMessageColor("green.400");
            setMessage(message);
        }

        onUpdate(percentAmounts, message);
    };

    const handleAmountChange = (newPercentages) => {
        const totalAmountInCents = amount * 100;

        // Calculate totalEnteredPercentage before the map loop
        const totalEnteredPercentage = newPercentages.reduce(
            (acc, member) => acc + Number(member.percentage),
            0
        );

        let totalSum = 0;
        const updatedAmounts = newPercentages.map((member, index, arr) => {
            const sum = ((member.percentage / 100) * totalAmountInCents) / 100;
            const roundedSum = Number(sum.toFixed(2));
            totalSum += roundedSum;

            // Apply adjustment only if the total percentage is exactly 100% and it's the last member
            if (index === arr.length - 1 && totalEnteredPercentage === 100) {
                 // Convert totalSum to cents for adjustment
const adjustment = totalAmountInCents - totalSum * 100;
                return {
                    _id: member._id,
                    name: member.name,
                    avatar: member.avatar,
                    avatarColor: member.avatarColor,
                    sum: Number((roundedSum + adjustment / 100).toFixed(2)), // Apply adjustment if needed
                    role: member.role,
                };
            }

            return {
                _id: member._id,
                name: member.name,
                avatar: member.avatar,
                avatarColor: member.avatarColor,
                sum: roundedSum,
                role: member.role,
            };
        });

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

        const totalEnteredPercentage = newPercentages.reduce(
            (acc, member) => acc + Number(member.percentage),
            0
        );

        if (totalEnteredPercentage > 100) {
            setMessage("Процентите не могат да надвишават 100%.");
            setMessageColor("red.400");
            return;
        } else {
            setMessage(""); // Clear message if percentages are valid
        }

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

    const handleAddMember = () => {
        if (selectedMemberId) {
            const memberToAdd = members.find(
                (member) => member._id === selectedMemberId
            );
            if (memberToAdd) {
                if (memberToAdd.role === "Дете" && !childrenIncluded) {
                    toast({
                        title: "Грешка",
                        description:
                            "Членове с роля Дете не могат да участват в разходи с категория Джобни",
                        status: "error",
                        duration: 6000,
                        isClosable: true,
                        position: "bottom",
                    });

                    setSelectedMemberId("");
                } else {
                    const newSplitPercentMembers = [
                        ...splitPercentMembers,
                        memberToAdd,
                    ];
                    const newPercentages = [
                        ...percentages,
                        {
                            _id: memberToAdd._id,
                            name: memberToAdd.name,
                            avatar: memberToAdd.avatar,
                            avatarColor: memberToAdd.avatarColor,
                            percentage: 0,
                            role: memberToAdd.role,
                        },
                    ];

                    setSplitPercentMembers(newSplitPercentMembers);
                    setPercentages(newPercentages);
                    setSelectedMemberId("");
                    handleAmountChange(newPercentages); // Calculate the sums based on percentages
                }
            }
        }
    };

    // Filter members to get options that are not already in filteredMembers
    const availableOptions = members.filter(
        (member) =>
            !splitPercentMembers.some((current) => current._id === member._id)
    );

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
                                    src={member.avatar}
                                    background={member.avatarColor}
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
            <Text mt="1" fontWeight="bold">
                Добавете член:
            </Text>
            <HStack mt="2">
                <Select
                    placeholder="Изберете член"
                    value={selectedMemberId}
                    onChange={(e) => setSelectedMemberId(e.target.value)}
                >
                    {availableOptions.map((option) => (
                        <option key={option._id} value={option._id}>
                            {option.email}
                        </option>
                    ))}
                </Select>
                <IconButton
                    aria-label="Добави член"
                    icon={<IoPersonAddSharp fontSize="20px" />}
                    variant="ghost"
                    color="themePurple.800"
                    onClick={handleAddMember}
                />
            </HStack>
            {message && (
                <Text mt="2" color={messageColor}>
                    {message}
                </Text>
            )}
        </Stack>
    );
}
