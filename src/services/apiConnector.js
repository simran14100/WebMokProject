// API Connector service for making HTTP requests
const BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:4000";

export const apiConnector = async (method, url, bodyData = null, headers = {}) => {
    try {
        const requestConfig = {
            method: method,
            headers: {
                "Content-Type": "application/json",
                ...headers,
            },
        };

        // Add body data for POST, PUT, PATCH requests
        if (bodyData) {
            requestConfig.body = JSON.stringify(bodyData);
        }

        // Add authorization header if token exists
        const token = localStorage.getItem("token");
        if (token) {
            requestConfig.headers.Authorization = `Bearer ${token}`;
        }

        // Construct the full URL - if BASE_URL already includes /api/v1, don't duplicate it
        let fullUrl;
        if (BASE_URL.includes('/api/v1')) {
            // Remove /api/v1 from BASE_URL and add the full endpoint
            const baseWithoutApi = BASE_URL.replace('/api/v1', '');
            fullUrl = `${baseWithoutApi}${url}`;
        } else {
            fullUrl = `${BASE_URL}${url}`;
        }

        const response = await fetch(fullUrl, requestConfig);
        const data = await response.json();

        // Handle different response status codes
        if (!response.ok) {
            throw new Error(data.message || `HTTP error! status: ${response.status}`);
        }

        return data;
    } catch (error) {
        console.error("API Connector Error:", error);
        throw error;
    }
};

// File upload API connector
export const fileUploadConnector = async (method, url, formData, headers = {}) => {
    try {
        const requestConfig = {
            method: method,
            headers: {
                ...headers,
            },
            body: formData,
        };

        // Add authorization header if token exists
        const token = localStorage.getItem("token");
        if (token) {
            requestConfig.headers.Authorization = `Bearer ${token}`;
        }

        // Construct the full URL - if BASE_URL already includes /api/v1, don't duplicate it
        let fullUrl;
        if (BASE_URL.includes('/api/v1')) {
            // Remove /api/v1 from BASE_URL and add the full endpoint
            const baseWithoutApi = BASE_URL.replace('/api/v1', '');
            fullUrl = `${baseWithoutApi}${url}`;
        } else {
            fullUrl = `${BASE_URL}${url}`;
        }

        const response = await fetch(fullUrl, requestConfig);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || `HTTP error! status: ${response.status}`);
        }

        return data;
    } catch (error) {
        console.error("File Upload API Connector Error:", error);
        throw error;
    }
};

// Utility function to handle API errors
export const handleApiError = (error) => {
    if (error.response) {
        // Server responded with error status
        return error.response.data.message || "Something went wrong";
    } else if (error.request) {
        // Request was made but no response received
        return "Network error. Please check your connection.";
    } else {
        // Something else happened
        return error.message || "An unexpected error occurred";
    }
}; 