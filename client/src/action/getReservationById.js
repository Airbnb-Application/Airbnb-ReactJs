import axios from "axios";
import api from "./axios-interceptor.js";

const getReservationById = async (reservationId, authToken) => {
    try {
        // const response = await axios.get(`http://localhost:8080/api/reservation/${reservationId}`, {
        //     headers: {
        //         Authorization: "Bearer " + authToken,
        //     },
        //     withCredentials: true,
        // });
        const response = await api.get(`/api/reservation/${reservationId}`);
        return response.data.reservation;
    } catch (error) {
        console.error(error);
    }
}

export default getReservationById;  