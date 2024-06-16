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
} from "@chakra-ui/react";

import { FaEnvelope, FaPhone } from "react-icons/fa6";

export default function MemberListItem({ user, role }) {
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
                    src={user.avatar || ""}
                    background={"themeYellow.900"}
                />
                <Stack spacing="0.5" alignItems="center">
                    <Heading as="h4" size="sm">
                        {user.name}
                    </Heading>
                    <Box display="inline-block">
                        <Badge variant="subtle">{role}</Badge>
                    </Box>
                </Stack>
                <Stack spacing={{ base: "1", md: "0" }}>
                    {user.phone && (
                        <HStack>
                            <Icon as={FaPhone} color="themePurple.800" />
                            <Text>{user.phone}</Text>
                        </HStack>
                    )}
                    <HStack>
                        <Icon as={FaEnvelope} color="themePurple.800" />
                        <Text>{user.email}</Text>
                    </HStack>
                </Stack>
            </Stack>
        </Card>
    );
}
