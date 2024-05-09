import {
    Stack,
    Button,
    Heading,
    AvatarGroup,
    Avatar,
    Badge,
    Box,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";

export default function HouseholdList() {

    return (
        <Stack
            px="5"
            py="5"
            m="4"
            boxShadow="lg"
            borderRadius="lg"
            background="white"
            spacing="4"
            direction={{ base: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ md: "center" }}
        >
            <Stack
                direction={{ base: "column", md: "row" }}
                alignItems={{ md: "center" }}
                spacing={{ base: "2", md: "3" }}
            >
                <Stack direction="column" spacing={{ base: "1", md: "0" }}>
                    <Heading as="h4" size="md">
                        Съквартиранти Пловдив
                    </Heading>
                    <Box display="inline-block">
                        <Badge variant="subtle" colorScheme="green">
                            Дължат Ви 1824.57 лв.
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
            <Button
                    as={Link}
                    to={`/domakinstva/1`}
                    // to={`/domakinstva/${_id}`}
                    variant="primary"
                >
                    Детайли
                </Button>
        </Stack>
    );
}
