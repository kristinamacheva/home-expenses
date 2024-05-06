import React from "react";
import { Link, Outlet } from "react-router-dom";
import {
    IconButton,
    Avatar,
    Box,
    CloseButton,
    Flex,
    HStack,
    VStack,
    Icon,
    useColorModeValue,
    Text,
    Drawer,
    DrawerContent,
    useDisclosure,
    Menu,
    MenuButton,
    MenuDivider,
    MenuItem,
    MenuList,
} from "@chakra-ui/react";
import { FiMenu, FiBell, FiChevronDown } from "react-icons/fi";

import { FaHouse, FaPeopleRoof, FaList } from "react-icons/fa6";
import Path from "../../paths";

const LinkItems = [
    { name: "Начало", icon: FaHouse, to: Path.Home },
    { name: "Домакинства", icon: FaPeopleRoof, to: Path.HouseholdList },
    { name: "Категории разходи", icon: FaList, to: "/expense-categories" },
];

const SidebarContent = ({ onClose, ...rest }) => {
    return (
        <Box
            transition="3s ease"
            bg={useColorModeValue("white")}
            borderRight="1px"
            borderRightColor={useColorModeValue("gray.200")}
            w={{ base: "full", md: 60 }}
            pos="fixed"
            h="full"
            {...rest}
        >
            <Flex
                h="20"
                alignItems="center"
                mx="8"
                justifyContent="space-between"
            >
                <Text fontSize="2xl" fontFamily="monospace" fontWeight="bold">
                    Домоводител
                </Text>
                <CloseButton
                    display={{ base: "flex", md: "none" }}
                    onClick={onClose}
                />
            </Flex>
            {LinkItems.map((link) => (
                <NavItem key={link.name} icon={link.icon} to={link.to}>
                    {link.name}
                </NavItem>
            ))}
        </Box>
    );
};

const NavItem = ({ icon, children, to, ...rest }) => {
    return (
        <Link to={to} style={{ textDecoration: "none" }}>
            <Flex
                align="center"
                p="4"
                mx="4"
                borderRadius="lg"
                role="group"
                cursor="pointer"
                _hover={{
                    bg: "themeBlue.900",
                    color: "white",
                }}
                {...rest}
            >
                {icon && (
                    <Icon
                        mr="4"
                        fontSize="16"
                        _groupHover={{
                            color: "white",
                        }}
                        as={icon}
                    />
                )}
                {children}
            </Flex>
        </Link>
    );
};

const MobileNav = ({ onOpen, ...rest }) => {
    return (
        <Flex
            px={{ base: 4, md: 4 }}
            height="20"
            alignItems="center"
            bg={useColorModeValue("themeBlue.800")}
            borderBottomWidth="1px"
            borderBottomColor={useColorModeValue("gray.200")}
            justifyContent={{ base: "space-between", md: "flex-end" }}
            {...rest}
        >
            <IconButton
                display={{ base: "flex", md: "none" }}
                onClick={onOpen}
                variant="outline"
                aria-label="open menu"
                icon={<FiMenu />}
                color={useColorModeValue("white")}
                bg="transparent"
                _hover={{
                    color: useColorModeValue("themeBlue.900"),
                    bg: useColorModeValue("white"),
                }}
            />

            <Text
                display={{ base: "flex", md: "none" }}
                fontSize="2xl"
                fontFamily="monospace"
                fontWeight="bold"
                color={useColorModeValue("white")}
            >
                Домоводител
            </Text>

            <HStack spacing={{ base: "0", md: "6" }}>
                <IconButton
                    size="lg"
                    variant="ghost"
                    aria-label="open menu"
                    icon={<FiBell />}
                    color={useColorModeValue("white")}
                    bg="transparent"
                    _hover={{
                        color: useColorModeValue("themeBlue.900"),
                        bg: useColorModeValue("white"),
                    }}
                />
                <Flex alignItems={"center"}>
                    <Menu>
                        <MenuButton
                            py={2}
                            transition="all 0.3s"
                            _focus={{ boxShadow: "none" }}
                        >
                            <HStack>
                                <Avatar
                                    size={"sm"}
                                    src={
                                        "https://images.unsplash.com/photo-1619946794135-5bc917a27793?ixlib=rb-0.3.5&q=80&fm=jpg&crop=faces&fit=crop&h=200&w=200&s=b616b2c5b373a80ffc9636ba24f7a4a9"
                                    }
                                />
                                <VStack
                                    display={{ base: "none", md: "flex" }}
                                    alignItems="flex-start"
                                    spacing="1px"
                                    ml="2"
                                >
                                    <Text
                                        fontSize="sm"
                                        color={useColorModeValue("white")}
                                        fontWeight="semibold"
                                    >
                                        Кристина Мачева
                                    </Text>
                                </VStack>
                                <Box
                                    display={{ base: "none", md: "flex" }}
                                    color={useColorModeValue("white")}
                                >
                                    <FiChevronDown />
                                </Box>
                            </HStack>
                        </MenuButton>
                        <MenuList
                            bg={useColorModeValue("white")}
                            borderColor={useColorModeValue("gray.200")}
                        >
                            <Link to="/profile">
                                <MenuItem>Профил</MenuItem>
                            </Link>
                            <Link to="/settings">
                                <MenuItem>Настройки</MenuItem>
                            </Link>
                            <MenuDivider />
                            <Link to="/logout">
                                <MenuItem>Изход</MenuItem>
                            </Link>
                        </MenuList>
                    </Menu>
                </Flex>
            </HStack>
        </Flex>
    );
};

export default function Sidebar({children}) {
    const { isOpen, onOpen, onClose } = useDisclosure();

    return (
        <Box minH="100vh" bg={useColorModeValue("gray.100")}>
            <SidebarContent
                onClose={onClose}
                display={{ base: "none", md: "block" }}
            />
            <Drawer
                isOpen={isOpen}
                placement="left"
                onClose={onClose}
                returnFocusOnClose={false}
                onOverlayClick={onClose}
                size="full"
            >
                <DrawerContent>
                    <SidebarContent onClose={onClose} />
                </DrawerContent>
            </Drawer>
            <MobileNav onOpen={onOpen} />
            <Box ml={{ base: 0, md: 60 }} p="4">
                <Outlet />
            </Box>
        </Box>
    );
};

