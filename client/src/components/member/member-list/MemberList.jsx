import { Flex, useToast } from "@chakra-ui/react";
import { useContext, useEffect, useState } from "react";
import * as householdService from "../../../services/householdService";
import { useParams } from "react-router-dom";
import MemberListItem from "./member-list-item/MemberListItem";
import AuthContext from "../../../contexts/authContext";

export default function MemberList() {
    const [members, setMembers] = useState([]);
    const { logoutHandler } = useContext(AuthContext);
    const toast = useToast();

    const { householdId } = useParams();

    useEffect(() => {
        householdService
            .getOneMembersDetails(householdId)
            .then((result) => {
                const sortedMembers = result.sort((a, b) => {
                    if (a.name < b.name) return -1;
                    if (a.name > b.name) return 1;
                    return 0;
                });
                setMembers(sortedMembers);
            })
            .catch((error) => {
                if (error.status === 401) {
                    logoutHandler();
                } else {
                    toast({
                        title:
                            error.message ||
                            "Неуспешно зареждане на членовете на домакинството",
                        status: "error",
                        duration: 6000,
                        isClosable: true,
                        position: "bottom",
                    });
                }
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
                <MemberListItem key={member._id} user={member} />
            ))}
        </Flex>
    );
}
