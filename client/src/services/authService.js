import { useContext } from "react";
import * as request from "../lib/request";
import AuthContext from "../contexts/authContext";

const baseUrl = "http://localhost:5000/users";

export const login = async ({ email, password }) => {
    try {
        const result = await request.post(`${baseUrl}/login`, {
            email,
            password,
        });

        return result;
    } catch (error) {
        console.error('Login failed:', error);
        console.log(error);

        throw error;
    }
};

export const register = async ({ name, email, phone, password, repeatPassword }) => {
    try {
        const result = await request.post(`${baseUrl}/register`, {
            name,
            email,
            phone,
            password,
            repeatPassword
        });

        return result;
    } catch (error) {
        console.error('Register failed:', error);
        console.log(error);

        throw error;
    }
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
