import { API_BASE_URL } from "../constants/constants";
import * as request from "../lib/request";

const baseUrl = `${API_BASE_URL}/users/reminders`;

export const getAll = async () => {
    const result = await request.get(baseUrl);

    return result;
};

export const create = async (reminderData) => {
    const result = await request.post(baseUrl, reminderData);

    return result;
};

export const remove = async (reminderId) => {
    await request.remove(`${baseUrl}/${reminderId}`);
};
