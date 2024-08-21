import { API_BASE_URL } from "../constants/constants";
import * as request from "../lib/request";

const baseUrl = (householdId) =>
    `${API_BASE_URL}/households/${householdId}/childExpenses`;

// params = {} -> handle optional parameters and prevent errors when accessing properties of params
export const getAll = async (
    householdId,
    page,
    childId = null,
    params = {}
) => {
    // Remove empty string parameters
    Object.keys(params).forEach(
        (key) => params[key] === "" && delete params[key]
    );

    const queryParams = new URLSearchParams({
        page,
        ...params,
    });

    // Conditionally add childId to the query parameters if it exists
    if (childId) {
        queryParams.append("childId", childId);
    }

    const url = `${baseUrl(householdId)}?${queryParams.toString()}`;

    const result = await request.get(url);
    return result;
};

export const create = async (householdId, childExpenseData) => {
    const url = baseUrl(householdId);
    const result = await request.post(url, childExpenseData);

    return result;
};
