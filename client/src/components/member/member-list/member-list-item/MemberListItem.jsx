import {
    Stack,
    Button,
    Heading,
    AvatarGroup,
    Avatar,
    Badge,
    Box,
    Card,
    IconButton,
    HStack,
    useDisclosure,
} from "@chakra-ui/react";

export default function MemberListItem({ user, role }) {
    return (
        <>
            <Card
                px="5"
                py="5"
                mx="4"
                my="1"
                boxShadow="md"
                background="white"
                spacing="4"
                direction={{ base: "column", md: "row" }}
                justifyContent="space-between"
                alignItems={{ md: "center" }}
            >
                <Stack
                    direction={{ base: "column", md: "row" }}
                    alignItems={{ md: "center" }}
                    justifyContent="center"
                    spacing={{ base: "2", md: "4" }}
                >
                    <Stack direction="row" alignItems="center">
                    <Avatar
                        name={user.name}
                        src={user.avatar || ""}
                        background={"themeYellow.900"}
                        mr={{ base: "1", md: "2" }}
                    />
                    <Stack direction="column" spacing={{ base: "1", md: "0" }}>
                    
                        <Heading as="h4" size="sm">
                            {user.name}
                        </Heading>
                        <Box display="inline-block">
                            <Badge variant="subtle">{role}</Badge>
                        </Box>
                    </Stack>

                    </Stack>
                    
                    
                </Stack>
                <HStack
                    spacing="0"
                    w={["auto", "auto", "90px"]}
                    justifyContent="flex-end"
                ></HStack>
            </Card>
        </>
    );
}
