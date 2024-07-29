import * as request from "../lib/request";

const baseUrl = "http://localhost:5000/users/notifications";

export const getAll = async () => {
    const result = await request.get(baseUrl);

    return result;
};

export const markAllAsRead = async () => {
    await request.put(`${baseUrl}/markAllAsRead`);
};

export const remove = async (notificationId) => {
    await request.remove(`${baseUrl}/${notificationId}`);
};