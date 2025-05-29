import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import ROUTES from "../constants/routes";
import useAuth from "./useAuth";
import useLoginModal from "../hooks/useLoginModal";
const useFavourite = ({ listingId }) => {
  const { authToken, isAuthenticated } = useAuth();
  const [hasFavourite, setHasFavourite] = useState(false);
  useEffect(() => {
    const fetchData = () => {
      if (isAuthenticated === false) {
        return;
      }
      try {
        axios
          .get(
            ` http://localhost:8080/api/favourites`,
            {
              headers: {
                Authorization: "Bearer " + authToken,
              },
              withCredentials: true,
            }
          )
          .then((response) => {
            const favourites = response.data.favouritePlaces.map(
              (place) => place._id
            );
            setHasFavourite(favourites?.includes(listingId));
          });
      } catch (error) {
        console.error("Error fetching user favourites:", error);
      }
    };

    fetchData();
  }, [listingId]);

  const navigate = useNavigate();
  const loginModal = useLoginModal();

  const toggleFavourite = async () => {
    if (!authToken) {
      return loginModal.onOpen();
    }
    try {
      let request;
      if (hasFavourite) {
        request = () =>
          axios.delete(`http://localhost:8080/api/favourite/${listingId}`, {
            headers: {
              Authorization: "Bearer " + authToken,
            },
            withCredentials: true,
          });
      } else {
        request = () =>
          axios.post(
            `http://localhost:8080/api/favourite/new/${listingId}`,
            null,
            {
              headers: {
                Authorization: "Bearer " + authToken,
              },
              withCredentials: true,
            }
          );
      }
      await request();
      navigate(ROUTES.FAVOURITES);
      toast.success(
        `Listing has been ${
          hasFavourite ? "removed from" : "added to"
        } favourites`
      );
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  return {
    hasFavourite,
    toggleFavourite,
  };
};

export default useFavourite;
