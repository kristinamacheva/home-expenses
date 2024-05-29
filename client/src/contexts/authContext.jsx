import { createContext } from "react";
import { useNavigate } from "react-router-dom";

import Path from '../paths';
import * as authService from '../services/authService';
import usePersistedState from "../hooks/usePersistedState";

const AuthContext = createContext();

export const AuthProvider = ({
    children,
}) => {
    const navigate = useNavigate();

    const [user, setUser] = usePersistedState('user', {});

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

    const logoutHandler = () => {
        setUser({});
    }

    //auth state се пропагира през provider-а
    const values = { 
        loginSubmitHandler, 
        registerSubmitHandler,
        logoutHandler,
        userId: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        // isAuthenticated: !!auth.accessToken,
    };

    return (
        <AuthContext.Provider value={values}>
            {children}
        </AuthContext.Provider>
    )
}

AuthContext.displayName = 'AuthContext';

export default AuthContext;