import * as request from "../lib/request";

// TODO: throw errors
const baseUrl = (householdId) =>
    `http://localhost:5000/households/${householdId}/paidExpenses`;

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

export const getTotalAmountStats = async (householdId, searchValues) => {
    const url = `${baseUrl(householdId)}`;

    const result = await request.get(
        `${url}/statistics?type=totalAmount&startDate=${searchValues.startDate}&endDate=${searchValues.endDate}`
    );
    return result;
};

export const getTotalAmountByCategoryStats = async (householdId, searchValues) => {
    const url = `${baseUrl(householdId)}`;

    const result = await request.get(
        `${url}/statistics?type=totalAmountByCategory&startDate=${searchValues.startDate}&endDate=${searchValues.endDate}`
    );
    return result;
};

export const getTotalAmountAndCountStats = async (householdId, searchValues) => {
    const url = `${baseUrl(householdId)}`;

    const result = await request.get(
        `${url}/statistics?type=getTotalAmountAndCountStats&startDate=${searchValues.startDate}&endDate=${searchValues.endDate}`
    );
    return result;
};

export const create = async (householdId, paidExpenseData) => {
    const url = baseUrl(householdId);
    const result = await request.post(url, paidExpenseData);

    return result;
};

export const getOneDetails = async (householdId, paidExpenseId) => {
    const url = baseUrl(householdId);
    const result = await request.get(`${url}/${paidExpenseId}?details=all`);

    return result;
};

export const getEditableFields = async (householdId, paidExpenseId) => {
    const url = baseUrl(householdId);
    const result = await request.get(`${url}/${paidExpenseId}?editable=true`);

    return result;
};

export const accept = async (householdId, paidExpenseId) => {
    const url = baseUrl(householdId);
    const result = await request.put(`${url}/${paidExpenseId}/accept`);

    return result;
};

export const reject = async (householdId, paidExpenseId, text) => {
    const url = baseUrl(householdId);
    const result = await request.put(`${url}/${paidExpenseId}/reject`, {
        text,
    });

    return result;
};

export const addComment = async (householdId, paidExpenseId, text) => {
    const url = baseUrl(householdId);
    const result = await request.post(`${url}/${paidExpenseId}/comments`, {
        text,
    });

    return result;
};

export const remove = async (householdId, paidExpenseId) => {
    const url = baseUrl(householdId);
    const result = await request.remove(`${url}/${paidExpenseId}`);
};

// export const edit = async (householdId, householdData) => {
//     const result = await request.put(`${baseUrl}/${householdId}`, householdData);

//     return result;
// };
