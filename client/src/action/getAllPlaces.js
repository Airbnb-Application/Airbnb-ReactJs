import toast from "react-hot-toast";
import api from "./axios-interceptor.js";

const getAllPlaces = async (searchUrl) => {
  let url = "/api/places";
  // if query is placeOwner = true, then fetch places owned by the user
  if (searchUrl.has("placeOwner") && searchUrl.get("placeOwner") === "true") {
    url = `/api/places/owner`;
  }
  if (searchUrl === undefined || searchUrl === "") {
    try {
      const response = await api.get(url);
      return response.data.places;
    } catch (error) {
      toast.error(error.response.data.message);
      throw error;
    }
  } else {
    try {
      const response = await api.get(`${url}?${searchUrl.toString()}`);
      return response.data.places;
    } catch (error) {
      toast.error(error.response.data.message);
      throw error;
    }
  }
};

export default getAllPlaces;
