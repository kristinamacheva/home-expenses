import React from "react";
import { Text, VStack, HStack, Divider } from "@chakra-ui/react";

export default function BankPaymentDetails({ bankDetails, amount }) {
    return (
        <VStack
            align="start"
            p={4}
            spacing={3}
            borderWidth={1}
            borderRadius="md"
        >
            <HStack justify="space-between" width="100%">
                <Text fontSize="sm">Име на получателя:</Text>
                <Text fontSize="sm" fontWeight="bold">
                    {bankDetails.payeeFullName}
                </Text>
            </HStack>
            <Divider borderColor="gray.600" />
            <HStack justify="space-between" width="100%">
                <Text fontSize="sm">IBAN на получателя:</Text>
                <Text fontSize="sm" fontWeight="bold">
                    {bankDetails.payeeIban}
                </Text>
            </HStack>
            <Divider borderColor="gray.600" />
            <HStack justify="space-between" width="100%">
                <Text fontSize="sm">BIC на получателя:</Text>
                <Text fontSize="sm" fontWeight="bold">
                    {bankDetails.payeeBic}
                </Text>
            </HStack>
            <Divider borderColor="gray.600" />
            <HStack justify="space-between" width="100%">
                <HStack spacing={3}>
                    <Text fontSize="sm">Валута:</Text>
                    <Text fontSize="sm" fontWeight="bold">
                        BGN
                    </Text>
                </HStack>
                <Divider
                    orientation="vertical"
                    height="24px"
                    borderColor="gray.600"
                />
                <HStack spacing={3}>
                    <Text fontSize="sm">Сума:</Text>
                    <Text fontSize="sm" fontWeight="bold">
                        {amount}
                    </Text>
                </HStack>
            </HStack>
            <Divider borderColor="gray.600" />
            <HStack justify="space-between" width="100%">
                <Text fontSize="sm">Основание за плащане:</Text>
                <Text fontSize="sm" fontWeight="bold">
                    {bankDetails.paymentDescription}
                </Text>
            </HStack>
            <Divider borderColor="gray.600" />
            <HStack justify="space-between" width="100%">
                <Text fontSize="sm">Наредител:</Text>
                <Text fontSize="sm" fontWeight="bold">
                    {bankDetails.payerFullName}
                </Text>
            </HStack>
            <Divider borderColor="gray.600" />
            <HStack justify="space-between" width="100%">
                <Text fontSize="sm">IBAN на наредителя:</Text>
                <Text fontSize="sm" fontWeight="bold">
                    {bankDetails.payerIban}
                </Text>
            </HStack>
        </VStack>
    );
}
