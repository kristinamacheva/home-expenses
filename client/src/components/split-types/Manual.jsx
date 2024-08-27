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
    Select,
    useToast,
} from "@chakra-ui/react";
import { useContext, useEffect, useState } from "react";
import { FaRegTrashCan } from "react-icons/fa6";
import { IoPersonAddSharp } from "react-icons/io5";
import AuthContext from "../../contexts/authContext";

// Filter members based on childrenIncluded flag
const filterMembers = (membersArray, childrenIncluded) => {
    return childrenIncluded
        ? membersArray
        : membersArray.filter((member) => member.role !== "Дете");
};

export default function Manual({
    amount,
    members,
    currentMembers,
    onUpdate,
    showCreatorDeleteButton,
    childrenIncluded,
}) {
    const { userId } = useContext(AuthContext);
    const [splitManualMembers, setSplitManualMembers] = useState([]);
    const [manualAmounts, setManualAmounts] = useState([]);
    const [message, setMessage] = useState("");
    const [messageColor, setMessageColor] = useState("");
    const [selectedMemberId, setSelectedMemberId] = useState("");
    const toast = useToast();

    useEffect(() => {
        // Initialize splitManualMembers and manualAmounts with filtered members
        const filteredMembers = filterMembers(currentMembers, childrenIncluded);
        setSplitManualMembers(filteredMembers);

        const initialAmounts = filteredMembers.map((member) => ({
            _id: member._id,
            name: member.name,
            avatarColor: member.avatarColor,
            avatar: member.avatar,
            sum: member.sum,
            role: member.role,
        }));
        setManualAmounts(initialAmounts);
    }, [childrenIncluded]);

    useEffect(() => {
        handleMessageChange(manualAmounts);
    }, [amount, manualAmounts]);

    const handleMessageChange = (newAmounts) => {
        const totalEnteredInCents = newAmounts.reduce(
            (acc, member) => acc + Number(member.sum) * 100,
            0
        );

        const totalAmountInCents = amount * 100;

        let message = "";

        if (totalEnteredInCents > totalAmountInCents) {
            message = `Сборът от сумите надвишава сумата на разхода с ${(
                (totalEnteredInCents - totalAmountInCents) /
                100
            ).toFixed(2)} лв.`;
            setMessageColor("red.400");
            setMessage(message);
        } else if (totalEnteredInCents < totalAmountInCents) {
            message = `Трябва да доплатите още ${(
                (totalAmountInCents - totalEnteredInCents) /
                100
            ).toFixed(2)} лв.`;
            setMessageColor("red.400");
            setMessage(message);
        } else {
            message = "Сборът от сумите е равен на сумата на разхода.";
            setMessageColor("green.400");
            setMessage(message);
        }

        onUpdate(newAmounts, message);
    };

    const handleChange = (id, value) => {
        const regex = /^\d*([\,\.]?\d{0,2})?$/;

        if (!regex.test(value)) {
            return;
        }

        const newAmounts = manualAmounts.map((entry) =>
            entry._id === id ? { ...entry, sum: Number(value) || 0 } : entry
        );

        setManualAmounts(newAmounts);
    };

    const onMemberRemove = (id) => {
        if (splitManualMembers.length <= 2) {
            return;
        }

        const updatedMembers = splitManualMembers.filter(
            (member) => member._id !== id
        );
        setSplitManualMembers(updatedMembers);

        const newAmounts = manualAmounts.filter((entry) => entry._id !== id);
        setManualAmounts(newAmounts);
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
                    setSplitManualMembers([...splitManualMembers, memberToAdd]);
                    setManualAmounts([
                        ...manualAmounts,
                        {
                            _id: memberToAdd._id,
                            name: memberToAdd.name,
                            avatar: memberToAdd.avatar,
                            avatarColor: memberToAdd.avatarColor,
                            sum: 0,
                            role: memberToAdd.role,
                        },
                    ]);
                    setSelectedMemberId("");
                }
            }
        }
    };

    // Filter members to get options that are not already in currentMembers
    const availableOptions = members.filter(
        (member) =>
            !splitManualMembers.some((current) => current._id === member._id)
    );

    return (
        <Stack>
            <Flex
                wrap={{ base: "nowrap", lg: "wrap" }}
                direction={{ base: "column", lg: "row" }}
                justifyContent="space-between"
            >
                {splitManualMembers.map((member) => (
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
                                        manualAmounts.find(
                                            (entry) => entry._id === member._id
                                        )?.sum || 0
                                    ).toFixed(2) + " лв."}
                                </Text>
                                {splitManualMembers.length > 2 &&
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
                            <InputLeftAddon>Сума</InputLeftAddon>
                            <Input
                                type="number"
                                value={
                                    manualAmounts.find(
                                        (entry) => entry._id === member._id
                                    )?.sum || 0
                                }
                                onChange={(e) =>
                                    handleChange(member._id, e.target.value)
                                }
                            />
                        </InputGroup>
                    </Stack>
                ))}
            </Flex>
            <Text mt="4" fontWeight="bold">
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
