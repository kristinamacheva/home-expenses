import { API_BASE_URL } from "../constants/constants";
import * as request from "../lib/request";

const baseUrl = `${API_BASE_URL}/households`;

export const getOne = async (householdId) => {
    const result = await request.get(`${baseUrl}/${householdId}`);
    return result;
};

export const getOneNonChildMembers = async (householdId) => {
    const result = await request.get(
        `${baseUrl}/${householdId}/members?role=not-child`
    );
    return result;
};

export const getOneNonChildAndOver18Members = async (householdId) => {
    const result = await request.get(
        `${baseUrl}/${householdId}/members?role=not-child-and-over-18`
    );
    return result;
};

export const getOneChildMembers = async (householdId) => {
    const result = await request.get(
        `${baseUrl}/${householdId}/members?role=child`
    );
    return result;
};

export const getOneMembers = async (householdId) => {
    const result = await request.get(`${baseUrl}/${householdId}/members`);
    return result;
};

export const getOneMembersDetails = async (householdId) => {
    const result = await request.get(
        `${baseUrl}/${householdId}/members?details=true`
    );
    return result;
};

export const getOnePayees = async (householdId) => {
    const result = await request.get(`${baseUrl}/${householdId}/payees`);
    return result;
};

export const getOnePayers = async (householdId) => {
    const result = await request.get(`${baseUrl}/${householdId}/payers`);
    return result;
};

export const getOneWithMemberEmails = async (householdId) => {
    const result = await request.get(
        `${baseUrl}/${householdId}/members?details=email`
    );
    return result;
};

export const getOneChildAllowance = async (householdId, childId = null) => {
    let url = `${baseUrl}/${householdId}/allowance`;

    // Add childId as a query parameter if it exists
    if (childId) {
        const queryParams = new URLSearchParams({ childId });
        url = `${url}?${queryParams.toString()}`;
    }

    const result = await request.get(url);
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
