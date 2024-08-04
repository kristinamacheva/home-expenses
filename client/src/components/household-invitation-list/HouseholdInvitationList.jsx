import { useContext, useEffect, useState } from "react";
import {
    Button,
    HStack,
    Heading,
    Spacer,
    VStack,
    Stack,
    Card,
    useToast,
    Flex,
    Text,
} from "@chakra-ui/react";

import * as householdInvitationService from "../../services/householdInvitationService";
import AuthContext from "../../contexts/authContext";
import HouseholdInvitationListItem from "./household-invitation-list-item/HouseholdInvitationListItem";

export default function HouseholdInvitationList() {
    const [invitations, setInvitations] = useState([]);
    const toast = useToast();
    const { logoutHandler } = useContext(AuthContext);

    useEffect(() => {
        householdInvitationService
            .getAll()
            .then((result) => setInvitations(result))
            .catch((error) => {
                if (error.status === 401) {
                    logoutHandler();
                } else {
                    toast({
                        title:
                            error.message || "Неуспешно зареждане на поканите",
                        status: "error",
                        duration: 6000,
                        isClosable: true,
                        position: "bottom",
                    });
                }
            });
    }, []);

    const removeInvitationFromState = (invitationId) => {
        setInvitations((prevInvitations) =>
            prevInvitations.filter(
                (invitation) => invitation._id !== invitationId
            )
        );
    };

    return (
        <>
            <Stack>
                <Card background="white" p="2" boxShadow="xs">
                    <HStack mx={4} my={2} alignItems="center" flexWrap="wrap">
                        <Heading as="h1" size="lg" color="themePurple.800">
                            Покани
                        </Heading>
                    </HStack>
                </Card>
                <Stack mt="4">
                    {Array.isArray(invitations) && invitations.length > 0 ? (
                        invitations.map((invitation) => (
                            <HouseholdInvitationListItem
                                key={invitation._id}
                                {...invitation}
                                onRemove={removeInvitationFromState}
                            />
                        ))
                    ) : (
                        <Flex justifyContent="center" alignItems="center">
                            <Text>Няма налични покани</Text>
                        </Flex>
                    )}
                </Stack>
            </Stack>
        </>
    );
}
