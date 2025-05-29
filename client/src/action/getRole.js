import axios from "axios";
import api from "./axios-interceptor.js";

const checkRole = async (token) => {
    try {
        // const response = await axios.get("http://localhost:8080/api/admin/check-role", {
        //     headers: {
        //         Authorization: "Bearer " + token,
        //     },
        //     withCredentials: true
        // });
        return await api.get("/api/admin/check-role")
    } catch (error) {
        throw error;
    }
}

export default checkRole;
