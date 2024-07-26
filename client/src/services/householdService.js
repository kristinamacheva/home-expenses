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

export const getOneChildMembers = async (householdId) => {
    const result = await request.get(
        `${baseUrl}/${householdId}/members?role=child`
    );
    return result;
};

export const getOneMembersDetails = async (householdId) => {
    const result = await request.get(
        `${baseUrl}/${householdId}/members?details=true`
    );
    return result;
};

export const getOnePayees = async (householdId) => {
    const result = await request.get(
        `${baseUrl}/${householdId}/payees`
    );
    return result;
};

export const getOneWithMemberEmails = async (householdId) => {
    const result = await request.get(
        `${baseUrl}/${householdId}/members?details=email`
    );
    return result;
};

export const getAllBalances = async (householdId) => {
    const result = await request.get(
        `${baseUrl}/${householdId}/balances?details=true`
    );

    return result;
};

export const create = async (householdData) => {
    const result = await request.post(baseUrl, householdData);

    return result;
};

export const edit = async (householdId, householdData) => {
    const result = await request.put(
        `${baseUrl}/${householdId}`,
        householdData
    );

    return result;
};

export const leave = async (householdId) => {
    const result = await request.put(`${baseUrl}/${householdId}/leave`);

    return result;
};

export const archive = async (householdId) => {
    const result = await request.put(`${baseUrl}/${householdId}/archive`);

    return result;
};

export const restore = async (householdId) => {
    const result = await request.put(`${baseUrl}/${householdId}/restore`);

    return result;
};
