import {useNavigate} from "react-router-dom";
import useCountries from "../../hooks/useCountries";
import {useCallback, useMemo} from "react";
import {format} from "date-fns";
import ROUTES from "../../constants/routes";

import HeartButton from "../button/HeartButton.jsx";
import Button from "../button/Button.jsx";

const ListingCard = (props) => {
    const navigate = useNavigate();
    const {
        data,
        reservation,
        onAction,
        disabled,
        actionLabel,
        actionId,
        isFavourite,
        favouriteParams,
        reservationParams
    } =
        props;
    const {getByValue} = useCountries();
    const location = getByValue(data.locationValue);

    // console.log(reservation)

    const handleCancel = useCallback(
        (event) => {
            event.stopPropagation();
            if (disabled) {
                return;
            }

            onAction?.(actionId);
        },
        [disabled, onAction, actionId]
    );

    const price = useMemo(() => {
        if (reservation) {
            return reservation.totalPrice;
        }
        return data.price;
    }, [reservation, data.price]);

    const revervationDate = useMemo(() => {
        if (!reservation) return null;
        const start = new Date(reservation.startDate);
        const end = new Date(reservation.endDate);
        return `${format(start, "PP")} - ${format(end, "PP")}`;
    }, [reservation]);

    const navigateToListingItem = () => {
        if (isFavourite) {
            navigate(ROUTES.LISTING_DETAIL.replace(":listingId", favouriteParams), {replace: true})

        } else if (reservation) {
            navigate(ROUTES.TRIPS_DETAIL.replace(":tripId", actionId), {replace: true})
        } else {
            navigate(ROUTES.LISTING_DETAIL.replace(":listingId", data._id), {replace: true})
        }
        // Không để magic string trong code, tạo một cái file là routes.js chứa tất cả các path
        // Rồi thay thành navigate(ROUTES.LISTING_DETAIL.replace(":listing_id", data._id))
    }

    const formatNumber = data.price.toLocaleString("en-US");
    const totalPrice = price.toLocaleString("en-US");
    return (
        <div className="flex flex-col gap-4">
            <div className="col-span-1 cursor-pointer group" onClick={navigateToListingItem}>
                <div className="flex flex-col gap-2 w-full">
                    <div className="aspect-square overflow-hidden w-full relative rounded-xl">
                        <img
                            src={data.imageSrc}
                            alt="listing"
                            className=" object-cover w-full h-full transition group-hover:scale-110"
                        ></img>
                        <div className="absolute top-3 right-3">
                            {isFavourite && <HeartButton listingId={favouriteParams}/>}
                            {!isFavourite && !reservation && <HeartButton listingId={data._id}/>}
                            {reservation && <HeartButton listingId={reservationParams}/>}
                        </div>
                    </div>
                    <div className="flex flex-row justify-between">
                        <div className="text-lg font-semibold">{data.title}</div>
                    </div>
                    <div className="text-md text-neutral-500">
                        <div>
                            {location?.region} {location?.label}
                        </div>
                        <div>{revervationDate || data.category}</div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <div className="flex flex-row">
                            {!reservation && (
                                <div className="text-md font-semibold">
                                    {" "}
                                    ${formatNumber} / night
                                </div>
                            )}
                            {reservation && (
                                <div className="text-md font-semibold">
                                    {" "}
                                    Total price: ${totalPrice}{" "}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            {onAction && actionLabel && (
                <Button
                    disabled={disabled}
                    small
                    label={actionLabel}
                    onClick={handleCancel}
                />
            )}
        </div>
    );
};

export default ListingCard;
