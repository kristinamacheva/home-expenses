import { API_BASE_URL } from "../constants/constants";
import * as request from "../lib/request";

const baseUrl = (householdId) =>
    `${API_BASE_URL}/households/${householdId}/allowances`;

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
