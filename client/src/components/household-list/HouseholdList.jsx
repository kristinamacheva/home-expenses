import { useState } from "react";
import HouseholdListItem from "./household-list-item/HouseholdListItem";
import { Button, HStack, Heading, Spacer, VStack, Stack } from "@chakra-ui/react";
import { Link } from "react-router-dom";

export default function HouseholdList() {
    const [households, setHouseholds] = useState([
        {
            "_id": "1",
            "name": "Съквартиранти",
            "members": [{ "userId": "1", "role": "admin" }, { "userId": "2", "role": "member" }],
            "balance": [{ "userId": "1", "sum": "100", "type": "+" }, { "userId": "2", "sum": "100", "type": "-" }],
            "admin": "1"
        },
        {
            "_id": "2",
            "name": "Вкъщи",
            "members": [{ "userId": "1", "role": "member" }, { "userId": "2", "role": "member" }, { "userId": "3", "role": "admin" }],
            "balance": [{ "userId": "1", "sum": "30", "type": "+" }, { "userId": "2", "sum": "30", "type": "-" }, { "userId": "3", "sum": "60", "type": "+" }],
            "admin": "3"
        }
    ]);
    
    return (
        <Stack>
            <HStack mx={4} my={2} alignItems="center">
                <Heading as="h1" size='lg' color="themeBlue.800">Домакинства</Heading>
                <Spacer />
                <Button as={Link} to={`/domakinstva/suzdavane`} variant="primary">
                    + Създаване
            </Button>
            </HStack>
            <Stack>
            {households.map(household => (
                <HouseholdListItem key={household._id} {...household}/>
            ))}
            </Stack>
            

        </Stack>

        
    );
}
