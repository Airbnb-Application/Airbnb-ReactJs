import toast from "react-hot-toast";
import api from "./axios-interceptor.js";

const getReservation = async (placeOwner) => {
    try {
        // const response = await axios.get(`http://localhost:8080/api/reservations`, {
        //     headers: {
        //         Authorization: "Bearer " + token,
        //     },
        //     withCredentials: true
        // });
        if (placeOwner) {
            return await api.get(`/api/reservations?placeOwner=true`);
        }
        return await api.get(`/api/reservations`);
    } catch (error) {
        throw error;
    }
}

export default getReservation;