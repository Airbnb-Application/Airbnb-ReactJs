import React, {Suspense, useCallback} from "react";
import {useEffect, useState, useMemo} from "react";
import {useParams, useNavigate} from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import ROUTES from "../constants/routes";

import useCountries from "../hooks/useCountries";
import {categoriesArray} from "../components/navbar/Categories";
import {amenitiesArray} from "../components/Amenities";
import Container from "../components/Container";
import ListingHead from "../components/listing/ListingHead";
import ListingInfo from "../components/listing/ListingInfo";
import ListingFooter from "../components/listing/ListingFooter";
import ListingReservation from "../components/listing/ListingReservation";
import EmptyState from "../components/EmptyState";
import useLoginModal from "../hooks/useLoginModal";
import getPlaceById from "../action/getPlaceById";
import {differenceInCalendarDays, eachDayOfInterval} from "date-fns";
import useAuth from "../hooks/useAuth";
import error from "eslint-plugin-react/lib/util/error.js";
import api from "../action/axios-interceptor.js";

const initialDateRange = {
    startDate: new Date(),
    endDate: new Date(),
    key: "selection",
};

const ListingPage = () => {
    const params = useParams();
    const placeId = params.listingId;
    localStorage.setItem("placeId", placeId);
    const loginModal = useLoginModal();
    const navigate = useNavigate();
    const {authToken} = useAuth();
    const [listingData, setListingData] = useState();
    const [isLoading, setIsLoading] = useState(false);
    const [totalPrice, setTotalPrice] = useState(listingData?.price || []);
    const [totalDays, setTotalDays] = useState(1);
    const [dateRange, setDateRange] = useState(initialDateRange);

    useEffect(() => {
        setIsLoading(true);
        const fetchPlace = async () => {
            try {
                const response = await getPlaceById(placeId);
                setListingData(response);
                console.log(response)
            } catch (error) {
                toast.error(error?.response?.data?.message || "Something went wrong");
            }
        };
        fetchPlace();
    }, []);

    const {getByValue} = useCountries();
    const location = getByValue(listingData?.locationValue);


    const Map = useMemo(
        () => React.lazy(() => import("../components/Map")),
        [location]
    );

    // console.log(listingData?.reservedDate)

    const disabledDate = useMemo(() => {
        let dates = [];


        listingData?.reservedDate?.forEach((reservation) => {
            const range = eachDayOfInterval({
                start: new Date(reservation.startDate),
                end: new Date(reservation.endDate),
            });
            dates = [...dates, ...range];
        });
        return dates
    }, [listingData?.reservedDate]);

    const onCreateReservation = useCallback(() => {

        if (!authToken) {
            loginModal.onOpen();
            return;
        }
        setIsLoading(true);

        const inputReservationData = {
            totalPrice,
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
            placeId,
        }
        // axios
        //     .post(`http://localhost:8080/api/checkout/payment`,
        //         {
        //             totalPrice,
        //             startDate: dateRange.startDate,
        //             endDate: dateRange.endDate,
        //             placeId,
        //             totalDays,
        //         },
        //         {
        //             headers: {
        //                 Authorization: "Bearer " + authToken,
        //             },
        //             withCredentials: true,
        //         })
        api.post(`/api/checkout/payment`, {
            totalPrice,
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
            placeId,
            totalDays,
        })
            .then((response) => {
                if (response.data.url) {
                    window.location.href = response.data.url;
                }
            })
            .catch((err) => toast.error(error?.response?.data?.message || "Something went wrong"))
            .finally(() => setIsLoading(false));
    }, [totalPrice, dateRange, placeId, authToken, loginModal]);

    useEffect(() => {
        if (dateRange.startDate && dateRange.endDate) {
            let dayCount = differenceInCalendarDays(
                dateRange.endDate,
                dateRange.startDate
            );

            dayCount++;

            if (dayCount && listingData?.price) {
                setTotalPrice(dayCount * listingData?.price);
                setTotalDays(dayCount);
            } else {
                setTotalPrice(listingData?.price);
                setTotalDays(1);
            }
        }
    }, [dateRange, listingData?.price]);

    const category = useMemo(() => {
        return categoriesArray.find(
            (category) => category.label === listingData?.category
        );
    }, [listingData?.category]);

    const amenity = useMemo(() => {
        return amenitiesArray.filter((amenity) => listingData?.amenities[amenity.id]);
    }, [listingData?.amenities])

    if (!listingData) {
        return <EmptyState showReset/>;
    }

    return (
        <>
            <Container>
                <div className="max-w-screen-lg mx-auto pt-[120px]">
                    <div className="grid grid-cols-3 gap-6 max-[1000px]:grid-cols-1">
                        <div className="col-span-2 max-[1000px]:col-span-1">
                            <ListingHead
                                title={listingData?.title}
                                imageSrc={listingData?.imageSrc}
                                locationValue={listingData?.locationValue}
                                id={listingData?._id}
                            />
                            <div className="pt-[50px]">
                                <ListingInfo
                                    user={listingData?.creator?.name}
                                    imageSrc={listingData?.creator?.image}
                                    roomCount={listingData?.roomCount}
                                    category={category}
                                    description={listingData?.description}
                                    guestCapacity={listingData?.guestCapacity}
                                    bathroomCount={listingData?.bathroomCount}
                                    locationValue={listingData?.locationValue}
                                    amenities={amenity}
                                />
                            </div>
                        </div>
                        <div className=" max-lg:grid-cols-1 top-[75px] max-[1000px]:top-0 relative">
                            <ListingReservation
                                price={listingData?.price}
                                totalPrice={totalPrice}
                                totalDays={totalDays}
                                onChangeDate={(value) => setDateRange(value)}
                                dateRange={dateRange}
                                onSubmit={onCreateReservation}
                                disabled={isLoading}
                                disabledDate={disabledDate}
                                placeId={listingData?._id}
                                creatorName={listingData?.creator?.name}
                            />
                        </div>
                    </div>
                    <hr/>
                    <div className="flex flex-col gap-6 py-8">
                        <div className="text-xl font-semibold">Where you will go</div>
                        <div
                            className="font-light text-md text-neutral-500">{`${location?.region}, ${location?.label}`}</div>
                        <div className="">
                            <Suspense fallback={<div>Loading...</div>}>
                                <Map center={location?.lating}/>
                            </Suspense>
                        </div>
                    </div>
                </div>
            </Container>
            <ListingFooter/>
        </>
    );
};

export default ListingPage;
