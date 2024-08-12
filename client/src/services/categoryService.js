import { API_BASE_URL } from "../constants/constants";
import * as request from "../lib/request";

const baseUrl = (householdId) =>
    `${API_BASE_URL}/households/${householdId}/categories`;

export const getAll = async (householdId) => {
    const url = `${baseUrl(householdId)}`;

    const result = await request.get(url);
    return result;
};

export const getAllDetails = async (householdId, page) => {
    const url = `${baseUrl(householdId)}?page=${page}&details=true`;

    const result = await request.get(url);
    return result;
};

export const getOne = async (householdId, categoryId) => {
    const url = `${baseUrl(householdId)}/${categoryId}`;

    const result = await request.get(url);
    return result;
};

export const create = async (householdId, categoryData) => {
    const url = baseUrl(householdId);
    const result = await request.post(url, categoryData);

    return result;
};

export const edit = async (householdId, categoryId, categoryData) => {
    const url = baseUrl(householdId);
    const result = await request.put(`${url}/${categoryId}`, categoryData);

    return result;
};

export const remove = async (householdId, categoryId) => {
    const url = baseUrl(householdId);
    await request.remove(`${url}/${categoryId}`);
};
