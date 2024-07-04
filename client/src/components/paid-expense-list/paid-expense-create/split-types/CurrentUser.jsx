import { Avatar, Card, Stack, Text } from "@chakra-ui/react";
import { useContext, useEffect } from "react";
import AuthContext from "../../../../contexts/authContext";

export default function CurrentUser({ amount, onUpdate }) {
    const { userId, name, avatar, avatarColor } = useContext(AuthContext);

    useEffect(() => {
        onUpdate(userId, amount);
    }, [amount]);

    return (
        <Card
            p="4"
            width="47%"
            display="flex"
            direction="row"
            alignItems="center"
            justifyContent="space-between"
        >
            <Stack display="flex" alignItems="center" direction="row" mr="2">
                <Avatar name={name} background={avatarColor} src={avatar} mr="3" />
                <Text>{name}</Text>
            </Stack>
            <Stack display="flex" alignItems="center" direction="row">
                <Text mr="1">{((amount * 100) / 100).toFixed(2)} лв.</Text>
            </Stack>
        </Card>
    );
}
