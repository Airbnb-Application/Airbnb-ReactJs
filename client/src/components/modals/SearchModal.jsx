import React, { useCallback, useState, useMemo, Suspense } from "react";
import qs from "query-string";
import { formatISO, set } from "date-fns";
import { useNavigate } from "react-router-dom";

import Modal from "./Modal";
import Map from "../Map";
import useSearchModal from "../../hooks/useSearchModal";
import useSearchUrl from "../../hooks/useSearchUrl";
import Heading from "../Heading";
import CountrySelect from "../inputs/CountrySelect";
import Calender from "../inputs/Calender";
import Counter from "../inputs/Counter";

const STEPS = {
  LOCATION: 0,
  DATE: 1,
  INFO: 2,
};

const SearchModal = () => {
  const searchModal = useSearchModal();
  const { searchUrl, setSearchUrl } = useSearchUrl();
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.search);

  const [location, setLocation] = useState();
  const [step, setStep] = useState(STEPS.LOCATION);
  const [guestCount, setGuestCount] = useState(0);
  const [roomCount, setRoomCount] = useState(0);
  const [bathroomCount, setBathroomCount] = useState(0);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
    key: "selection",
  });

  const Map = useMemo(() => React.lazy(() => import("../Map")), [location]);

  const onBack = useCallback(() => {
    setStep((value) => value - 1);
  }, []);

  const onNext = useCallback(() => {
    setStep((value) => value + 1);
  }, []);

  const onSubmit = useCallback( async () => {
    setSearchUrl("")
    if (step !== STEPS.INFO) {
        return onNext();
      }
  
      let currentQuery = {};
      if (params) {
        currentQuery = qs.parse(params.toString());
      }

      const updatedQuery = {
        ...currentQuery,
        locationValue: location?.value,
      };
      if (dateRange.startDate) {
        updatedQuery.startDate = formatISO(dateRange.startDate);
      }
      if (dateRange.endDate) {
        updatedQuery.endDate = formatISO(dateRange.endDate);
      }

      if (guestCount === 0) {
        updatedQuery.guestCount = null
      } else {
        updatedQuery.guestCount = guestCount
      }

      if (roomCount === 0) {
        updatedQuery.roomCount = null
      } else {
        updatedQuery.roomCount = roomCount
      }

      if (bathroomCount === 0) {
        updatedQuery.bathroomCount = null
      } else {
        updatedQuery.bathroomCount = bathroomCount
      }
  
      const url = qs.stringifyUrl(
        {
          url: "/",
          query: updatedQuery,
        },
        { skipNull: true }
      );
      console.log(url)
      console.log(dateRange.endDate, dateRange.startDate)
      setSearchUrl(url)
      console.log(searchUrl); 
      setStep(STEPS.LOCATION);
      searchModal.onClose();
  
      navigate(url);
  }, [step, location, guestCount, roomCount, bathroomCount, dateRange, params, onNext]);

  const actionLabel = useMemo(() => {
    if (step === STEPS.INFO) {
      return "Search";
    }
    return "Next";
  }, [step]);

  const secondaryActionLabel = useMemo(() => {
    if (step === STEPS.LOCATION) {
      return undefined;
    }
    return "Back"
  }, [step])

  let bodyContent = (
    <div className="flex flex-col gap-8 max-h-[65vh]">
        <Heading
            title="Where you want to go?"
            subtitle="Find the perfect location!"
        />
        <CountrySelect
            value={location}
            onChange={(value) => {
                setLocation(value)
            }}
        />
        <hr/>
        <Suspense fallback={<div>Loading...</div>}>
          <Map center={location?.lating} />
        </Suspense>
    </div>
  )

  if (step === STEPS.DATE) {
    bodyContent = (
      <div className="flex flex-col gap-8">
        <Heading
          title="When do you plan to go?"
          subtitle="Make sure everyone is free!"
        />

        <Calender
          value={dateRange}
          onChange={(value) => {
            setDateRange(value.selection)
          }}
        />
        
      </div>
    )
  }

  if (step === STEPS.INFO) {
    bodyContent = (
      <div className="flex flex-col gap-8">
        <Heading
          title="More information"
          subtitle="Find your perfect place"
        />
        <Counter
          title="Guests"
          subtitle="How many guests are coming?"
          value={guestCount}
          onChange={(value) => {
            setGuestCount(value)
          }}
        />
         <Counter
          title="Rooms"
          subtitle="How many rooms do you want to have?"
          value={roomCount}
          onChange={(value) => {
            setRoomCount(value)
          }}
        />
         <Counter
          title="Bathrooms"
          subtitle="How many bathrooms do you want to have?"
          value={bathroomCount}
          onChange={(value) => {
            setBathroomCount(value)
          }}
        />
      </div>  
    )
  }

  return (
    <Modal
      isOpen={searchModal.isOpen}
      onClose={searchModal.onClose}
      onSubmit={onSubmit}
      title="Filter"
      actionLabel={actionLabel}
      secondaryAction={step === STEPS.LOCATION ? undefined : onBack}
      secondaryActionLabel={secondaryActionLabel}
      body={bodyContent}
    />
  );
};

export default SearchModal;
