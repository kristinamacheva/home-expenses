import { Stack, Text, Card, Heading } from "@chakra-ui/react";

export default function AllowanceListItem({ createdAt, amount }) {
    return (
        <Card px="4" py="3" mx="0.2em" my="1" boxShadow="md" background="white">
            <Stack
                direction={{ base: "column", md: "row" }}
                spacing="4"
                justifyContent={{ base: "flex-start", md: "space-between" }}
                alignItems={{ base: "flex-start", md: "center" }}
            >
                <Stack
                    direction="column"
                    spacing={{ base: "1", md: "0" }}
                    flex="1"
                >
                    <Heading as="h5" fontWeight="bold" size="md">
                        Постъпване на сума за джобни
                    </Heading>
                    <Text color="gray.500" fontSize="sm">
                        {new Date(createdAt).toLocaleDateString("bg-BG")}
                    </Text>
                    
                </Stack>
                <Text
                    fontSize="xl"
                    fontWeight="bold"
                    color="themePurple.800"
                    mb={{ base: "0", md: "2" }}
                    alignSelf="flex-end"
                >
                    {amount} лв.
                </Text>
            </Stack>
        </Card>
    );
}
