import {
    Stack,
    Button,
    Heading,
    AvatarGroup,
    Avatar,
    Badge,
    Box,
    Card,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";

export default function HouseholdListItem({ _id, name, members, balance }) {
    const userId = '1';

    const userBalance = balance.find(user => user.userId === userId);
    //TODO: fix the number type if necessary
    const userBalanceSum = userBalance ? userBalance.sum : 0;
    const badgeColorScheme = userBalance.type === '-' ? 'red' : 'green';

    let badgeText;

    if (userBalance.type === '-') {
        badgeText =`Дължите ${userBalanceSum} лв.`;
    } else {
        badgeText = userBalanceSum === 0 ? 'Нямате дългове' : `Дължат Ви ${userBalanceSum} лв.`;;
    }

    return (
        <Card
            px="5"
            py="5"
            mx="4"
            my="1"
            boxShadow="md"
            // borderRadius="lg"
            borderTop="4px solid #676F9D"
            background="white"
            spacing="4"
            direction={{ base: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ md: "center" }}
        >
            <Stack
                direction={{ base: "column", md: "row" }}
                alignItems={{ md: "center" }}
                spacing={{ base: "2", md: "4" }}
            >
                <Stack direction="column" spacing={{ base: "1", md: "0" }}>
                    <Heading as="h3" size="md">
                        {name}
                    </Heading>
                    <Box display="inline-block">
                        <Badge variant="subtle" colorScheme={badgeColorScheme}>
                            {badgeText}
                        </Badge>
                    </Box>
                </Stack>
                <AvatarGroup size="md" max={2}>
                    <Avatar
                        name="Ryan Florence"
                        background={"themeYellow.900"}
                    />
                    <Avatar
                        name="Segun Adebayo"
                        src="https://bit.ly/sage-adebayo"
                    />
                    <Avatar
                        name="Kent Dodds"
                        src="https://bit.ly/kent-c-dodds"
                    />
                </AvatarGroup>
            </Stack>
            <Button as={Link} to={`/domakinstva/${_id}`} variant="outline" mt={{ base: "3" }}>
                Детайли
            </Button>
        </Card>
    );
}
