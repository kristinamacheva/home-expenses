import { useState } from "react";
import HouseholdListItem from "./household-list-item/HouseholdListItem";
import {
    Button,
    HStack,
    Heading,
    Spacer,
    VStack,
    Stack,
    useDisclosure,
    Card,
} from "@chakra-ui/react";
import HouseholdCreate from "./household-create/HouseholdCreate";

export default function HouseholdList() {
    const userId = "1";
    const [households, setHouseholds] = useState([
        {
            _id: "1",
            name: "Съквартиранти",
            members: [
                { userId: "1", role: "admin" },
                { userId: "2", role: "member" },
            ],
            balance: [
                { userId: "1", sum: 60, type: "+" },
                { userId: "2", sum: 60, type: "-" },
            ],
            admin: "1",
        },
        {
            _id: "2",
            name: "Вкъщи",
            members: [
                { userId: "1", role: "member" },
                { userId: "2", role: "member" },
                { userId: "3", role: "admin" },
            ],
            balance: [
                { userId: "1", sum: 30, type: "-" },
                { userId: "2", sum: 30, type: "-" },
                { userId: "3", sum: 60, type: "+" },
            ],
            admin: "3",
        },
        {
            _id: "3",
            name: "Обмен",
            members: [
                { userId: "1", role: "member" },
                { userId: "2", role: "admin" },
            ],
            balance: [
                { userId: "1", sum: 0, type: "+" },
                { userId: "2", sum: 0, type: "+" },
            ],
            admin: "2",
        },
    ]);

    const {
        isOpen: isCreateModalOpen,
        onOpen: onOpenCreateModal,
        onClose: onCloseCreateModal,
    } = useDisclosure();

    return (
        <>
            <Stack>
                <Card background="white" p="2" boxShadow="xs">
                    <HStack mx={4} my={2} alignItems="center">
                        <Heading as="h1" size="lg" color="themePurple.800">
                            Домакинства
                        </Heading>
                        <Spacer />
                        <Button variant="primary" onClick={onOpenCreateModal}>
                            + Създаване
                        </Button>
                    </HStack>
                </Card>
                <Stack mt="4">
                    {households.map((household) => (
                        <HouseholdListItem key={household._id} {...household} />
                    ))}
                </Stack>
            </Stack>
            <HouseholdCreate
                isOpen={isCreateModalOpen}
                onClose={onCloseCreateModal}
            />
        </>
    );
}
