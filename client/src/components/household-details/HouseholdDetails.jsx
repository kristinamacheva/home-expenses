import {
    Avatar,
    AvatarGroup,
    Card,
    HStack,
    Heading,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
} from "@chakra-ui/react";
import { useState } from "react";
import { Outlet, useParams } from "react-router-dom";
import ExpenseList from "../expense-list/ExpenseList";
// import ExpenseList from "../expense-list/ExpenseList";

export default function HouseholdDetails() {
    const { householdId } = useParams();

    const [households, setHouseholds] = useState([
        {
            _id: "1",
            name: "Съквартиранти",
            members: [
                { userId: "1", role: "admin" },
                { userId: "2", role: "member" },
            ],
            balance: [
                { userId: "1", sum: 60, type: "+" },
                { userId: "2", sum: 60, type: "-" },
            ],
            admin: "1",
        },
        {
            _id: "2",
            name: "Вкъщи",
            members: [
                { userId: "1", role: "member" },
                { userId: "2", role: "member" },
                { userId: "3", role: "admin" },
            ],
            balance: [
                { userId: "1", sum: 30, type: "-" },
                { userId: "2", sum: 30, type: "-" },
                { userId: "3", sum: 60, type: "+" },
            ],
            admin: "3",
        },
        {
            _id: "3",
            name: "Обмен",
            members: [
                { userId: "1", role: "member" },
                { userId: "2", role: "admin" },
            ],
            balance: [
                { userId: "1", sum: 0, type: "+" },
                { userId: "2", sum: 0, type: "+" },
            ],
            admin: "2",
        },
    ]);

    const currentHousehold = households.filter(
        (household) => household._id === householdId
    )[0];

    console.log(currentHousehold);

    return (
        <>   
            <Card background="white" p="2" boxShadow="xs">
                <HStack mx={4} my={2} alignItems="center">
                    <Heading as="h1" size="lg" color="themePurple.800">
                        {currentHousehold.name}
                    </Heading>
                    <AvatarGroup size="md" max={2} ml="2">
                        <Avatar
                            name="Ryan Florence"
                            background={"themeYellow.900"}
                        />
                        <Avatar
                            name="Segun Adebayo"
                            src="https://bit.ly/sage-adebayo"
                        />
                        <Avatar
                            name="Kent Dodds"
                            src="https://bit.ly/kent-c-dodds"
                        />
                    </AvatarGroup>
                    {/* <Spacer />
                    <Button variant="primary">Редактиране</Button> */}
                </HStack>
            </Card>

            <Tabs isLazy colorScheme="themePurple" mx="1" mt="4">
                <TabList>
                    <Tab>Разходи</Tab>
                    <Tab>Баланс</Tab>
                    <Tab>Членове</Tab>
                </TabList>

                <TabPanels>
                    <TabPanel>
                        <Tabs isLazy variant="soft-rounded" colorScheme="tabsPurple">
                            <TabList>
                                <Tab>Платени</Tab>
                                <Tab>Неплатени</Tab>
                                <Tab>Периодични</Tab>
                            </TabList>
                            <TabPanels>
                                <TabPanel>
                                    <ExpenseList />
                                </TabPanel>
                                <TabPanel>
                                    <p>Неплатени</p>
                                </TabPanel>
                                <TabPanel>
                                    <p>Периодични</p>
                                </TabPanel>
                            </TabPanels>
                        </Tabs>
                    </TabPanel>
                    <TabPanel>
                        <p>Баланс</p>
                    </TabPanel>
                    <TabPanel>
                        <p>Членове</p>
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </>
    );
}
