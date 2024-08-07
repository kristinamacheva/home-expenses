import React, { useContext } from "react";
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
import { MdGroupAdd } from "react-icons/md";
import { FaHouse, FaPeopleRoof } from "react-icons/fa6";
import { LuClipboardList } from "react-icons/lu";
import Path from "../../paths";
import AuthContext from "../../contexts/authContext";
import NotificationContext from "../../contexts/notificationContext";

const LinkItems = [
    { name: "Начало", icon: FaHouse, to: Path.Home },
    { name: "Домакинства", icon: FaPeopleRoof, to: Path.HouseholdList },
    { name: "Покани", icon: MdGroupAdd, to: Path.HouseholdInvitations },
];

const SidebarContent = ({ onClose, ...rest }) => {
    return (
        <Box
            as="nav"
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
                    bg: "themePurple.900",
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
    const { name, avatar, avatarColor } = useContext(AuthContext);
    const { unreadCount } = useContext(NotificationContext);

    return (
        <Flex
            px={{ base: 4, md: 4 }}
            height="20"
            alignItems="center"
            bg={useColorModeValue("themePurple.800")}
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
                    color: useColorModeValue("themePurple.900"),
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

            <HStack spacing={{ base: "2", md: "2" }} alignItems={"center"}>
                <IconButton
                    as={Link}
                    to={Path.Reminders}
                    size="xs"
                    variant="ghost"
                    aria-label="open reminders"
                    icon={
                        <LuClipboardList fontSize="18px"/>
                    }
                    color={useColorModeValue("white")}
                    _hover={{
                        color: useColorModeValue("green.800"),
                        bg: useColorModeValue("white"),
                    }}
                />
                <IconButton
                    as={Link}
                    to={Path.Notifications}
                    size="xs"
                    variant="ghost"
                    aria-label="open notifications"
                    mr={2}
                    icon={
                        <Box position="relative">
                            <FiBell fontSize="18px"/>
                            {unreadCount > 0 && (
                                <Box
                                    position="absolute"
                                    top="-1"
                                    right="-1"
                                    width="2"
                                    height="2"
                                    borderRadius="full"
                                    bg="green.500"
                                />
                            )}
                        </Box>
                    }
                    color={useColorModeValue("white")}
                    _hover={{
                        color: useColorModeValue("green.800"),
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
                                    name={name}
                                    src={avatar}
                                    background={avatarColor}
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
                                        {name}
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
                            <Link to={Path.Profile}>
                                <MenuItem>Профил</MenuItem>
                            </Link>
                            <MenuDivider />
                            <Link to={Path.Logout}>
                                <MenuItem>Изход</MenuItem>
                            </Link>
                        </MenuList>
                    </Menu>
                </Flex>
            </HStack>
        </Flex>
    );
};

export default function Sidebar({ children }) {
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
}
