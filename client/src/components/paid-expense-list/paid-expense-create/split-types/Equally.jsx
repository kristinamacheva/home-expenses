import {
    Avatar,
    Card,
    Flex,
    HStack,
    IconButton,
    Stack,
    Text,
} from "@chakra-ui/react";
import useEqualSplit from "../../../../hooks/useEqualSplit";
import { useContext, useEffect, useState } from "react";
import { FaRegTrashCan } from "react-icons/fa6";
import AuthContext from "../../../../contexts/authContext";

export default function Equally({ amount, members, onUpdate }) {
    // TODO: 0 members validation
    const { userId } = useContext(AuthContext);
    const [splitEquallyMembers, setSplitEquallyMembers] = useState([]);

    useEffect(() => {
        const updatedMembers = members.map((member) => ({
            _id: member.user._id,
            name: member.user.name,
            // avatar: member.user.avatar,
        }));

        setSplitEquallyMembers(updatedMembers);
    }, []);

    const equalSplit = useEqualSplit(amount, splitEquallyMembers);
    console.log(amount);
    console.log(splitEquallyMembers);

    const onMemberRemove = (id) => {
        // Prevent removal if there is only one member
        if (splitEquallyMembers.length <= 2) {
            return;
        }

        // Filter out the member with the specified id
        const updatedMembers = splitEquallyMembers.filter(member => member._id !== id);
        setSplitEquallyMembers(updatedMembers);
        // TODO: notify the parent component
    };

    return (
        <Flex wrap={{ base: "nowrap", lg: "wrap" }} direction={{ base: "column", lg: "row" }} justifyContent="space-between">
            {equalSplit.map((member) => (
                <Card
                    key={member._id}
                    p="4"
                    width={{ base: "100%", lg: "48%" }}
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
                    <Stack display="flex" alignItems="center" direction="row">
                        <Text mr="1">{member.sum} лв.</Text>
                        {splitEquallyMembers.length > 2 && member._id !== userId && (
                            <IconButton
                                aria-label="Изтрийте"
                                title="Изтрийте"
                                icon={<FaRegTrashCan fontSize="20px" />}
                                variant="ghost"
                                color="themePurple.800"
                                onClick={() => onMemberRemove(member._id)}
                            />
                        )}
                    </Stack>
                </Card>
            ))}
        </Flex>
    );
}
