import {
    Stack,
    Heading,
    Avatar,
    Badge,
    Box,
    Card,
    HStack,
    Text,
    Icon,
    Button,
} from "@chakra-ui/react";

import { FaEnvelope, FaPhone } from "react-icons/fa6";

export default function BalanceListItem({ user, sum, type, _id }) {
    let badgeText = "";
    let badgeColor = "";

    if (type === "-") {
        badgeText = `Дължите ${sum} лв.`;
    } else {
        badgeText =
            sum === 0 ? "Нямате задължения" : `Дължат Ви ${sum} лв.`;
    }

    badgeColor = type === "-" ? "red" : "green";

    return (
        <Card
            px="5"
            py="5"
            boxShadow="md"
            background="white"
            spacing="4"
            direction="column"
            justifyContent="center"
            alignItems="center"
            width="280px"
            height="210px"
        >
            <Stack
                direction="column"
                alignItems="center"
                justifyContent="center"
                spacing="3"
            >
                <Avatar
                    name={user.name}
                    src={user.avatar}
                    background={user.avatarColor}
                />
                <Stack spacing="0.5" alignItems="center">
                    <Heading as="h4" size="sm">
                        {user.name}
                    </Heading>
                    <Box display="inline-block">
                        <Badge variant="subtle" colorScheme={badgeColor}>
                            {badgeText}
                        </Badge>
                    </Box>
                </Stack>
                {type === "+" && sum !== 0 && (
                    <Button type="primary">Изпратете напомняне</Button>
                )}
                {type === "-" && (
                    <Button type="primary">Погасете задължението</Button>
                )}
            </Stack>
        </Card>
    );
}
