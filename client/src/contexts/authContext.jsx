import { createContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import usePersistedState from "../hooks/usePersistedState";
import * as authService from "../services/authService";
import Path from "../paths";
import useSocket from "../hooks/useSocket";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();
    const [user, setUser] = usePersistedState("user", {}, "localStorage");
    const socket = useSocket(user._id);

    const loginSubmitHandler = async (values) => {
        const result = await authService.login(values);
        setUser(result);
        navigate(Path.Home);
    };

    const registerSubmitHandler = async (values) => {
        const result = await authService.register(values);
        setUser(result);
        navigate(Path.Home);
    };

    const updateSubmitHandler = async (values) => {
        const result = await authService.update(values);

        const userData = {
            _id: result._id,
            name: result.name,
            email: result.email,
            birthdate: result.birthdate,
            phone: result.phone,
            avatar: result.avatar,
            avatarColor: result.avatarColor,
        };
        setUser(userData);

        navigate(Path.Profile);

        return result;
    };

    const logoutHandler = () => {
        setUser({});
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
        birthdate: user.birthdate,
        phone: user.phone,
        avatar: user.avatar,
        avatarColor: user.avatarColor,
        isAuthenticated: !!user._id,
        socket,
    };

    return (
        <AuthContext.Provider value={authValues}>
            {children}
        </AuthContext.Provider>
    );
};

AuthContext.displayName = "AuthContext";

export default AuthContext;
