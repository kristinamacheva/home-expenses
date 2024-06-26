// TODO: error handling

const buildOptions = (data) => {
    const options = {};

    if (data) {
        options.body = JSON.stringify(data);
        options.headers = {
            'content-type': 'application/json'
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
}

// TODO: credentials
const request = async (method, url, data) => {
    const response = await fetch(url, {
        ...buildOptions(data),
        method,
        credentials: 'include' 
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
            message: result.message || 'Неуспешна заявка',
            errors: result.errors || []
        };
        // console.log(error);
        throw error;
    }

    return result;
}

export const get = request.bind(null, 'GET');
export const post = request.bind(null, 'POST');
export const put = request.bind(null, 'PUT');
export const remove = request.bind(null, 'DELETE');
export const patch = request.bind(null, 'PATCH');