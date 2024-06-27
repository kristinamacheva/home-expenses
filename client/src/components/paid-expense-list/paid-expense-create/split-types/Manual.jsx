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

export default function Manual({
    amount,
    members,
    onUpdate,
    showCreatorDeleteButton,
}) {
    // TODO: 0 members validation
    const { userId } = useContext(AuthContext);
    const [splitManualMembers, setSplitManualMembers] = useState([]);
    const [manualAmounts, setManualAmounts] = useState([]);
    const [message, setMessage] = useState("");
    const [messageColor, setMessageColor] = useState("");

    useEffect(() => {
        setSplitManualMembers(members);

        if (manualAmounts.length === 0) {
            setManualAmounts(
                members.map((member) => ({ _id: member._id, sum: 0 }))
            );
        }
    }, []);

    useEffect(() => {
        handleMessageChange(manualAmounts);
    }, [amount, manualAmounts]);

    // TODO: update state only when the amounts are correct - if not - error
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
        // Restricting input to 2 decimal places
        const regex = /^\d*([\,\.]?\d{0,2})?$/;
        // TODO: . issue

        if (!regex.test(value)) {
            // If input does not match the regex, do not update state
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
            {message && (
                <Text mt="2" color={messageColor}>
                    {message}
                </Text>
            )}
        </Stack>
    );
}
