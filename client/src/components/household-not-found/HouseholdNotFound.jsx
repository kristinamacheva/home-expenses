import { Flex, Box, Heading, Text, Button } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import Path from "../../paths";

export default function HouseholdNotFound() {
    return (
        <Flex
            justifyContent="center"
        >
            <Box textAlign="center" py={10} px={6}>
                <Heading
                    display="inline-block"
                    as="h2"
                    size="2xl"
                    backgroundClip="text"
                    color="themePurple.700"
                >
                    404
                </Heading>
                <Text fontSize="18px" mt={3} mb={2}>
                    Страницата не е намерена
                </Text>
                <Text color={"gray.500"} mb={6}>
                    Домакинството, което търсите, не може да бъде намерено. Възможно е да сте въвели неправилния URL или да нямате достъп до това домакинство.
                </Text>

                <Button as={Link} to={`/${Path.HouseholdList}`} variant="primary">
                    Домакинства
                </Button>
            </Box>
        </Flex>
    );
}