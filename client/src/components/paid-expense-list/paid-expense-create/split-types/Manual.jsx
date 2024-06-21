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
        const updatedMembers = members.map((member) => ({
            _id: member.user._id,
            name: member.user.name,
            // avatar: member.user.avatar,
        }));

        setSplitManualMembers(updatedMembers);
        if (manualAmounts.length === 0) {
            setManualAmounts(
                updatedMembers.map((member) => ({ _id: member._id, sum: 0 }))
            );
        }
    }, []);

    useEffect(() => {
        handleMessageChange(manualAmounts);
    }, [amount, manualAmounts]);

    // TODO: update state only when the amounts are correct - if not - error
    const handleMessageChange = (newAmounts) => {
        const totalEntered = newAmounts.reduce(
            (acc, member) => acc + member.sum,
            0
        );
        if (totalEntered > amount) {
            setMessageColor("red.400");
            setMessage(
                `Сборът от сумите надвишава сумата на разхода с ${
                    totalEntered - amount
                } лв.`
            );
        } else if (totalEntered < amount) {
            setMessageColor("red.400");
            setMessage(`Трябва да доплатите още ${amount - totalEntered} лв.`);
        } else {
            setMessageColor("green.400");
            setMessage("Сборът от сумите е равен на сумата на разхода");
        }
        onUpdate(newAmounts, message);
    };

    const handleChange = (id, value) => {
        const newAmounts = manualAmounts.map((entry) =>
            entry._id === id ? { ...entry, sum: parseFloat(value) || 0 } : entry
        );
        setManualAmounts(newAmounts);
        handleMessageChange(newAmounts);
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
        handleMessageChange(newAmounts);
    };

    // const handleChange = (index, value) => {
    //     const newAmounts = [...manualAmounts];
    //     newAmounts[index].sum = parseFloat(value) || 0;
    //     setManualAmounts(newAmounts);

    //     const totalEntered = newAmounts.reduce((acc, member) => acc + member.sum, 0);
    //     if (totalEntered > amount) {
    //         setError('Total entered amounts exceed the total amount');
    //     } else {
    //         setError('');
    //         onUpdate(newAmounts);
    //     }
    // };

    // const onMemberRemove = (index) => {
    //     if (splitManualMembers.length <= 2) {
    //         return;
    //     }

    //     const updatedMembers = [...splitManualMembers];
    //     updatedMembers.splice(index, 1);
    //     setSplitManualMembers(updatedMembers);

    //     const newAmounts = [...manualAmounts];
    //     newAmounts.splice(index, 1);
    //     setManualAmounts(newAmounts);
    //     onUpdate(newAmounts);
    // };

    return (
        <Flex
            wrap={{ base: "nowrap", lg: "wrap" }}
            direction={{ base: "column", lg: "row" }}
            justifyContent="space-between"
        >
            {splitManualMembers.map((member) => (
                <Stack width={{ base: "100%", lg: "48%" }} spacing="0.5">
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
                                // src={avatar || ""}
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
                                {manualAmounts.find(
                                    (entry) => entry._id === member._id
                                )?.sum || 0}{" "}
                                лв.
                            </Text>
                            {splitManualMembers.length > 2 &&
                                ((member._id !== userId && (
                                    <IconButton
                                        aria-label="Изтрийте"
                                        title="Изтрийте"
                                        icon={<FaRegTrashCan fontSize="20px" />}
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
                                                    onMemberRemove(member._id)
                                                }
                                            />
                                        )))}
                            {/* {splitManualMembers.length > 2 &&
                                (member._id === userId && showCreatorDeleteButton) && (
                                    <IconButton
                                        aria-label="Изтрийте"
                                        title="Изтрийте"
                                        icon={<FaRegTrashCan fontSize="20px" />}
                                        variant="ghost"
                                        color="themePurple.800"
                                        onClick={() =>
                                            onMemberRemove(member._id)
                                        }
                                    />
                                )} */}
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
            {message && (
                <Text mt="2" color={messageColor}>
                    {message}
                </Text>
            )}
        </Flex>
    );
}
