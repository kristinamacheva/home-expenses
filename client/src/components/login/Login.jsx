import {
    Flex,
    Box,
    FormControl,
    FormLabel,
    Input,
    Checkbox,
    Stack,
    Button,
    Heading,
    Text,
    useColorModeValue,
} from "@chakra-ui/react";

export default function Login() {
    return (
        <Flex
            minH={"100vh"}
            align={"center"}
            justify={"center"}
            bg={`linear-gradient(135deg, rgba(103,111,157,1) 0%, rgba(135,141,177,1) 25%, rgba(158,162,192,1) 50%, rgba(129,135,174,1) 75%, rgba(103,111,157,1) 100%);`}
        >
            <Stack spacing={6} mx={"auto"} maxW={"lg"} py={12} px={6}>
                <Stack align={"center"}>
                    <Heading fontSize={"4xl"} color={useColorModeValue("white")}>Домоводител</Heading>
                </Stack>
                <Box
                    rounded={"lg"}
                    bg={useColorModeValue("white")}
                    boxShadow={"lg"}
                    py={12} 
                    px={{ base: 10, md: 20 }} 
                >
                    <Stack spacing={4}>
                        <Heading fontSize={'2xl'} mb={3} align={"center"}>Влезте в профила си</Heading>
                        <FormControl id="email">
                            <FormLabel>Имейл</FormLabel>
                            <Input type="email" />
                        </FormControl>
                        <FormControl id="password">
                            <FormLabel>Парола</FormLabel>
                            <Input type="password" />
                        </FormControl>
                        <Stack spacing={10}>
                            <Stack
                                direction={{ base: "column", sm: "row" }}
                                align={"start"}
                                justify={"space-between"}
                            >
                                <Checkbox>Запомни ме</Checkbox>
                                <Text color={"themePurple.700"}>
                                    Забравена парола?
                                </Text>
                            </Stack>
                            <Button variant="primary">
                                Вход
                            </Button>
                        </Stack>
                    </Stack>
                </Box>
            </Stack>
        </Flex>
    );
}
