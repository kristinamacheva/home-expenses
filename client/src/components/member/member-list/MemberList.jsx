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
    Flex,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import * as householdService from "../../../services/householdService";
import { useParams } from "react-router-dom";
import MemberListItem from "./member-list-item/MemberListItem";

export default function MemberList() {
    const [members, setMembers] = useState([]);

    const { householdId } = useParams();

    useEffect(() => {
        householdService
            .getAllMembersDetails(householdId)
            .then((result) => {
                const sortedMembers = result.sort((a, b) => {
                    if (a.user.name < b.user.name) return -1;
                    if (a.user.name > b.user.name) return 1;
                    return 0;
                });
                setMembers(sortedMembers);
            })
            .catch((err) => {
                console.log(err);
            });
    }, [householdId]);

    return (
        <Flex
            mt="4"
            wrap="wrap"
            direction={{ base: "column", lg: "row" }} 
            gap="4"
            align={{ base: "center", lg: "initial" }}
        >
            {members.map((member) => (
                <MemberListItem key={member._id} {...member} />
            ))}
        </Flex>
    );
}
