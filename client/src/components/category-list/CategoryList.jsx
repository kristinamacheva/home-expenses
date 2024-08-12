import {
    Flex,
    useToast,
    Button,
    useDisclosure,
    Stack,
    Spinner,
} from "@chakra-ui/react";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import * as categoryService from "../../services/categoryService";
import { useParams } from "react-router-dom";
import AuthContext from "../../contexts/authContext";
import CategoryCreate from "./category-create/CategoryCreate";
import CategoryListItem from "./category-list-item/CategoryListItem";

export default function CategoryList({ isAdmin, archived }) {
    const [categories, setCategories] = useState([]);
    const { logoutHandler } = useContext(AuthContext);
    const [isLoading, setIsLoading] = useState(false);
    const [index, setIndex] = useState(2); // Page index starts at 2
    const [hasMore, setHasMore] = useState(false); // Track if there are more items
    const toast = useToast();
    const loaderRef = useRef(null);

    const { householdId } = useParams();

    useEffect(() => {
        fetchCategories();
    }, [householdId]);

    const fetchCategories = useCallback(async () => {
        setIsLoading(true);

        try {
            const { data, hasMore: newHasMore } =
                await categoryService.getAllDetails(householdId, 1);

            setCategories(data);
            setHasMore(newHasMore);
            setIndex(2);
        } catch (error) {
            if (error.status === 401) {
                logoutHandler();
            } else {
                toast({
                    title: "Грешка.",
                    description:
                        error.message || "Неуспешно зареждане на категориите.",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            }
        }

        setIsLoading(false);
    }, [householdId]);

    const fetchMoreCategories = useCallback(async () => {
        if (isLoading || !hasMore) return;

        setIsLoading(true);

        try {
            const { data, hasMore: newHasMore } =
                await categoryService.getAllDetails(householdId, index);
            setCategories((state) => [...state, ...data]);
            setHasMore(newHasMore);
        } catch (error) {
            if (error.status === 401) {
                logoutHandler();
            } else {
                toast({
                    title: "Грешка.",
                    description:
                        error.message || "Неуспешно зареждане на категориите.",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            }
        }

        setIndex((prevIndex) => prevIndex + 1);

        setIsLoading(false);
    }, [isLoading, hasMore, index]);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            const target = entries[0];
            if (target.isIntersecting) {
                fetchMoreCategories();
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
    }, [fetchMoreCategories]);

    const {
        isOpen: isCreateModalOpen,
        onOpen: onOpenCreateModal,
        onClose: onCloseCreateModal,
    } = useDisclosure();

    return (
        <>
            <Flex justify="flex-end" mb="3" mx="1">
                <Button
                    variant="primary"
                    onClick={onOpenCreateModal}
                    isDisabled={archived}
                >
                    + Създаване
                </Button>
            </Flex>
            <Stack>
                {categories.map((category) => (
                    <CategoryListItem
                        key={category._id}
                        category={category}
                        fetchCategories={fetchCategories}
                        isAdmin={isAdmin}
                        archived={archived}
                    />
                ))}
            </Stack>
            <Stack ref={loaderRef} p="2">
                {isLoading && <Spinner />}
            </Stack>
            {isCreateModalOpen && (
                <CategoryCreate
                    isOpen={isCreateModalOpen}
                    onClose={onCloseCreateModal}
                    fetchCategories={fetchCategories}
                />
            )}
        </>
    );
}
