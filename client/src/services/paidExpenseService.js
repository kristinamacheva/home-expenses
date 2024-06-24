import * as request from "../lib/request";

// TODO: throw errors
const baseUrl = (householdId) =>
    `http://localhost:5000/households/${householdId}/paidExpenses`;

export const getAll = async (householdId) => {
    const url = baseUrl(householdId);
    const result = await request.get(url);
    return result;
};

export const create = async (householdId, paidExpenseData) => {
    // console.log("service");
    // console.log(paidExpenseData);
    const url = baseUrl(householdId);
    const result = await request.post(url, paidExpenseData);

    return result;
};

export const getOneDetails = async (householdId, paidExpenseId) => {
    try {
        const url = baseUrl(householdId);
        const result = await request.get(`${url}/${paidExpenseId}?details=all`);

        return result;
    } catch (error) {
        console.error("Error fetching paid expense data:", error);
        return null;
    }
};

export const accept = async (householdId, paidExpenseId) => {
    try {
        const url = baseUrl(householdId);
        const result = await request.put(`${url}/${paidExpenseId}/accept`);

        return result;
    } catch (error) {
        console.error("Error accepting paid expense", error);
        return null;
    }
};

export const reject = async (householdId, paidExpenseId) => {
    try {
        const url = baseUrl(householdId);
        const result = await request.put(`${url}/${paidExpenseId}/reject`);

        return result;
    } catch (error) {
        console.error("Error rejecting paid expense", error);
        return null;
    }
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
