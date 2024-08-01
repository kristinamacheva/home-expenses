import * as request from "../lib/request";

const baseUrl = (householdId) =>
    `http://localhost:5000/households/${householdId}/messages`;

export const getAll = async (householdId, lastMessageId = null) => {
    let url = `${baseUrl(householdId)}`;

    // Use lastMessageId if provided for cursor-based pagination
    if (lastMessageId) {
        url += `?lastMessageId=${lastMessageId}`;
    } 

    const result = await request.get(url);
    return result;
};