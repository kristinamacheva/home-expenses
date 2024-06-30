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

    console.log(url);
    const result = await request.get(
        `${url}/statistics?type=totalAmount&startDate=${searchValues.startDate}&endDate=${searchValues.endDate}`
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

// export const getOne = async (householdId) => {
//     try {
//         const result = await request.get(`${baseUrl}/${householdId}`);
//         return result;
//     } catch (error) {
//         console.error('Error fetching household data:', error);
//         return null;
//     }
// }

// export const getOneReducedData = async (householdId) => {
//     try {
//         const result = await request.get(`${baseUrl}/${householdId}/reduced`);
//         return result;
//     } catch (error) {
//         console.error('Error fetching household data:', error);
//         return null;
//     }
// }

// export const create = async (householdData) => {
//     const result = await request.post(baseUrl, householdData);

//     return result;
// };

// export const edit = async (householdId, householdData) => {
//     const result = await request.put(`${baseUrl}/${householdId}`, householdData);

//     return result;
// };

// export const remove = async (householdId) => request.remove(`${baseUrl}/${householdId}`);

// export const getComments = async (householdId, paidExpenseId) => {
//     const url = baseUrl(householdId);
//     const result = await request.get(`${url}/${paidExpenseId}/comments`);

//     return result;
// };