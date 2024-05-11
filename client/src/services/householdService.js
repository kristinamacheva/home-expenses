import * as request from "../lib/request";

const baseUrl = 'http://localhost:5000/domakinstva';

export const getAll = async () => {
    const result = await request.get(baseUrl);

    return result;
};

export const create = async (householdData) => {
    const result = await request.post(baseUrl, householdData);
    
    return result;
};

