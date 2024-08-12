import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { API_BASE_URL } from "../constants/constants";

const useSocket = (userId) => {
    const [socket, setSocket] = useState(null);

    // If the useEffect dependencies change, React will first call the cleanup function before re-running
    // the effect.
    useEffect(() => {
        if (userId) {
            const newSocket = io(API_BASE_URL, {
                withCredentials: true,
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
            });

            newSocket.on("connect", () => {
                console.log(
                    `Connected to socket.io server with ID: ${newSocket.id}`
                );
                setSocket(newSocket);
            });

            newSocket.on("disconnect", () => {
                console.log("Disconnected from socket.io server");
            });

            newSocket.on("connect_error", (error) => {
                console.error(`Connection error: ${error.message}`);
            });

            newSocket.on("error", (error) => {
                console.error(`Socket error: ${error.message}`);
            });

            return () => {
                newSocket.disconnect();
            };
        }
    }, [userId]);

    return socket;
};

export default useSocket;
