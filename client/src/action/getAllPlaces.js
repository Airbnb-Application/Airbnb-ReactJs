import axios from "axios";
import toast from "react-hot-toast";
import api from "./axios-interceptor.js";


const getAllPlaces = async (searchUrl) => {
    // console.log(searchUrl);
    if (searchUrl === undefined || searchUrl === "") {
        try {
            // const response = await axios.get(`http://localhost:8080/api/places`);
            const response = await api.get(`/api/places`);
            console.log(response);
            return response.data.places;
        } catch (error) {
            toast.error(error.response.data.message);
            throw error;
        }
    } else {
        try {
            // const response = await axios.get(`http://localhost:8080/api/places?${searchUrl}`);
            const response = await api.get(`/api/places?${searchUrl}`);
            return response.data.places;
        } catch (error) {
            toast.error(error.response.data.message);
            throw error;
        }
    }
}

export default getAllPlaces;