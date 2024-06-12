import * as request from "../lib/request";

const baseUrl = (householdId) => `http://localhost:5000/households/${householdId}/paidExpenses`;

export const getAll = async (householdId) => {
    const url = baseUrl(householdId);
    const result = await request.get(url);
    return result;
};

