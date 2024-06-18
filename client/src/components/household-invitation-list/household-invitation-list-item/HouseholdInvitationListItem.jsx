import {
    Stack,
    Button,
    Heading,
    AvatarGroup,
    Avatar,
    Badge,
    Box,
    Card,
    IconButton,
    HStack,
    useDisclosure,
    Text,
} from "@chakra-ui/react";
import { FaCircleCheck, FaCircleXmark, FaEye, FaPen } from "react-icons/fa6";
import { FaSignOutAlt } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import * as householdInvitationService from "../../../services/householdInvitationService";


export default function HouseholdInvitationListItem({
    _id,
    household,
    role,
    creator,
    onRemove
}) {
    const navigate = useNavigate();

    const invitationAcceptHandler = async (_id) => {
        try {
            // Call your service function to accept the invitation
            const householdId = await householdInvitationService.accept(_id);
    
            console.log(`Invitation accepted successfully.`);
            navigate(`/households/${householdId}`);

        } catch (error) {
            console.error('Error accepting invitation:', error);
        }
    };

    const invitationRejectHandler = async (_id) => {
        try {
            // Call your service function to accept the invitation
            const householdId = await householdInvitationService.reject(_id);
    
            console.log(`Invitation rejected successfully.`);

            onRemove(_id);
        } catch (error) {
            console.error('Error rejecting invitation:', error);
        }
    };

    return (
        <>
            <Card
                px="5"
                py="5"
                mx="4"
                my="1"
                boxShadow="md"
                // borderRadius="lg"
                borderTop="4px solid #676F9D"
                background="white"
                spacing="4"
                direction={{ base: "column", md: "row" }}
                justifyContent="space-between"
                alignItems={{ md: "center" }}
            >
                <Stack
                    direction={{ base: "column", md: "row" }}
                    alignItems={{ md: "center" }}
                    spacing={{ base: "2", md: "4" }}
                >
                    <Stack direction="column" spacing={{ base: "1", md: "0" }}>
                        <Heading as="h3" size="md" mb="1">
                            {household.name}
                        </Heading>
                        <HStack>
                            <Text fontWeight="bold">Роля:</Text>
                            <Box display="inline-block">
                                <Badge variant="subtle" colorScheme="gray">
                                    {role}
                                </Badge>
                            </Box>
                        </HStack>
                        <HStack>
                            <Text fontWeight="bold">Създател:</Text>
                            <Text>{creator.email}</Text>
                        </HStack>
                    </Stack>
                </Stack>
                <HStack
                    spacing="0"
                    w={["auto", "auto", "90px"]}
                    justifyContent="flex-end"
                >
                    <IconButton
                        aria-label="Приемете"
                        title="Приемете"
                        icon={<FaCircleCheck fontSize="25px" />}
                        variant="ghost"
                        color="themePurple.800"
                        onClick={() => invitationAcceptHandler(_id)}
                    />
                    <IconButton
                        aria-label="Отхвърлете"
                        title="Отхвърлете"
                        icon={<FaCircleXmark fontSize="25px" />}
                        variant="ghost"
                        color="themePurple.800"
                        onClick={() => invitationRejectHandler(_id)}
                    />
                </HStack>
            </Card>
        </>
    );
}
