import { Suspense, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import getReservationById from "../action/getReservationById";
import { amenitiesArray } from "../components/Amenities";
import { categoriesArray } from "../components/navbar/Categories";
import useAuth from "../hooks/useAuth";
import useCountries from "../hooks/useCountries";

import { differenceInCalendarDays, eachDayOfInterval } from "date-fns";

import toast from "react-hot-toast";
import Container from "../components/Container";
import EmptyState from "../components/EmptyState";
import ListingFooter from "../components/listing/ListingFooter";
import ListingHead from "../components/listing/ListingHead";
import ListingInfo from "../components/listing/ListingInfo";
import ListingReservation from "../components/listing/ListingReservation";
import Map from "../components/Map";
import ROUTES from "../constants/routes.js";
import useLoginModal from "../hooks/useLoginModal.js";

const initialDateRange = {
  startDate: new Date(),
  endDate: new Date(),
  key: "selection",
};

const TripDetailPage = () => {
  const params = useParams();
  const tripId = params.tripId;
  const { authToken } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [tripData, setTripData] = useState();
  const [dateRange, setDateRange] = useState(initialDateRange);
  const [totalDays, setTotalDays] = useState(1);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const loginModal = useLoginModal();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate(ROUTES.HOME);
      toast.error("Please login to view your trips");
      loginModal.onOpen();
      return;
    }
    setIsLoading(true);
    const fetchTrip = async () => {
      try {
        const response = await getReservationById(tripId, authToken);
        console.log(response);
        setTripData(response);
      } catch (error) {
        console.log(error);
      }
    };
    fetchTrip();
  }, []);

  const { getByValue } = useCountries();
  const location = getByValue(tripData?.location);

  const disabledDate = useMemo(() => {
    if (!tripData) return [];
    const start = new Date(tripData?.startDate);
    const end = new Date(tripData?.endDate);
    return eachDayOfInterval({ start, end });
  }, [tripData?.startDate, tripData?.endDate]);

  useEffect(() => {
    if (tripData?.startDate && tripData?.endDate) {
      let dayCount = differenceInCalendarDays(
        tripData?.endDate,
        tripData?.startDate
      );

      dayCount++;
      setTotalDays(dayCount);
      setDateRange({
        startDate: new Date(tripData?.startDate),
        endDate: new Date(tripData?.endDate),
        key: "selection",
      });
    }
  }, [tripData?.startDate, tripData?.endDate]);

  const category = useMemo(() => {
    return categoriesArray.find(
      (category) => category.label === tripData?.category
    );
  }, [tripData?.category]);

  const amenity = useMemo(() => {
    return amenitiesArray.filter((amenity) => tripData?.amenities[amenity.id]);
  }, [tripData?.amenities]);

  const isPastReservation = (endDate) => {
    return differenceInCalendarDays(new Date(), new Date(endDate)) > 0;
  };

  if (!tripData) {
    return <EmptyState showReset />;
  }

  return (
    <>
      <Container>
        <div className="max-w-screen-lg mx-auto pt-[120px]">
          <div className="grid grid-cols-3 gap-6 max-[1000px]:grid-cols-1">
            <div className="col-span-2 max-[1000px]:col-span-1">
              <ListingHead
                title={tripData?.title}
                imageSrc={tripData?.imageSrc}
                locationValue={tripData?.location}
                id={tripData?.placeId}
              />
              <div className="pt-[50px]">
                <ListingInfo
                  user={tripData?.creator}
                  category={category}
                  locationValue={tripData?.locationValue}
                  price={tripData?.price}
                  amenities={amenity}
                  description={tripData?.description}
                  guestCapacity={tripData?.guestCapacity}
                  bathroomCount={tripData?.bathroomCount}
                  roomCount={tripData?.roomCount}
                  isTrip={tripData?.invoice}
                  guest={
                    tripData.user && [tripData.user.name, tripData.user.email]
                  }
                  startDate={tripData?.startDate}
                  endDate={tripData?.endDate}
                />
              </div>
            </div>
            <div className="max-lg:grid-cols-1 top-[75px] max-[1000px]:top-0 relative">
              <ListingReservation
                price={tripData?.price}
                disabled={isLoading}
                disabledDate={disabledDate}
                totalPrice={tripData?.totalPrice}
                dateRange={dateRange}
                isPastReservation={isPastReservation(tripData?.startDate)}
                onChangeDate={(value) => {}}
                totalDays={totalDays}
                isTrip={tripData?.invoice}
                status={tripData?.status}
              />
            </div>
          </div>
          <hr />
          <div className="flex flex-col gap-6 py-8">
            <div className="text-xl font-semibold">Where you will go</div>
            <div className="font-light text-md text-neutral-500">{`${location?.region}, ${location?.label}`}</div>
            <div className="">
              <Suspense fallback={<div>Loading...</div>}>
                <Map center={location?.lating} />
              </Suspense>
            </div>
          </div>
        </div>
      </Container>
      <ListingFooter />
    </>
  );
};

export default TripDetailPage;
