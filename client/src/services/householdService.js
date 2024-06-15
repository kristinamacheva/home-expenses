import * as request from "../lib/request";

const baseUrl = 'http://localhost:5000/households';

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

export const getAllNonChildMembers = async (householdId) => {
    try {
        const result = await request.get(`${baseUrl}/${householdId}/non-child-members`);
        console.log(result);
        return result;
    } catch (error) {
        console.error('Error fetching non-child members data:', error);
        return null; 
    }
}

export const getAllMembersDetails = async (householdId) => {
    try {
        const result = await request.get(`${baseUrl}/${householdId}/members/details`);
        console.log(result);
        return result;
    } catch (error) {
        console.error('Error fetching members details:', error);
        return null; 
    }
}

export const create = async (householdData) => {
    const result = await request.post(baseUrl, householdData);
    
    return result;
};

export const edit = async (householdId, householdData) => {
    const result = await request.put(`${baseUrl}/${householdId}`, householdData);

    return result;
};

export const remove = async (householdId) => request.remove(`${baseUrl}/${householdId}`);

