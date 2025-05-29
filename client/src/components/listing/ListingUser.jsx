import {useNavigate} from "react-router-dom";
import ROUTES from "../../constants/routes.js";

const ListingUser = (props) => {
    const {userData} = props;
    const navigate = useNavigate();

    const onUserClick = () => {
        console.log("User clicked");
        navigate(ROUTES.LISTING_DETAIL.replace(":listingId", userData._id));
    }

    return (
        <div className="flex flex-col gap-4" onClick={onUserClick}>
            <div className="col-span-1 cursor-pointer group">
                <div className="flex flex-col gap-2 w-full">
                    <div className="aspect-square overflow-hidden w-full relative rounded-xl">
                        <img
                            src={userData?.imageSrc}
                            alt="userListing"
                            className=" object-cover w-full h-full transition group-hover:scale-110"
                        ></img>
                    </div>
                    <div className="flex flex-row justify-between">
                        <div className="text-lg font-semibold">{userData?.title}</div>
                    </div>
                    <div className="text-md text-neutral-500">
                        <div>{userData?.category}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ListingUser;
