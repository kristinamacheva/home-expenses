import * as request from "../lib/request";

const baseUrl = (householdId) =>
    `http://localhost:5000/households/${householdId}/messages`;

export const getAll = async (householdId, page) => {
    const url = `${baseUrl(householdId)}`;

    const result = await request.get(url);
    return result;
};
