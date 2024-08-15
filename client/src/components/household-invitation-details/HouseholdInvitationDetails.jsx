import {
    Avatar,
    AvatarGroup,
    Card,
    HStack,
    Heading,
    Spinner,
    Stack,
    Text,
    useToast,
} from "@chakra-ui/react";
import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import * as householdInvitationService from "../../services/householdInvitationService";
import AuthContext from "../../contexts/authContext";
import HouseholdInvitationNotFound from "../household-invitation-not-found/HouseholdInvitationNotFound";

export default function HouseholdInvitationDetails() {
    const [householdInvitation, setHouseholdInvitation] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const { logoutHandler, userId } = useContext(AuthContext);
    const toast = useToast();
    const navigate = useNavigate();

    const { invitationId } = useParams();

    useEffect(() => {
        setIsLoading(true);
        householdInvitationService
            .getOne(invitationId)
            .then((result) => {
                setHouseholdInvitation(result);
                setIsLoading(false);

                // Redirect if the user is not the receiver
                const isReceiver = result.user === userId;

                if (!isReceiver) {
                    toast({
                        title: "Не сте получателя на тази покана.",
                        status: "warning",
                        duration: 3000,
                        isClosable: true,
                        position: "bottom",
                    });
                    navigate("/household-invitations");
                }
            })
            .catch((error) => {
                if (error.status === 401) {
                    logoutHandler();
                } else if (error.status === 404) {
                    setIsLoading(false);
                    setNotFound(true);
                } else {
                    toast({
                        title:
                            error.message || "Неуспешно зареждане на поканата",
                        status: "error",
                        duration: 6000,
                        isClosable: true,
                        position: "bottom",
                    });
                    setIsLoading(false);
                }
            });
    }, [invitationId]);

    if (isLoading) {
        return <Spinner size="lg" />;
    }

    if (notFound) {
        return <HouseholdInvitationNotFound />;
    }

    return (
        <>
            <Card background="white" p="2" boxShadow="xs">
                <HStack mx={4} my={2} alignItems="center" flexWrap="wrap">
                    <Heading as="h1" size="lg" color="themePurple.800" mr="2">
                        {householdInvitation.household.name}
                    </Heading>
                    <AvatarGroup size="md" max={2}>
                        {householdInvitation.household.members.map((member) => (
                            <Avatar
                                key={member._id}
                                name={member.name}
                                src={member.avatar}
                                background={member.avatarColor}
                            />
                        ))}
                    </AvatarGroup>
                </HStack>
            </Card>
            <Card background="white" p="2" boxShadow="xs" mt="2">
                <HStack mx={4} my={2} alignItems="center" flexWrap="wrap">
                    <Heading as="h4" size="sm" color="themePurple.800">
                        Детайли за поканата
                    </Heading>
                </HStack>
                <Text mx={4} my={2}>
                    <Text as="span" fontWeight="bold">
                        Роля в домакинството:
                    </Text>{" "}
                    {householdInvitation.role}{" "}
                </Text>
                <Stack
                    mx={4}
                    my={2}
                    direction={{ base: "column", md: "row" }}
                    alignItems={{ base: "flex-start", md: "center" }}
                    justifyContent={{ base: "center", md: "flex-start" }}
                >
                    <Text fontWeight="bold">Изпратена от: </Text>
                    <HStack>
                        <Avatar
                            name={householdInvitation.creator.name}
                            src={householdInvitation.creator.avatar}
                            background={householdInvitation.creator.avatarColor}
                            size="sm"
                        />
                        <Text>{householdInvitation.creator.name}</Text>
                    </HStack>
                </Stack>
            </Card>
        </>
    );
}
