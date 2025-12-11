export const getApiUrl = () => {
    // Check if we have an environment variable set (for production)
    const envUrl = import.meta.env.VITE_API_URL;
    if (envUrl) {
        // Ensure no trailing slash
        return envUrl.endsWith('/') ? envUrl.slice(0, -1) : envUrl;
    }
    // Default to localhost
    return 'http://localhost:8000';
};

export const getWsUrl = () => {
    const apiUrl = getApiUrl();
    // Replace http/https with ws/wss
    if (apiUrl.startsWith('https')) {
        return apiUrl.replace('https', 'wss');
    }
    return apiUrl.replace('http', 'ws');
};
