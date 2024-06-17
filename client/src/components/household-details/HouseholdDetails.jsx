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
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import * as householdService from '../../services/householdService';
import PaidExpenseList from "../paid-expense-list/PaidExpenseList";
import MemberList from "../member/member-list/MemberList";
// import HouseholdNotFound from "../household-not-found/HouseholdNotFound";

export default function HouseholdDetails() {
    const [household, setHousehold] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    
    const { householdId } = useParams();

    useEffect(() => {
        // TODO household not found case
        setIsLoading(true);
        householdService.getOne(householdId)
            .then(result => {
                setHousehold(result);
                setIsLoading(false);
            })
            .catch(err => {
                console.log(err);
                setIsLoading(false);
            });
    }, [householdId]);

    if (isLoading) {
        return <Spinner size="lg" />;
    }

    return (
        <>   
            <Card background="white" p="2" boxShadow="xs">
                <HStack mx={4} my={2} alignItems="center" flexWrap="wrap">
                    <Heading as="h1" size="lg" color="themePurple.800"  mr="2">
                        {household.name}
                    </Heading>
                    <AvatarGroup size="md" max={2}>
                        {household.members.map((member) => (
                            <Avatar
                                key={member.user._id}
                                name={member.user.name}
                                src={member.user.avatar}
                                background={member.user.avatarColor}
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
                        <p>Баланс</p>
                    </TabPanel>
                    <TabPanel>
                        <Tabs isLazy variant="soft-rounded" colorScheme="tabsPurple">
                            <TabList>
                                <Tab sx={{ padding: "0.4rem 0.6rem", marginRight: "0.2rem", fontSize: "1rem" }}>Платени</Tab>
                                <Tab sx={{ padding: "0.4rem 0.6rem", marginRight: "0.2rem", fontSize: "1rem" }}>Неплатени</Tab>
                                <Tab sx={{ padding: "0.4rem 0.6rem", marginRight: "0.2rem", fontSize: "1rem" }}>Периодични</Tab>
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
                        <MemberList/>
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </>
    );
}
