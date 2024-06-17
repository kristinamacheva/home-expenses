import { Flex, Box, Heading, Text, Button } from "@chakra-ui/react";
import { Link } from 'react-router-dom';
import Path from '../../paths';

const ErrorFallback = ({ resetErrorState }) => {
    return (
        <Flex
            alignItems="center"
            justifyContent="center"
            minHeight="100vh"
        >
            <Box textAlign="center" py={10} px={6}>
                <Heading
                    display="inline-block"
                    as="h2"
                    size="2xl"
                    backgroundClip="text"
                    color="themePurple.700"
                >
                    Нещо се обърка
                </Heading>
                <Text fontSize="18px" mt={3} mb={2}>
                    Съжаляваме, но се случи неочаквана грешка.
                </Text>
                <Text color={"gray.500"} mb={6}>
                    Моля, опитайте отново по-късно или се свържете с поддръжката, ако проблемът продължи.
                </Text>
                <Button as={Link} to={Path.Home} variant="primary" onClick={resetErrorState}>
                    Начало
                </Button>
            </Box>
        </Flex>
    );
};

export default ErrorFallback;