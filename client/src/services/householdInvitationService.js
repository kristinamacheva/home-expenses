import * as request from "../lib/request";

const baseUrl = 'http://localhost:5000/household-invitations';

export const getAll = async () => {
    const result = await request.get(baseUrl);

    return result;
};

export const accept = async (invitationId) => {
    try {
        const householdId = await request.remove(`${baseUrl}/${invitationId}/accept`);
        return householdId;
    } catch (error) {
        console.error('Error accepting invitation:', error);
        throw error;
    }
};

export const reject = async (invitationId) => {
    try {
        const result = await request.remove(`${baseUrl}/${invitationId}/reject`);
        return result;
    } catch (error) {
        console.error('Error rejecting invitation:', error);
        throw error;
    }
};
