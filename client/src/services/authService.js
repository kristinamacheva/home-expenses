import * as request from "../lib/request";

const baseUrl = "http://localhost:5000/potrebiteli";

export const login = async (email, password) => {
    const result = await request.post(`${baseUrl}/vhod`, {
        email,
        password,
    });

    return result;
};

export const register = (name, email, phone, password) => {
    request.post(`${baseUrl}/registraciq`, {
        name,
        email,
        phone,
        password,
    });
};

// export const logout = () => request.get(`${baseUrl}/izhod`);
