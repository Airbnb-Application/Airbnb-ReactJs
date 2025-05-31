import { useCallback, useEffect, useRef, useState } from "react";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import useFavourite from "../../hooks/useFavourite.js";

const HeartButton = (props) => {
  const { listingId } = props;
  const { hasFavourite, toggleFavourite } = useFavourite({ listingId });
  const [isProcessing, setIsProcessing] = useState(false);
  const lastClickTime = useRef(0);

  // Debug log when favorite status changes
  useEffect(() => {
    console.log(`Favorite status for ${listingId}: ${hasFavourite}`);
  }, [hasFavourite, listingId]);

  const handleClick = useCallback(
    async (e) => {
      e.stopPropagation();
      console.log(`Heart button clicked for ${listingId}`);

      if (isProcessing) {
        console.log("Still processing previous request, ignoring click");
        return;
      }

      const now = Date.now();
      if (now - lastClickTime.current < 1000) {
        console.log("Click too soon after previous click, ignoring");
        return;
      }
      lastClickTime.current = now;

      setIsProcessing(true);
      console.log("Starting toggle favorite API call...");

      try {
        await toggleFavourite();
        console.log("Toggle favorite completed successfully");
      } catch (error) {
        console.error("Error in toggle favorite:", error);
      }

      setTimeout(() => {
        setIsProcessing(false);
        console.log("Button processing state reset");
      }, 1000);
    },
    [isProcessing, toggleFavourite, listingId]
  );

  return (
    <div
      onClick={handleClick}
      className={`relative hover:opacity-80 transition cursor-pointer ${
        isProcessing ? "opacity-50 pointer-events-none" : ""
      }`}
    >
      <AiOutlineHeart
        size={40}
        className="fill-white absolute -top-[2px] -right-[2px]"
      />
      <AiFillHeart
        size={38}
        className={hasFavourite ? "fill-rose-500" : "fill-neutral-500/70"}
      />
    </div>
  );
};

export default HeartButton;
