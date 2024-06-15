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
            .then((result) => setMembers(result))
            .catch((err) => {
                console.log(err);
            });
    }, []);

    return (
        <Stack mt="4">
            {members.map((member) => (
                <MemberListItem key={member._id} {...member} />
            ))}
        </Stack>
    );
}
