import { Stack, Heading, Text, Flex, Card, Avatar } from "@chakra-ui/react";

export default function SplitCard({ splitType, splitTypeTitle, membersArray }) {
    return (
        <Card
            px="4"
            py="3"
            mx="0.2em"
            my="1"
            boxShadow="md"
            background="white"
            spacing={{ base: "1", md: "4" }}
            direction="column"
            justifyContent="space-between"
        >
            <Stack>
                <Heading size="sm" fontWeight="bold">
                    {splitTypeTitle}
                </Heading>
                <Text size="sm">
                    <Text as="span" fontWeight="bold">
                        Метод на разпределение:
                    </Text>{" "}
                    {splitType}
                </Text>
            </Stack>
            {membersArray.length > 0 && (
                <Flex
                    wrap={{
                        base: "nowrap",
                        lg: "wrap",
                    }}
                    direction={{
                        base: "column",
                        lg: "row",
                    }}
                    justifyContent="space-between"
                >
                    {membersArray.map((member) => (
                        <Stack
                            key={member._id}
                            width={{
                                base: "100%",
                                lg: "48%",
                            }}
                            spacing="0.5"
                            mt={2}
                        >
                            <Card
                                key={member._id}
                                p="4"
                                display="flex"
                                direction="row"
                                alignItems="center"
                                justifyContent="space-between"
                                mb={{
                                    base: "2",
                                    lg: "3",
                                }}
                            >
                                <Stack
                                    display="flex"
                                    alignItems="center"
                                    direction="row"
                                    mr="2"
                                >
                                    <Avatar
                                        name={member.name}
                                        src={member.avatar}
                                        background={member.avatarColor}
                                        mr="3"
                                    />
                                    <Text>{member.name}</Text>
                                </Stack>
                                <Stack
                                    display="flex"
                                    alignItems="center"
                                    direction="row"
                                >
                                    <Text mr="1">
                                        {member.sum.toFixed(2) + " лв."}
                                    </Text>
                                </Stack>
                            </Card>
                        </Stack>
                    ))}
                </Flex>
            )}
        </Card>
    );
}
