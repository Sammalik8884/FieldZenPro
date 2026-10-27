import axios from "axios";

// Create Axios Instance
export const apiClient = axios.create({
    baseURL: import.meta.env.PROD ? "/api" : (import.meta.env.VITE_API_URL || "http://localhost:5269/api"),
    headers: {
        "Content-Type": "application/json",
    },
});

// Request Interceptor: Attach JWT Token
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor: Handle Unauthorized errors and auto-refresh token
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Do not intercept login/register failures
        if (originalRequest.url?.includes("/Auth/")) {
            return Promise.reject(error);
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            // Attempt silent auto-refresh only if we have stored credentials
            const savedCredsStr = localStorage.getItem("erp_creds");
            if (savedCredsStr) {
                try {
                    const creds = JSON.parse(atob(savedCredsStr));
                    const apiUrl = import.meta.env.PROD ? "/api" : (import.meta.env.VITE_API_URL || "http://localhost:5269/api");
                    // Add a 5-second timeout so the refresh can't hang forever
                    const res = await axios.post(`${apiUrl}/Auth/login`, creds, { timeout: 5000 });

                    if (res.data?.token) {
                        localStorage.setItem("token", res.data.token);
                        originalRequest.headers.Authorization = `Bearer ${res.data.token}`;
                        return apiClient(originalRequest);
                    }
                } catch {
                    // Refresh failed — fall through to logout
                }
            }

            // Clear everything and redirect immediately
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            localStorage.removeItem("erp_creds");

            if (window.location.pathname !== "/login") {
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    }
);
