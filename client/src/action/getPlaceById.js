import api from "./axios-interceptor.js";

const getPlaceById = async (listingId, query = "") => {
  try {
    let response;
    if (
      query.has("includeInactive") &&
      query.get("includeInactive") === "true"
    ) {
      response = await api.get(`/api/place/owner/${listingId}?${query}`);
    } else {
      response = await api.get(`/api/place/${listingId}`);
    }
    return response.data.place;
  } catch (error) {
    console.error(error);
  }
};

export default getPlaceById;
