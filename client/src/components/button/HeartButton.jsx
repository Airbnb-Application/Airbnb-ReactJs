import {AiOutlineHeart, AiFillHeart} from "react-icons/ai";
import useFavourite from "../../hooks/useFavourite.js";

const HeartButton = (props) => {
    const {listingId} = props;
    const {hasFavourite, toggleFavourite} = useFavourite({listingId});


    return (
        <div onClick={toggleFavourite} className="relative hover:opacity-80 transition cursor-pointer">
            <AiOutlineHeart size={40} className="fill-white absolute -top-[2px] -right-[2px]"/>
            <AiFillHeart size={38} className={hasFavourite ? 'fill-rose-500' : 'fill-neutral-500/70'}/>
        </div>
    )
}

export default HeartButton;
