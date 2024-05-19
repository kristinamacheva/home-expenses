import * as request from "../lib/request";

const baseUrl = "http://localhost:5000/potrebiteli";

export const login = async (email, password) => {
    const result = await request.post(`${baseUrl}/vhod`, {
        email,
        password,
    });

    return result;
};

export const register = async (newUser) => {
    const result = await request.post(`${baseUrl}/registraciq`, newUser);
    return result;
};

// export const logout = () => request.get(`${baseUrl}/izhod`);
