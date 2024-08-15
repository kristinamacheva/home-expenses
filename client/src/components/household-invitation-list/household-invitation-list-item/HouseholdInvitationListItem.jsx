import {
    Stack,
    Heading,
    Badge,
    Box,
    Card,
    IconButton,
    HStack,
    Text,
    useToast,
} from "@chakra-ui/react";
import { FaCircleCheck, FaCircleXmark, FaEye} from "react-icons/fa6";
import { Link, useNavigate } from "react-router-dom";
import * as householdInvitationService from "../../../services/householdInvitationService";
import { useContext } from "react";
import AuthContext from "../../../contexts/authContext";

export default function HouseholdInvitationListItem({
    _id,
    household,
    role,
    creator,
    onRemove,
}) {
    const navigate = useNavigate();
    const toast = useToast();
    const { logoutHandler } = useContext(AuthContext);

    const invitationAcceptHandler = async (_id) => {
        try {
            const { householdId } = await householdInvitationService.accept(
                _id
            );

            toast({
                title: "Успешно приехте поканата",
                status: "success",
                duration: 6000,
                isClosable: true,
                position: "bottom",
            });

            navigate(`/households/${householdId}`);
        } catch (error) {
            if (error.status === 401) {
                logoutHandler();
            } else {
                toast({
                    title: error.message || "Неуспешно приемане на поканата",
                    status: "error",
                    duration: 6000,
                    isClosable: true,
                    position: "bottom",
                });
            }
        }
    };

    const invitationRejectHandler = async (_id) => {
        try {
            await householdInvitationService.reject(_id);

            toast({
                title: "Успешно отхвърлихте поканата",
                status: "success",
                duration: 6000,
                isClosable: true,
                position: "bottom",
            });

            onRemove(_id);
        } catch (error) {
            if (error.status === 401) {
                logoutHandler();
            } else {
                toast({
                    title: error.message || "Неуспешно отхвърляне на поканата",
                    status: "error",
                    duration: 6000,
                    isClosable: true,
                    position: "bottom",
                });
            }
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
                        as={Link}
                        to={`/household-invitations/${_id}`}
                        aria-label="Детайли"
                        title="Детайли"
                        icon={<FaEye fontSize="20px" />}
                        variant="ghost"
                        color="themePurple.800"
                    />
                    <IconButton
                        aria-label="Приемете"
                        title="Приемете"
                        icon={<FaCircleCheck fontSize="20px" />}
                        variant="ghost"
                        color="themePurple.800"
                        onClick={() => invitationAcceptHandler(_id)}
                    />
                    <IconButton
                        aria-label="Отхвърлете"
                        title="Отхвърлете"
                        icon={<FaCircleXmark fontSize="20px" />}
                        variant="ghost"
                        color="themePurple.800"
                        onClick={() => invitationRejectHandler(_id)}
                    />
                </HStack>
            </Card>
        </>
    );
}
