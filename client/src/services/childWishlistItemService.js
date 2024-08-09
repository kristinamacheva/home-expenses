import * as request from "../lib/request";

const baseUrl = (householdId) =>
    `http://localhost:5000/households/${householdId}/childWishlistItems`;

// params = {} -> handle optional parameters and prevent errors when accessing properties of params
export const getAll = async (householdId, page, childId = null, params = {}) => {
    // Remove empty string parameters
    Object.keys(params).forEach(
        (key) => params[key] === "" && delete params[key]
    );

    const queryParams = new URLSearchParams({
        page,
        ...params,
    });

    // Conditionally add childId to the query parameters if it exists
    if (childId) {
        queryParams.append("childId", childId);
    }

    const url = `${baseUrl(householdId)}?${queryParams.toString()}`;

    const result = await request.get(url);
    return result;
};

export const create = async (householdId, childWishlistItemData) => {
    const url = baseUrl(householdId);
    const result = await request.post(url, childWishlistItemData);

    return result;
};

export const getOne = async (householdId, childWishlistItemId) => {
    const url = baseUrl(householdId);
    const result = await request.get(`${url}/${childWishlistItemId}`);

    return result;
};

export const getEditableFields = async (householdId, childWishlistItemId) => {
    const url = baseUrl(householdId);
    const result = await request.get(
        `${url}/${childWishlistItemId}?editable=true`
    );

    return result;
};

export const purchase = async (householdId, childWishlistItemId) => {
    const url = baseUrl(householdId);
    await request.put(`${url}/${childWishlistItemId}/purchase`);
};

export const edit = async (
    householdId,
    childWishlistItemId,
    childWishlistItemData
) => {
    const url = baseUrl(householdId);
    await request.put(`${url}/${childWishlistItemId}`, childWishlistItemData);
};

export const remove = async (householdId, childWishlistItemId) => {
    const url = baseUrl(householdId);
    await request.remove(`${url}/${childWishlistItemId}`);
};
