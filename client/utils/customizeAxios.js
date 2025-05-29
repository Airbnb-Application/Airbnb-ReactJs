import axios from "axios";

const instance = axios.create({
    baseURL: "http://localhost:8080",
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
    //withCredentials: true
});

export default instance;

instance.interceptors.request.use(
    async function (config) {
        // Do something before request is sent
        let accessToken = localStorage.getItem("accessToken");
        if (accessToken) {
            const expires_in = localStorage.getItem("expiresAt");
            if (expires_in * 1000 < new Date.getTime()) {
                const refreshToken = localStorage.getItem("refreshToken");
                const provider = localStorage.getItem("provider");
                if (provider) {
                    accessToken = await axios.post("http://localhost:8080/auth/google/refresh", {refreshToken}, {withCredentials: true})
                        .then((response) => {
                            const {accessToken, expires_in} = response.data;
                            console.log('Google refresh');
                            localStorage.setItem("accessToken", accessToken);
                            localStorage.setItem("expiresAt", expires_in);
                            return accessToken;
                        })
                        .catch((error) => {
                            console.log(error);
                        });
                } else {
                    accessToken = await axios.post("http://localhost:8080/auth/refresh", {refreshToken})
                        .then((response) => {
                            const {accessToken, expires_in} = response.data;
                            console.log('jwt refresh')
                            localStorage.setItem("accessToken", accessToken);
                            localStorage.setItem("expiresAt", expires_in);
                            return accessToken;
                        })
                        .catch((error) => {
                            console.log(error);
                        });
                }

            }
            config.headers.Authorization = 'Bearer ' + accessToken

        }
        return config;
    },
    function (error) {
        // Do something with request error
        return Promise.reject(error);
    }
);

// instance.axios.response.use(
//   function (response) {
//     return response;
//   },
//   function (error) {
//     const provider = localStorage.getItem("provider");
//     if (error.response.status === 401 || error.response.status === 403) {
//       if (provider) {
//         const refreshToken = localStorage.getItem("refreshToken");
//         axios
//           .post(
//             "http://localhost:8080/auth/google/refresh",
//             { refreshToken },
//             { withCredentials: true }
//           )
//           .then((response) => {
//             const { accessToken, expires_in, token_type } = response.data;
//             console.log("Google refresh");
//             localStorage.setItem("accessToken", accessToken);
//             localStorage.setItem("expiresAt", expires_in);
//             console.log(response.data)
//           })
//           .catch((error) => {
//             console.log(error);
//           });
//       } else {
//         const refreshToken = localStorage.getItem("refreshToken");
//         axios
//           .post("http://localhost:8080/auth/refresh", { refreshToken })
//           .then((response) => {
//             const { accessToken, expires_in, token_type } = response.data;
//             localStorage.setItem("accessToken", accessToken);
//             localStorage.setItem("expiresAt", expires_in);
//             console.log(response.data)
//           })
//           .catch((error) => {
//             console.log(error);
//           });
//       }
//     }
//     return Promise.reject(error);
//   }
// );
