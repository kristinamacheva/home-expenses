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
import { FaBirthdayCake } from "react-icons/fa";
import moment from "moment";

export default function MemberListItem({ user }) {
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
            height="230px"
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
                        <Badge variant="subtle">{user.role}</Badge>
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
                    <HStack>
                        <Icon as={FaBirthdayCake} color="themePurple.800" />
                        <Text>{moment(user.birthdate).format("DD.MM.YYYY")}</Text>
                    </HStack>
                </Stack>
            </Stack>
        </Card>
    );
}
