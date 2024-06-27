import {
    Avatar,
    AvatarGroup,
    Card,
    HStack,
    Heading,
    Spinner,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    useToast,
} from "@chakra-ui/react";
import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import * as householdService from "../../services/householdService";
import PaidExpenseList from "../paid-expense-list/PaidExpenseList";
import MemberList from "../member/member-list/MemberList";
import BalanceList from "../balance-list/BalanceList";
import AuthContext from "../../contexts/authContext";
// import HouseholdNotFound from "../household-not-found/HouseholdNotFound";

export default function HouseholdDetails() {
    // TODO: load all details here and pass as props or make seperate requests
    const [household, setHousehold] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const { logoutHandler } = useContext(AuthContext);
    const toast = useToast();

    const { householdId } = useParams();

    useEffect(() => {
        setIsLoading(true);
        householdService
            .getOne(householdId)
            .then((result) => {
                setHousehold(result);
                setIsLoading(false);
            })
            .catch((error) => {
                if (error.status === 401) {
                    logoutHandler();
                } else {
                    toast({
                        title:
                            error.message ||
                            "Неуспешно зареждане на домакинството",
                        status: "error",
                        duration: 6000,
                        isClosable: true,
                        position: "bottom",
                    });
                    setIsLoading(false);
                }
            });
    }, [householdId]);

    if (isLoading) {
        return <Spinner size="lg" />;
    }

    return (
        <>
            <Card background="white" p="2" boxShadow="xs">
                <HStack mx={4} my={2} alignItems="center" flexWrap="wrap">
                    <Heading as="h1" size="lg" color="themePurple.800" mr="2">
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
                    {/* <Spacer />
                    <Button variant="primary">Редактиране</Button> */}
                </HStack>
            </Card>

            <Tabs isLazy colorScheme="themePurple" mx="1" mt="4">
                <TabList>
                    <Tab>Баланс</Tab>
                    <Tab>Разходи</Tab>
                    <Tab>Членове</Tab>
                </TabList>

                <TabPanels>
                    <TabPanel>
                        <BalanceList />
                    </TabPanel>
                    <TabPanel>
                        <Tabs
                            isLazy
                            variant="soft-rounded"
                            colorScheme="tabsPurple"
                        >
                            <TabList>
                                <Tab
                                    sx={{
                                        padding: "0.4rem 0.6rem",
                                        marginRight: "0.2rem",
                                        fontSize: "1rem",
                                    }}
                                >
                                    Платени
                                </Tab>
                                <Tab
                                    sx={{
                                        padding: "0.4rem 0.6rem",
                                        marginRight: "0.2rem",
                                        fontSize: "1rem",
                                    }}
                                >
                                    Неплатени
                                </Tab>
                                <Tab
                                    sx={{
                                        padding: "0.4rem 0.6rem",
                                        marginRight: "0.2rem",
                                        fontSize: "1rem",
                                    }}
                                >
                                    Периодични
                                </Tab>
                            </TabList>
                            <TabPanels>
                                <TabPanel px="2" pt="2">
                                    <PaidExpenseList />
                                </TabPanel>
                                <TabPanel px="2">
                                    <p>Неплатени</p>
                                </TabPanel>
                                <TabPanel px="2">
                                    <p>Периодични</p>
                                </TabPanel>
                            </TabPanels>
                        </Tabs>
                    </TabPanel>
                    <TabPanel>
                        <MemberList />
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </>
    );
}
