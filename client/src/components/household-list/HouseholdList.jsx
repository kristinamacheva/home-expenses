import { useContext, useEffect, useState } from "react";
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

import * as householdService from "../../services/householdService";
import HouseholdCreate from "./household-create/HouseholdCreate";
import AuthContext from "../../contexts/authContext";

export default function HouseholdList() {
    const [households, setHouseholds] = useState([]);
    
    useEffect(() => {
        householdService
        .getAll()
        .then((result) => setHouseholds(result))
        .catch((err) => {
            console.log(err);
        });
    }, []);
    
    const { userId } = useContext(AuthContext);

    const {
        isOpen: isCreateModalOpen,
        onOpen: onOpenCreateModal,
        onClose: onCloseCreateModal,
    } = useDisclosure();

    // TODO: unique key error
    const addHouseholdToState = (newHousehold) => {
        setHouseholds((state) => ([...state, newHousehold]));
    };

    return (
        <>
            <Stack>
                <Card background="white" p="2" boxShadow="xs">
                    <HStack mx={4} my={2} alignItems="center" flexWrap="wrap">
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
            {isCreateModalOpen && (
                <HouseholdCreate
                    isOpen={isCreateModalOpen}
                    onClose={onCloseCreateModal}
                    addHouseholdToState={addHouseholdToState}
                />
            )}
        </>
    );
}
