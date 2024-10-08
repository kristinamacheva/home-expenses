import {
    Avatar,
    AvatarGroup,
    Box,
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
import { useNavigate, useParams } from "react-router-dom";

import * as householdService from "../../services/householdService";
import PaidExpenseList from "../paid-expense-list/PaidExpenseList";
import MemberList from "../member/member-list/MemberList";
import BalanceList from "../balance-list/BalanceList";
import AuthContext from "../../contexts/authContext";
import HouseholdNotFound from "../household-not-found/HouseholdNotFound";
import Statistics from "../statistics/Statistics";
import CategoryList from "../category-list/CategoryList";
import AllowanceList from "../allowance-list/AllowanceList";
import HouseholdChat from "../household-chat/HouseholdChat";
import ChildExpenseList from "../child-expense-list/ChildExpenseList";
import ChildWishlist from "../child-wishlist/ChildWishlist";
import ChildList from "../child-list/ChildList";
import ExpenseTemplateList from "../expense-template-list/ExpenseTemplateList";
import { isChild18OrOver } from "../../utils/ageUtils";
import styles from "./household-details.module.css";

export default function HouseholdDetails() {
    const [household, setHousehold] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const { logoutHandler, userId, birthdate } = useContext(AuthContext);
    const [isAdmin, setIsAdmin] = useState(false);
    const toast = useToast();
    const navigate = useNavigate();

    const { householdId } = useParams();

    useEffect(() => {
        setIsLoading(true);
        householdService
            .getOne(householdId)
            .then((result) => {
                setHousehold(result);

                // Check if the current user is an admin
                setIsAdmin(result.admins.includes(userId));

                setIsLoading(false);

                // Redirect if the user is not a member of the household
                const currentUserMember = result.members.find(
                    (member) => member._id === userId
                );
                if (!currentUserMember) {
                    toast({
                        title: "Не сте член на това домакинство.",
                        status: "warning",
                        duration: 3000,
                        isClosable: true,
                        position: "bottom",
                    });
                    navigate("/households");
                }
            })
            .catch((error) => {
                if (error.status === 401) {
                    logoutHandler();
                } else if (error.status === 404) {
                    setIsLoading(false);
                    setNotFound(true);
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

    if (notFound) {
        return <HouseholdNotFound />;
    }

    // Find the current user's role in the household
    const currentUserMember = household.members.find(
        (member) => member._id === userId
    );
    const currentUserRole = currentUserMember ? currentUserMember.role : null;

    const isUserChildOver18OrRegularUser =
        currentUserRole !== "Дете" ||
        (currentUserRole === "Дете" && isChild18OrOver(birthdate));

    return (
        <>
            <Card
                background="white"
                p="2"
                boxShadow="xs"
                position="relative" // Allow overlay to be positioned absolutely
                _after={
                    household.archived
                        ? {
                              content: `" "`,
                              position: "absolute",
                              top: "0",
                              left: "0",
                              width: "100%",
                              height: "100%",
                              backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent overlay
                              color: "white",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "lg",
                              fontWeight: "bold",
                              borderRadius: "md",
                              zIndex: 1,
                          }
                        : {}
                }
            >
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
                </HStack>
            </Card>

            <Tabs isLazy colorScheme="themePurple" mx="1" mt="4" className={styles.scroll}>
                <Box width="100%" overflowX="auto" p={2}>
                    <TabList >
                        {isUserChildOver18OrRegularUser && (
                            <>
                                <Tab>Баланс</Tab>
                                <Tab>Разходи</Tab>
                                <Tab>Анализ</Tab>
                                <Tab>Категории</Tab>
                                {household.allowances?.length > 0 &&
                                    currentUserRole !== "Дете" && (
                                        <Tab>Деца</Tab>
                                    )}
                                <Tab>Чат</Tab>
                            </>
                        )}
                        {currentUserRole === "Дете" && (
                            <>
                                <Tab>Джобни</Tab>
                                <Tab>Лични разходи</Tab>
                                <Tab>Желания</Tab>
                            </>
                        )}
                        <Tab>Членове</Tab>
                    </TabList>
                </Box>

                <TabPanels>
                    {isUserChildOver18OrRegularUser && (
                        <TabPanel>
                            <BalanceList
                                archived={
                                    household.archived
                                        ? household.archived
                                        : undefined
                                }
                            />
                        </TabPanel>
                    )}
                    {isUserChildOver18OrRegularUser && (
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
                                        Шаблони
                                    </Tab>
                                </TabList>
                                <TabPanels>
                                    <TabPanel px="2" pt="2">
                                        <PaidExpenseList
                                            isAdmin={isAdmin}
                                            archived={
                                                household.archived
                                                    ? household.archived
                                                    : undefined
                                            }
                                        />
                                    </TabPanel>
                                    <TabPanel px="2">
                                        <ExpenseTemplateList
                                            archived={
                                                household.archived
                                                    ? household.archived
                                                    : undefined
                                            }
                                        />
                                    </TabPanel>
                                </TabPanels>
                            </Tabs>
                        </TabPanel>
                    )}
                    {isUserChildOver18OrRegularUser && (
                        <TabPanel>
                            <Statistics />
                        </TabPanel>
                    )}
                    {isUserChildOver18OrRegularUser && (
                        <TabPanel>
                            <CategoryList
                                isAdmin={isAdmin}
                                archived={
                                    household.archived
                                        ? household.archived
                                        : undefined
                                }
                            />
                        </TabPanel>
                    )}
                    {currentUserRole !== "Дете" &&
                        household.allowances?.length > 0 && (
                            <TabPanel>
                                <ChildList
                                    archived={
                                        household.archived
                                            ? household.archived
                                            : undefined
                                    }
                                />
                            </TabPanel>
                        )}
                    {isUserChildOver18OrRegularUser && (
                        <TabPanel>
                            <HouseholdChat />
                        </TabPanel>
                    )}
                    {currentUserRole === "Дете" && (
                        <TabPanel>
                            <AllowanceList />
                        </TabPanel>
                    )}
                    {currentUserRole === "Дете" && (
                        <TabPanel>
                            <ChildExpenseList
                                archived={
                                    household.archived
                                        ? household.archived
                                        : undefined
                                }
                            />
                        </TabPanel>
                    )}
                    {currentUserRole === "Дете" && (
                        <TabPanel>
                            <ChildWishlist
                                archived={
                                    household.archived
                                        ? household.archived
                                        : undefined
                                }
                            />
                        </TabPanel>
                    )}
                    <TabPanel>
                        <MemberList />
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </>
    );
}
