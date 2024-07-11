import { createContext, useState, useContext, useEffect } from "react";
import { useToast } from "@chakra-ui/react";
import * as notificationService from "../services/notificationService";
import AuthContext from "./authContext";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const { logoutHandler, socket, userId } = useContext(AuthContext);
    const toast = useToast();
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        // Fetch initial notifications if user is authenticated
        if (userId) {
            fetchNotifications();
        }

        // Setup socket event listener
        if (socket) {
            socket.on("notification", handleNotification);
        }

        // Cleanup function
        return () => {
            if (socket) {
                socket.off("notification");
            }
        };
    }, [userId]);

    // Clear notifications when user logs out
    useEffect(() => {
        if (!userId) {
            setNotifications([]);
        }
    }, [userId]);

    const fetchNotifications = () => {
        notificationService
            .getAll()
            .then((result) => setNotifications(result))
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
        setNotifications((prevNotifications) => [
            notification,
            ...prevNotifications,
        ]);
        toast({
            title: "Имате ново известие",
            description: notification.message,
            status: "info",
            duration: 6000,
            isClosable: true,
            position: "bottom",
        });
    };

    const values = {
        notifications,
        // removeNotification
    };

    return (
        <NotificationContext.Provider value={values}>
            {children}
        </NotificationContext.Provider>
    );
};

NotificationContext.displayName = "NotificationContext";

export default NotificationContext;
