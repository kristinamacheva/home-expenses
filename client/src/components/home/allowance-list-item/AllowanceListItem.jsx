import {
    Stack,
    Heading,
    Avatar,
    Badge,
    Box,
    Card,
    Button,
    AvatarGroup,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

export default function AllowanceListItem({ household }) {
    const navigate = useNavigate();

    // Function to handle navigation to household details
    const goToHouseholdDetails = () => {
        navigate(`/households/${household._id}`);
    };

    return (
        <Card
            px="5"
            py="5"
            boxShadow="md"
            background="white"
            spacing="4"
            alignItems="center"
            justifyContent="center"
            width="280px"
            minHeight="210px"
        >
            <Stack spacing="3" alignItems="center">
                <Heading
                    as="h4"
                    size="md"
                    color="themePurple.800"
                    textAlign="center"
                >
                    {household.name}
                </Heading>
                <AvatarGroup size="md" max={2}>
                    {household.members.map((member) => (
                        <Avatar
                            key={member._id}
                            name={member.name}
                            src={member.avatar}
                            background={member.avatarColor}
                        />
                    ))}
                </AvatarGroup>
                <Box>
                    <Badge variant="subtle" colorScheme="green">
                        Имате налични {household.allowances.sum.toFixed(2)} лв.
                    </Badge>
                </Box>
                <Button onClick={goToHouseholdDetails}>Детайли</Button>
            </Stack>
        </Card>
    );
}
