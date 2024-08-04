import * as request from "../lib/request";

const baseUrl = "http://localhost:5000/users/reminders";

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
