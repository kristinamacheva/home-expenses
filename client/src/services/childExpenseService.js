import * as request from "../lib/request";

const baseUrl = (householdId) =>
    `http://localhost:5000/households/${householdId}/childExpenses`;

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

export const create = async (householdId, childExpenseData) => {
    const url = baseUrl(householdId);
    const result = await request.post(url, childExpenseData);

    return result;
};
