import { useContext, useEffect, useState } from "react";
import {
    useToast,
    Select,
    TabPanel,
    TabPanels,
    Tabs,
    TabList,
    Tab,
} from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import AuthContext from "../../contexts/authContext";
import * as householdService from "../../services/householdService";
import ChildWishlist from "../child-wishlist/ChildWishlist";
import { isChildUnder14 } from "../../utils/ageUtils";
import ChildExpenseList from "../child-expense-list/ChildExpenseList";

export default function ChildList({ archived }) {
    const [childMembers, setChildMembers] = useState([]);
    const [selectedChild, setSelectedChild] = useState(null);
    const { logoutHandler } = useContext(AuthContext);
    const { householdId } = useParams();
    const toast = useToast();

    useEffect(() => {
        householdService
            .getOneChildMembers(householdId)
            .then((result) => setChildMembers(result))
            .catch((error) => {
                if (error.status === 401) {
                    logoutHandler();
                } else {
                    toast({
                        title:
                            error.message ||
                            "Неуспешно зареждане на децата на домакинството",
                        status: "error",
                        duration: 6000,
                        isClosable: true,
                        position: "bottom",
                    });
                }
            });
    }, []);

    // Function to handle child member selection
    const handleChildSelection = (e) => {
        const selectedChildId = e.target.value;
        const selectedChildObject = childMembers.find(
            (child) => child._id === selectedChildId
        );
        setSelectedChild(selectedChildObject);
    };

    return (
        <>
            <Select
                mb={{ base: 2, md: 4 }}
                maxW={{ lg: "49%" }}
                name="childMember"
                value={selectedChild ? selectedChild._id : ""}
                onChange={handleChildSelection}
                placeholder="Изберете дете"
            >
                {childMembers.map((child) => (
                    <option key={child._id} value={child._id}>
                        {child.email}
                    </option>
                ))}
            </Select>
            {selectedChild && (
                <TabPanel>
                    <Tabs
                        isLazy
                        variant="soft-rounded"
                        colorScheme="tabsPurple"
                    >
                        <TabList mb={2}>
                            <Tab
                                sx={{
                                    padding: "0.4rem 0.6rem",
                                    marginRight: "0.2rem",
                                    fontSize: "1rem",
                                }}
                            >
                                Желания
                            </Tab>
                            {isChildUnder14(selectedChild.birthdate) && (
                                <Tab
                                    sx={{
                                        padding: "0.4rem 0.6rem",
                                        marginRight: "0.2rem",
                                        fontSize: "1rem",
                                    }}
                                >
                                    Лични разходи
                                </Tab>
                            )}
                        </TabList>
                        <TabPanels>
                            <TabPanel px="2" pt="2">
                                <ChildWishlist
                                    archived={archived}
                                    childId={selectedChild._id}
                                />
                            </TabPanel>
                            {isChildUnder14(selectedChild.birthdate) && (
                                <TabPanel px="2" pt="2">
                                    <ChildExpenseList
                                        archived={archived}
                                        childId={selectedChild._id}
                                    />
                                </TabPanel>
                            )}
                        </TabPanels>
                    </Tabs>
                </TabPanel>
            )}
        </>
    );
}
