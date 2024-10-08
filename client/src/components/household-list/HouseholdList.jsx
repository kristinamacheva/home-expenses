import { useContext, useEffect, useState } from "react";
import HouseholdListItem from "./household-list-item/HouseholdListItem";
import {
    Button,
    HStack,
    Heading,
    Spacer,
    Stack,
    useDisclosure,
    Card,
    useToast,
} from "@chakra-ui/react";

import * as authService from "../../services/authService";
import HouseholdCreate from "./household-create/HouseholdCreate";
import AuthContext from "../../contexts/authContext";
import { isChildUnder14 } from "../../utils/ageUtils";

export default function HouseholdList() {
    const [households, setHouseholds] = useState([]);
    const { birthdate, logoutHandler } = useContext(AuthContext);
    const toast = useToast();

    useEffect(() => {
        fetchHouseholds();
    }, []);

    const fetchHouseholds = () => {
        authService
            .getHouseholds()
            .then((result) => {
                // Sort households: non-archived ones first
                const sortedHouseholds = result.sort((a, b) => {
                    return a.archived === b.archived ? 0 : a.archived ? 1 : -1;
                });
                setHouseholds(sortedHouseholds);
            })
            .catch((error) => {
                if (error.status === 401) {
                    logoutHandler();
                } else {
                    toast({
                        title:
                            error.message ||
                            "Неуспешно зареждане на домакинствата",
                        status: "error",
                        duration: 6000,
                        isClosable: true,
                        position: "bottom",
                    });
                }
            });
    };

    const {
        isOpen: isCreateModalOpen,
        onOpen: onOpenCreateModal,
        onClose: onCloseCreateModal,
    } = useDisclosure();

    return (
        <>
            <Stack>
                <Card background="white" p="2" boxShadow="xs">
                    <HStack mx={4} my={2} alignItems="center" flexWrap="wrap">
                        <Heading as="h1" size="lg" color="themePurple.800">
                            Домакинства
                        </Heading>
                        <Spacer />
                        {!isChildUnder14(birthdate) && (
                            <Button
                                variant="primary"
                                onClick={onOpenCreateModal}
                            >
                                + Създаване
                            </Button>
                        )}
                    </HStack>
                </Card>
                <Stack mt="4">
                    {households.map((household) => (
                        <HouseholdListItem
                            key={household._id}
                            household={household}
                            fetchHouseholds={fetchHouseholds}
                        />
                    ))}
                </Stack>
            </Stack>
            {isCreateModalOpen && (
                <HouseholdCreate
                    isOpen={isCreateModalOpen}
                    onClose={onCloseCreateModal}
                    fetchHouseholds={fetchHouseholds}
                />
            )}
        </>
    );
}
