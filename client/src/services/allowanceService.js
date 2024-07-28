import * as request from "../lib/request";

const baseUrl = (householdId) =>
    `http://localhost:5000/households/${householdId}/allowances`;

export const getAll = async (householdId, page) => {
    const url = `${baseUrl(householdId)}?page=${page}`;

    const result = await request.get(url);
    return result;
};

export const getOne = async (householdId, allowanceId) => {
    const url = baseUrl(householdId);
    const result = await request.get(`${url}/${allowanceId}`);

    return result;
};
