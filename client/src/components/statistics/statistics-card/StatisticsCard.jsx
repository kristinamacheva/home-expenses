import React from "react";
import { Box, Text } from "@chakra-ui/react";

export default function StatisticsCard({ label, value }) {
    return (
        <Box
            p={4}
            bg="white"
            boxShadow="md"
            borderRadius="md"
            textAlign="center"
            flex="1"
        >
            <Text fontSize="2xl" color="themePurple.700" fontWeight="bold">
                {value}
            </Text>
            <Text fontSize="md" color="gray.600">
                {label}
            </Text>
        </Box>
    );
}
