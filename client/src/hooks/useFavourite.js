import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import api from "../action/axios-interceptor.js";
import useAuth from "./useAuth.js";
import useLoginModal from "./useLoginModal.js";

const useFavourite = ({ listingId }) => {
  const { authToken, isAuthenticated } = useAuth();
  const loginModal = useLoginModal();
  const [hasFavourite, setHasFavourite] = useState(false);
  const requestInProgress = useRef(false);

  // Fetch initial favorite status
  useEffect(() => {
    if (!isAuthenticated || !authToken) return;

    const checkFavoriteStatus = async () => {
      try {
        const response = await api.get("/api/favourites");
        if (response.data && response.data.favouritePlaces) {
          const isFavorite = response.data.favouritePlaces.some(
            (place) => place._id === listingId || place.id === listingId
          );
          setHasFavourite(isFavorite);
        }
      } catch (error) {
        console.error("Error checking favorite status:", error);
      }
    };

    checkFavoriteStatus();
  }, [listingId, authToken, isAuthenticated]);

  const toggleFavourite = useCallback(async () => {
    // Don't proceed if there's already a request in progress
    if (requestInProgress.current) {
      return;
    }

    if (!isAuthenticated) {
      // open login modal
      toast.error("Please log in to manage favorites");
      loginModal.onOpen();
      return;
    }

    requestInProgress.current = true;

    try {
      let response;
      if (hasFavourite) {
        response = await api.delete(`/api/favourite/${listingId}`);
      } else {
        response = await api.post(`/api/favourite/new/${listingId}`);
      }
      console.log("Toggle favorite response:", response);

      // Verify the server response indicates success
      if (response.status >= 200 && response.status < 300) {
        // Update UI based on the server's response, not optimistically
        if (response.data && response.data.success !== undefined) {
          // If the API returns a success flag, use it
          setHasFavourite(response.data.success);
        } else if (response.data && response.data.favouritePlaces) {
          // If the API returns updated favorites, check if the current listing is included
          const isFavorite = response.data.favouritePlaces.some(
            (place) => place._id === listingId || place.id === listingId
          );
          setHasFavourite(isFavorite);
        } else {
          // If no clear indication from server, toggle based on current state
          setHasFavourite((prev) => !prev);
        }

        // Success notification
        toast.success(
          hasFavourite ? "Removed from favorites" : "Added to favorites"
        );
      } else {
        throw new Error("Failed to update favorite");
      }
    } catch (error) {
      console.error("Error toggling favourite:", error);
      toast.error("Failed to update favorite status");
    } finally {
      // Allow new requests after a delay
      setTimeout(() => {
        requestInProgress.current = false;
      }, 1000);
    }
  }, [listingId, isAuthenticated, hasFavourite]);

  return {
    hasFavourite,
    toggleFavourite,
  };
};

export default useFavourite;
