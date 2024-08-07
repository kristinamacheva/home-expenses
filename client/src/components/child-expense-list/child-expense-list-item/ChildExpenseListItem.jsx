import { Stack, Heading, Text, Flex, Card } from "@chakra-ui/react";

export default function ChildExpenseListItem({ _id, title, amount, date }) {
    return (
        <Card
            px="4"
            py="3"
            mx="0.2em"
            my="1"
            boxShadow="md"
            background="white"
            spacing={{ base: "1", md: "4" }}
            direction={{ base: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ md: "center" }}
        >
            <Stack direction="column" spacing={{ base: "1", md: "0" }}>
                <Heading as="h3" size="md">
                    {title}
                </Heading>

                <Text color={"gray.500"} fontSize="sm">
                    {new Date(date).toLocaleDateString("bg-BG")}
                </Text>
            </Stack>
            <Stack
                direction={{ base: "column", lg: "row" }}
                alignItems={{ lg: "center" }}
                spacing={{ base: "2", lg: "6" }}
            >
                <Flex direction="column" align="flex-end">
                    <Text
                        fontSize="xl"
                        fontWeight="bold"
                        color="themePurple.800"
                        mb="-1"
                    >
                        {amount} лв.
                    </Text>
                </Flex>
            </Stack>
        </Card>
    );
}
