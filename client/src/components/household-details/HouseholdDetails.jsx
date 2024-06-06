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
import ExpenseList from "../expense-list/ExpenseList";
// import HouseholdNotFound from "../household-not-found/HouseholdNotFound";

export default function HouseholdDetails() {
    const [household, setHousehold] = useState({});
    
    const { householdId } = useParams();

    useEffect(() => {
        // TODO household not found case
        householdService.getOne(householdId)
            .then(result => {
                setHousehold(result);
            })
            // .catch(err => {
            //     console.log(err);
            // });
    }, [householdId]);

    return (
        <>   
            <Card background="white" p="2" boxShadow="xs">
                <HStack mx={4} my={2} alignItems="center" flexWrap="wrap">
                    <Heading as="h1" size="lg" color="themePurple.800"  mr="2">
                        {household.name}
                    </Heading>
                    <AvatarGroup size="md" max={2}>
                        <Avatar
                            name="Кристина Мачева"
                            background={"themeYellow.900"}
                        />
                        <Avatar
                            name="Мария Иванова"
                            background={"blue.300"}
                        />
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
                                    <ExpenseList />
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
                        <p>Членове</p>
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </>
    );
}
