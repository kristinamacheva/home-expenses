import * as request from "../lib/request";

const baseUrl = "http://localhost:5000/households";

// export const getAll = async () => {
//     const result = await request.get(baseUrl);

//     return result;
// };

export const getOne = async (householdId) => {
    const result = await request.get(`${baseUrl}/${householdId}`);
    return result;
};

// export const getOneReducedData = async (householdId) => {
//     try {
//         const result = await request.get(`${baseUrl}/${householdId}/reduced`);
//         return result;
//     } catch (error) {
//         console.error("Error fetching household data:", error);
//         return null;
//     }
// };

export const getOneNonChildMembers = async (householdId) => {
    const result = await request.get(
        `${baseUrl}/${householdId}/members?role=not-child`
    );
    return result;
};

export const getOneMembersDetails = async (householdId) => {
    const result = await request.get(
        `${baseUrl}/${householdId}/members?details=true`
    );
    return result;
};

export const getAllBalancesDetails = async (householdId) => {
    try {
        const result = await request.get(
            `${baseUrl}/${householdId}/balances?details=true`
        );
        console.log(result);
        return result;
    } catch (error) {
        console.error("Error fetching balances details:", error);
        return null;
    }
};

export const create = async (householdData) => {
    const result = await request.post(baseUrl, householdData);

    return result;
};

// export const edit = async (householdId, householdData) => {
//     const result = await request.put(
//         `${baseUrl}/${householdId}`,
//         householdData
//     );

//     return result;
// };

export const leave = async (householdId) => {
    const result = await request.put(`${baseUrl}/${householdId}/leave`);

    return result;
};

// export const remove = async (householdId) =>
//     request.remove(`${baseUrl}/${householdId}`);
