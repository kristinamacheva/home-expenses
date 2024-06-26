const buildOptions = (data) => {
    const options = {};

    if (data) {
        options.body = JSON.stringify(data);
        options.headers = {
            "content-type": "application/json",
        };
    }

    // const token = localStorage.getItem('accessToken');

    // if (token) {
    //     options.headers = {
    //         ...options.headers,
    //         'X-Authorization': token
    //     }
    // }

    return options;
};

// TODO: credentials
const request = async (method, url, data) => {
    try {
        const response = await fetch(url, {
            ...buildOptions(data),
            method,
            credentials: "include",
        });

        // 204 - no content
        if (response.status === 204) {
            return {};
        }

        const result = await response.json();

        // TODO: refactor?
        if (!response.ok) {
            const error = {
                status: response.status || 500,
                message: result.message || "Неуспешна заявка",
                errors: result.errors || [],
            };
            // console.log(error);
            throw error;
        }

        return result;
    } catch (error) {
        // Handle network errors or server unreachable scenarios
        if (error instanceof TypeError && error.message === "Failed to fetch") {
            // If fetch failed due to network issues (server down, connection lost, etc.)
            throw new Error(
                "Сървърът е недостъпен. Моля, опитайте отново по-късно."
            );
        } else {
            // For other errors, re-throw the original error for higher-level error handling
            throw error;
        }
    }
};

export const get = request.bind(null, "GET");
export const post = request.bind(null, "POST");
export const put = request.bind(null, "PUT");
export const remove = request.bind(null, "DELETE");
export const patch = request.bind(null, "PATCH");
