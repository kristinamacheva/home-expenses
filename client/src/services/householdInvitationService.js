import { API_BASE_URL } from "../constants/constants";
import * as request from "../lib/request";

const baseUrl = `${API_BASE_URL}/household-invitations`;

export const getAll = async () => {
    const result = await request.get(baseUrl);

    return result;
};

export const accept = async (invitationId) => {
    const householdId = await request.remove(
        `${baseUrl}/${invitationId}/accept`
    );
    return householdId;
};

export const reject = async (invitationId) => {
    const result = await request.remove(`${baseUrl}/${invitationId}/reject`);
    return result;
};
