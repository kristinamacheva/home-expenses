import {
    Stack,
    Heading,
    Avatar,
    Badge,
    Box,
    Card,
    Button,
} from "@chakra-ui/react";


export default function BalanceListItem({ balance }) {
    let badgeText = "";
    let badgeColor = "";

    if (balance.type === "-") {
        badgeText = `Дължите ${balance.sum} лв.`;
    } else {
        badgeText =
            balance.sum === 0
                ? "Нямате задължения"
                : `Дължат Ви ${balance.sum} лв.`;
    }

    badgeColor = balance.type === "-" ? "red" : "green";

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
                    name={balance.name}
                    src={balance.avatar}
                    background={balance.avatarColor}
                />
                <Stack spacing="0.5" alignItems="center">
                    <Heading as="h4" size="sm">
                        {balance.name}
                    </Heading>
                    <Box display="inline-block">
                        <Badge variant="subtle" colorScheme={badgeColor}>
                            {badgeText}
                        </Badge>
                    </Box>
                </Stack>
                {balance.type === "+" && balance.sum !== 0 && (
                    <Button type="primary">Изпратете напомняне</Button>
                )}
                {balance.type === "-" && (
                    <Button type="primary">Погасете задължението</Button>
                )}
            </Stack>
        </Card>
    );
}
