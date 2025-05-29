import useCountries from "../../hooks/useCountries";
import HeartButton from "../button/HeartButton.jsx";

const ListingHead = (props) => {
    const {title, locationValue, imageSrc, id} = props;
    const {getByValue} = useCountries();
    const location = getByValue(locationValue);

    return (
        <>
            <div className="flex flex-row justify-between pb-[10px]">
                <div className="flex flex-col gap-2">
                    <div className="text-2xl font-bold">{title}</div>
                    <div className="font-light text-md text-neutral-500">{`${location.region}, ${location.label}`}</div>
                </div>
            </div>
            <div className="flex flex-row justify-between">
                <div className="w-full h-[70vh] relative overflow-hidden">
                    <img
                        src={imageSrc}
                        alt="listingImg"
                        className="object-cover h-full rounded-xl"
                    ></img>
                    <div className="absolute top-5 right-5">
                        <HeartButton listingId={id}/>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ListingHead;
