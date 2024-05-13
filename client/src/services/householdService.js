import * as request from "../lib/request";

const baseUrl = 'http://localhost:5000/domakinstva';

export const getAll = async () => {
    const result = await request.get(baseUrl);

    return result;
};

export const getOne = async (householdId) => {
    try {
        const result = await request.get(`${baseUrl}/${householdId}`);
        return result;
    } catch (error) {
        console.error('Error fetching household data:', error);
        return null; 
    }
}

export const getOneReducedData = async (householdId) => {
    try {
        const result = await request.get(`${baseUrl}/${householdId}/reduced`);
        return result;
    } catch (error) {
        console.error('Error fetching household data:', error);
        return null; 
    }
}

export const create = async (householdData) => {
    const result = await request.post(baseUrl, householdData);
    
    return result;
};

