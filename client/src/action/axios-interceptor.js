import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8080"
});

const excludedRoutes = [
    "/auth/login",
    "/auth/signup",
    "/auth/register",
    "/auth/refresh",
    "/auth/google",
    "/auth/google/callback",
    "/auth/google/success",
    "/auth/google/refresh",
    "/auth/google/logout",
    "/api/place/:placeId",
    "/api/places"
];

const matchRoute = (url, route, method) => {
    if (url === "/api/place/new") {
        return false;
    }
    if (route === "/api/place/:placeId" && method !== "get") {
        return false;
    }
    const routeRegex = new RegExp(`^${route.replace(/:[^\s/]+/g, "([^/]+)")}$`);
    return routeRegex.test(url);
};

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("accessToken");
        console.log(token);
        if (token && !excludedRoutes.some(route => matchRoute(config.url, route, config.method))) {
            config.headers["Authorization"] = `Bearer ${token}`;
            config.withCredentials = true;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;
        console.log(error.response.statusText);
        console.log("error response status", error.response.status);
        if (error.response.status === 500 && !originalRequest._retry) {
            const isExcludedRoute = excludedRoutes.some(route => matchRoute(originalRequest.url, route, originalRequest.method));
            if (isExcludedRoute) {
                return Promise.reject(error);
            }
            originalRequest._retry = true;
            try {
                const refreshToken = localStorage.getItem("refreshToken");
                let response;
                if (localStorage.getItem("provider") === "google") {
                    response = await axios.post(`http://localhost:8080/auth/google/refresh`, {refreshToken: refreshToken}, {withCredentials: true});
                } else {
                    response = await axios.post(`http://localhost:8080/auth/refresh`, {refreshToken: refreshToken}, {withCredentials: true});
                }
                const {accessToken} = response.data;
                localStorage.setItem("accessToken", accessToken);
                localStorage.setItem("expiresAt", (Date.now() + 1000 * 60 * 60 * 24 * 7).toString());
                originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;
                return api(originalRequest);
            } catch (err) {
                return Promise.reject(err);
            }
        }
        return error.response;
    }
);

export default api;