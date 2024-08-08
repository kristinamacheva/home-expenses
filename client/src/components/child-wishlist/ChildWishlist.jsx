import { useContext, useEffect, useState, useRef, useCallback } from "react";
import {
    Button,
    Checkbox,
    Flex,
    FormControl,
    FormLabel,
    Heading,
    Input,
    Card,
    Spinner,
    Stack,
    Text,
    useDisclosure,
    useToast,
} from "@chakra-ui/react";
import * as householdService from "../../services/householdService";
import * as childWishlistItemService from "../../services/childWishlistItemService";
import { useParams } from "react-router-dom";
import AuthContext from "../../contexts/authContext";
import ChildWishlistItem from "./child-wishlist-item/ChildWishlistItem";
import ChildWishlistItemCreate from "./child-wishlist-item-create/ChildWishlistItemCreate";

const initialSearchValues = {
    title: "",
    purchased: true,
    notPurchased: true,
};

export default function ChildWishlist({ isAdmin, archived }) {
    const [childAllowance, setChildAllowance] = useState([]);
    const [childWishlistItems, setChildWishlistItems] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [index, setIndex] = useState(2); // Page index starts at 2
    const [hasMore, setHasMore] = useState(false); // Track if there are more items
    const [searchValues, setSearchValues] = useState(initialSearchValues);
    const { logoutHandler } = useContext(AuthContext);
    const toast = useToast();

    const loaderRef = useRef(null);
    const { householdId } = useParams();
    const {
        isOpen: isCreateModalOpen,
        onOpen: onOpenCreateModal,
        onClose: onCloseCreateModal,
    } = useDisclosure();

    useEffect(() => {
        getOneChildAllowance();
        fetchChildWishlistItems();
    }, []);

    const getOneChildAllowance = () => {
        householdService
            .getOneChildAllowance(householdId)
            .then((result) => {
                setChildAllowance(result);
            })
            .catch((error) => {
                if (error.status === 401) {
                    logoutHandler();
                } else {
                    toast({
                        title:
                            error.message || "Неуспешно зареждане на джобните",
                        status: "error",
                        duration: 6000,
                        isClosable: true,
                        position: "bottom",
                    });
                }
            });
    };

    const fetchChildWishlistItems = useCallback(
        async (reset = false) => {
            setIsLoading(true);

            try {
                let updatedSearchValues = searchValues;
                if (reset) {
                    updatedSearchValues = initialSearchValues;
                    setSearchValues(initialSearchValues);
                }

                const { data, hasMore: newHasMore } =
                    await childWishlistItemService.getAll(
                        householdId,
                        1,
                        updatedSearchValues
                    );

                setChildWishlistItems(data);
                setHasMore(newHasMore);
                setIndex(2);
            } catch (error) {
                if (error.status === 401) {
                    logoutHandler();
                } else {
                    toast({
                        title: "Грешка.",
                        description:
                            error.message ||
                            "Неуспешно зареждане на желанията.",
                        status: "error",
                        duration: 5000,
                        isClosable: true,
                    });
                }
            }

            setIsLoading(false);
        },
        [householdId, searchValues]
    );

    const fetchMoreChildWishlistItems = useCallback(async () => {
        if (isLoading || !hasMore) return;

        setIsLoading(true);

        try {
            const { data, hasMore: newHasMore } =
                await childWishlistItemService.getAll(
                    householdId,
                    index,
                    searchValues
                );
            setChildWishlistItems((state) => [...state, ...data]);
            setHasMore(newHasMore);
        } catch (error) {
            if (error.status === 401) {
                logoutHandler();
            } else {
                toast({
                    title: "Грешка.",
                    description:
                        error.message || "Неуспешно зареждане на желанията.",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            }
        }

        setIndex((prevIndex) => prevIndex + 1);

        setIsLoading(false);
    }, [isLoading, hasMore, index, searchValues]);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            const target = entries[0];
            if (target.isIntersecting) {
                fetchMoreChildWishlistItems();
            }
        });

        if (loaderRef.current) {
            observer.observe(loaderRef.current);
        }

        return () => {
            if (loaderRef.current) {
                observer.unobserve(loaderRef.current);
            }
        };
    }, [fetchMoreChildWishlistItems]);

    const removeChildWishlistItemFromState = (childWishlistItemId) => {
        setChildWishlistItems((prevChildWishlistItem) =>
            prevChildWishlistItem.filter(
                (childWishlistItem) =>
                    childWishlistItem._id !== childWishlistItemId
            )
        );

        getOneChildAllowance();
    };

    const onChange = (e) => {
        setSearchValues((state) => ({
            ...state,
            [e.target.name]: e.target.value,
        }));
    };

    const onSubmit = (e) => {
        e.preventDefault();
        fetchChildWishlistItems();
    };

    return (
        <Stack>
            <Card
                px="5"
                py="5"
                boxShadow="md"
                background="white"
                spacing="4"
                direction="column"
                justifyContent="center"
                alignItems="center"
            >
                <Heading as="h4" size="md">
                    Налични джобни: {childAllowance} лв.
                </Heading>
            </Card>
            <Flex justify="flex-end" mb="3" mx="1" mt="2">
                <Button
                    variant="primary"
                    onClick={onOpenCreateModal}
                    isDisabled={archived}
                >
                    + Създаване
                </Button>
            </Flex>
            <form onSubmit={onSubmit}>
                <Text fontWeight="bold" fontSize="lg">
                    Търсене
                </Text>
                <Stack
                    spacing={{ base: "2", lg: "4" }}
                    direction={{ base: "column", lg: "row" }}
                >
                    <FormControl id="title" maxW={{ lg: "49%" }}>
                        <FormLabel>Заглавие на желание</FormLabel>
                        <Input
                            size="md"
                            type="search"
                            name="title"
                            value={searchValues.title || ""}
                            onChange={onChange}
                            placeholder="Въведете заглавие"
                        />
                    </FormControl>

                    <Stack
                        spacing="4"
                        direction="row"
                        mt={{ base: "2", lg: "8" }}
                    >
                        <Checkbox
                            colorScheme="themePurple.400"
                            name="purchased"
                            isChecked={searchValues.purchased}
                            onChange={() =>
                                setSearchValues((state) => ({
                                    ...state,
                                    purchased: !state.purchased,
                                }))
                            }
                        >
                            Закупено
                        </Checkbox>
                        <Checkbox
                            colorScheme="themePurple.400"
                            name="notPurchased"
                            isChecked={searchValues.notPurchased}
                            onChange={() =>
                                setSearchValues((state) => ({
                                    ...state,
                                    notPurchased: !state.notPurchased,
                                }))
                            }
                        >
                            Незакупено
                        </Checkbox>
                    </Stack>
                </Stack>

                <Flex justify="flex-end" my="3" mx="1">
                    <Button variant="primary" type="submit">
                        Търсене
                    </Button>
                </Flex>
            </form>

            <Stack>
                {Array.isArray(childWishlistItems) &&
                childWishlistItems.length > 0 ? (
                    childWishlistItems.map((childWishlistItem) => (
                        <ChildWishlistItem
                            key={childWishlistItem._id}
                            {...childWishlistItem}
                            fetchChildWishlistItems={fetchChildWishlistItems}
                            getAllowanceForUser={getOneChildAllowance}
                            onRemove={removeChildWishlistItemFromState}
                            childAllowance={childAllowance}
                            archived={archived}
                        />
                    ))
                ) : (
                    <Flex justifyContent="center" alignItems="center">
                        <Text>Няма налични желания</Text>
                    </Flex>
                )}
            </Stack>

            <Stack ref={loaderRef} p="2">
                {isLoading && <Spinner />}
            </Stack>
            {isCreateModalOpen && (
                <ChildWishlistItemCreate
                    isOpen={isCreateModalOpen}
                    onClose={onCloseCreateModal}
                    fetchChildWishlistItems={fetchChildWishlistItems}
                />
            )}
        </Stack>
    );
}
