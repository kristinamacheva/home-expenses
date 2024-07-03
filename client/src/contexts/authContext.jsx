import { createContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import Path from "../paths";
import * as authService from "../services/authService";
import usePersistedState from "../hooks/usePersistedState";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();
    const [user, setUser] = usePersistedState("user", {}, "localStorage");
    const socketRef = useRef(null);

    useEffect(() => {
        if (user._id && !socketRef.current) {
            socketRef.current = initializeSocket();
        }

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, [user._id]);

    const initializeSocket = () => {
        const newSocket = io("http://localhost:5000", {
            withCredentials: true,
        });

        newSocket.on("connect", () => {
            console.log(`Connected to socket.io server`);
        });

        newSocket.on("disconnect", () => {
            console.log(`Disconnected from socket.io server`);
        });

        socketRef.current = newSocket;
        return newSocket;
    };

    const loginSubmitHandler = async (values) => {
        const result = await authService.login(values);
        setUser(result);
        initializeSocket();
        navigate(Path.Home);
    };

    const registerSubmitHandler = async (values) => {
        const result = await authService.register(values);
        setUser(result);
        initializeSocket();
        navigate(Path.Home);
    };

    const updateSubmitHandler = async (values) => {
        const result = await authService.update(values);
        setUser(result);
        initializeSocket();
        navigate(Path.Profile);
    };

    const logoutHandler = () => {
        setUser({});
        if (socketRef.current) {
            socketRef.current.disconnect();
            socketRef.current = null;
        }
        navigate(Path.Login);
    };

    const authValues = {
        loginSubmitHandler,
        registerSubmitHandler,
        updateSubmitHandler,
        logoutHandler,
        userId: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        avatarColor: user.avatarColor,
        isAuthenticated: !!user._id,
        socket: socketRef.current,
    };

    return (
        <AuthContext.Provider value={authValues}>
            {children}
        </AuthContext.Provider>
    );
};

AuthContext.displayName = "AuthContext";

export default AuthContext;
