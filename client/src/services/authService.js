import { useContext } from "react";
import * as request from "../lib/request";
import AuthContext from "../contexts/authContext";

const baseUrl = "http://localhost:5000/users";

export const login = async ({ email, password }) => {
    const result = await request.post(`${baseUrl}/login`, {
        email,
        password,
    });

    return result;
};

export const register = async ({ name, email, phone, password, repeatPassword }) => {
    const result = await request.post(`${baseUrl}/register`, {
        name,
        email,
        phone,
        password,
        repeatPassword
    });
    
    return result;
};

export const getProfile = async () => {
    const result = await request.get(`${baseUrl}/profile`);

    return result;
};

export const update = async ({ avatar, name, email, phone, oldPassword, password, repeatPassword }) => {
    const result = await request.put(`${baseUrl}/profile`, {
        avatar,
        name,
        email,
        phone,
        oldPassword,
        password,
        repeatPassword
    });
    
    return result;
};

export const logout = () => request.get(`${baseUrl}/logout`);
