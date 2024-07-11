import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

const useSocket = (userId) => {
    const socketRef = useRef(null);

    useEffect(() => {
        if (userId && !socketRef.current) {
            socketRef.current = initializeSocket();
        }

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, [userId]);

    const initializeSocket = () => {
        const socket = io("http://localhost:5000", {
            withCredentials: true,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        socket.on("connect", () => {
            console.log(`Connected to socket.io server with ID: ${socket.id}`);
        });

        socket.on("disconnect", () => {
            console.log(`Disconnected from socket.io server`);
        });

        socket.on("connect_error", (error) => {
            console.error(`Connection error: ${error.message}`);
        });

        socket.on("error", (error) => {
            console.error(`Socket error: ${error.message}`);
        });

        return socket;
    };

    return socketRef.current;
};

export default useSocket;
