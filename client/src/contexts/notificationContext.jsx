import { createContext, useState, useContext, useEffect } from "react";
import { useToast } from "@chakra-ui/react";
import * as notificationService from "../services/notificationService";
import AuthContext from "./authContext";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const { logoutHandler, socket, isAuthenticated } = useContext(AuthContext);
    const toast = useToast();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (isAuthenticated) {
            console.log("Fetching initial notifications...");
            fetchNotifications();
        }
    }, [isAuthenticated]);

    useEffect(() => {
        if (socket && isAuthenticated) {
            console.log("Setting up socket listener for notifications");
            socket.on("notification", handleNotification);

            return () => {
                console.log("Removing socket listener for notifications");
                socket.off("notification", handleNotification);
            };
        }
    }, [socket, isAuthenticated]);

    useEffect(() => {
        if (!isAuthenticated) {
            console.log("User logged out, clearing notifications");
            setNotifications([]);
        }
    }, [isAuthenticated]);

    const fetchNotifications = () => {
        notificationService
            .getAll()
            .then((result) => {
                setNotifications(result);
                setUnreadCount(result.filter((n) => !n.isRead).length);
            })
            .catch((error) => {
                if (error.status === 401) {
                    logoutHandler();
                } else {
                    toast({
                        title:
                            error.message ||
                            "Неуспешно зареждане на известията",
                        status: "error",
                        duration: 6000,
                        isClosable: true,
                        position: "bottom",
                    });
                }
            });
    };

    const handleNotification = (notification) => {
        console.log("Notification received:", notification);
        setNotifications((prevNotifications) => [
            notification,
            ...prevNotifications,
        ]);
        setUnreadCount((prevCount) => prevCount + 1);

        // Check if you are on the notification page and mark it as read
        if (window.location.pathname === "/notifications") {
            markAllNotificationsAsRead(); 
        }
        
        toast({
            title: "Имате ново известие",
            description: notification.message,
            status: "info",
            duration: 6000,
            isClosable: true,
            position: "bottom",
        });
    };

    const deleteNotification = async (notificationId) => {
        try {
            await notificationService.remove(notificationId);
            setNotifications((prevNotifications) =>
                prevNotifications.filter(
                    (notification) => notification._id !== notificationId
                )
            );
            toast({
                title: "Успешно изтрихте известието",
                status: "success",
                duration: 6000,
                isClosable: true,
                position: "bottom",
            });
        } catch (error) {
            if (error.status === 401) {
                logoutHandler();
            } else {
                toast({
                    title: error.message || "Неуспешно изтриване на известието",
                    status: "error",
                    duration: 6000,
                    isClosable: true,
                    position: "bottom",
                });
            }
        }
    };

    const markAllNotificationsAsRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications((prevNotifications) =>
                prevNotifications.map((n) => ({ ...n, isRead: true }))
            );
            setUnreadCount(0);
        } catch (error) {
            if (error.status === 401) {
                logoutHandler();
            } else {
                toast({
                    title:
                        error.message ||
                        "Неуспешно отбелязване на известията като прочетени",
                    status: "error",
                    duration: 6000,
                    isClosable: true,
                    position: "bottom",
                });
            }
        }
    };

    const values = {
        notifications,
        unreadCount,
        deleteNotification,
        markAllNotificationsAsRead,
    };

    return (
        <NotificationContext.Provider value={values}>
            {children}
        </NotificationContext.Provider>
    );
};

NotificationContext.displayName = "NotificationContext";

export default NotificationContext;
