import { API_BASE_URL } from "../constants/constants";
import * as request from "../lib/request";

const baseUrl = (householdId) =>
    `${API_BASE_URL}/households/${householdId}/expenseTemplates`;

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

export const create = async (householdId, expenseTemplateData) => {
    const url = baseUrl(householdId);
    const result = await request.post(url, expenseTemplateData);

    return result;
};

export const getOne = async (householdId, expenseTemplateId) => {
    const url = baseUrl(householdId);
    const result = await request.get(`${url}/${expenseTemplateId}`);

    return result;
};

export const getEditableFields = async (householdId, expenseTemplateId) => {
    const url = baseUrl(householdId);
    const result = await request.get(
        `${url}/${expenseTemplateId}?editable=true`
    );

    return result;
};

export const edit = async (
    householdId,
    expenseTemplateId,
    expenseTemplateData
) => {
    const url = baseUrl(householdId);
    const result = await request.put(
        `${url}/${expenseTemplateId}`,
        expenseTemplateData
    );

    return result;
};

export const remove = async (householdId, expenseTemplateId) => {
    const url = baseUrl(householdId);
    await request.remove(`${url}/${expenseTemplateId}`);
};
