import api from "./axios-interceptor.js";

const getFavouritesByUser = async (token) => {
    try {
        // const response = await axios.get(`http://localhost:8080/api/favourites`, {
        //     headers: {
        //         Authorization: "Bearer " + token,
        //     },
        //     withCredentials: true
        // });
        return await api.get(`/api/favourites`);
    } catch (error) {
        throw error;
    }
}

export default getFavouritesByUser;