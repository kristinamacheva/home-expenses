import { useContext, useEffect, useState } from "react";
import {
    Button,
    HStack,
    Heading,
    Spacer,
    VStack,
    Stack,
    Card,
} from "@chakra-ui/react";

import * as householdInvitationService from "../../services/householdInvitationService";
import AuthContext from "../../contexts/authContext";
import HouseholdInvitationListItem from "./household-invitation-list-item/HouseholdInvitationListItem";

export default function HouseholdInvitationList() {
    const [invitations, setInvitations] = useState([]);

    useEffect(() => {
        householdInvitationService
            .getAll()
            .then((result) => setInvitations(result))
            .catch((err) => {
                console.log(err);
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
                    {invitations.map((invitation) => (
                        <HouseholdInvitationListItem
                            key={invitation._id}
                            {...invitation}
                            onRemove={removeInvitationFromState}
                        />
                    ))}
                </Stack>
            </Stack>
        </>
    );
}