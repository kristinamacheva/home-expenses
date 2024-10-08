import { API_BASE_URL } from "../constants/constants";
import * as request from "../lib/request";

const baseUrl = (householdId) =>
    `${API_BASE_URL}/households/${householdId}/payments`;

// params = {} -> handle optional parameters and prevent errors when accessing properties of params
export const getAll = async (householdId, page, params = {}) => {
    // Remove empty string parameters
    Object.keys(params).forEach(
        (key) => params[key] === "" && delete params[key]
    );

    const queryParams = new URLSearchParams({
        page,
        ...params,
    });

    const url = `${baseUrl(householdId)}?${queryParams.toString()}`;

    const result = await request.get(url);
    return result;
};

export const create = async (householdId, paymentData) => {
    const url = baseUrl(householdId);
    const result = await request.post(url, paymentData);

    return result;
};

export const getOneWithBalance = async (householdId, paymentId) => {
    const url = baseUrl(householdId);
    const result = await request.get(`${url}/${paymentId}?balance=true`);

    return result;
};

export const getOneDetails = async (householdId, paymentId) => {
    const url = baseUrl(householdId);
    const result = await request.get(`${url}/${paymentId}?details=all`);

    return result;
};

export const accept = async (householdId, paymentId) => {
    const url = baseUrl(householdId);
    const result = await request.put(`${url}/${paymentId}/accept`);

    return result;
};

export const reject = async (householdId, paymentId, text) => {
    const url = baseUrl(householdId);
    const result = await request.put(`${url}/${paymentId}/reject`, {
        text,
    });

    return result;
};

export const addComment = async (householdId, paymentId, text) => {
    const url = baseUrl(householdId);
    const result = await request.post(`${url}/${paymentId}/comments`, {
        text,
    });

    return result;
};

export const edit = async (householdId, paymentId, paymentData) => {
    const url = baseUrl(householdId);
    const result = await request.put(`${url}/${paymentId}`, paymentData);

    return result;
};

export const remove = async (householdId, paymentId) => {
    const url = baseUrl(householdId);
    const result = await request.remove(`${url}/${paymentId}`);
};
