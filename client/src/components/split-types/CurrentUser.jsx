import { Avatar, Card, Stack, Text } from "@chakra-ui/react";
import { useContext, useEffect } from "react";
import AuthContext from "../../contexts/authContext";

export default function CurrentUser({ amount, onUpdate, creator = null }) {
    const { userId, name, avatar, avatarColor } = useContext(AuthContext);

    // Function to determine the current payer's information
    const currentPayer =
        creator === null
            ? { name, avatar, avatarColor }
            : {
                name: creator?.name,
                avatar: creator?.avatar,
                avatarColor: creator?.avatarColor,
              };

    useEffect(() => {
        onUpdate(userId, amount);
    }, [amount]);

    return (
        <Card
            p="4"
            width={{ base: "100%", md: "47%" }}
            display="flex"
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            mt="-4"
        >
            <Stack display="flex" alignItems="center" direction="row" mr="2">
                <Avatar
                    name={currentPayer.name}
                    background={currentPayer.avatarColor}
                    src={currentPayer.avatar}
                    mr="3"
                />
                <Text>{currentPayer.name}</Text>
            </Stack>
            <Stack display="flex" alignItems="center" direction="row">
                <Text mr="1">{((amount * 100) / 100).toFixed(2)} лв.</Text>
            </Stack>
        </Card>
    );
}
