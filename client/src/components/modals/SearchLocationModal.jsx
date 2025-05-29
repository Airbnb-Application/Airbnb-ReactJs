import Modal from "./Modal";
import CountrySelect from "../inputs/CountrySelect";
import Heading from "../Heading";
import Map from "../Map";

import React, {useState, useMemo, Suspense, useCallback} from "react";
import {useNavigate} from "react-router-dom";
import qs from "query-string";
import useSearchModal from "../../hooks/useSearchModal";
import useSearchUrl from "../../hooks/useSearchUrl";
import ROUTES from "../../constants/routes";

const SearchLocationModal = () => {
    const navigate = useNavigate();
    const searchModal = useSearchModal();
    const {searchUrl, setSearchUrl} = useSearchUrl();
    const [location, setLocation] = useState();
    const params = new URLSearchParams(window.location.search);

    const Map = useMemo(() => React.lazy(() => import("../Map")), [location]);

    const onSubmit = () => {

        let currentQuery = {};
        if (params) {
            currentQuery = qs.parse(params.toString());
        }

        const query = {
            ...currentQuery,
            locationValue: location?.value,
        }
        const url = qs.stringifyUrl({
            url: "/",
            query,
        }, {skipEmptyString: true, skipNull: true});
        console.log(url);
        setSearchUrl(url);
        navigate(url);
        searchModal.onCloseLocation();
    };

    const clearFilter = () => {
        let currentQuery = {};
        if (params) {
            currentQuery = qs.parse(params.toString());
        }
        delete currentQuery.locationValue;
        const url = qs.stringifyUrl({
            url: "/",
            query: currentQuery,
        }, {skipEmptyString: true, skipNull: true});
        console.log(url);
        setSearchUrl(url);
        navigate(url);
        searchModal.onCloseLocation();
        // clear location filter
        setLocation(null);
    }

    let bodyContent = (
        <div className="flex flex-col gap-8 max-h-[65vh]">
            <Heading
                title="Where you want to go?"
                subtitle="Find the perfect location!"
            />
            <CountrySelect
                value={location}
                onChange={(value) => {
                    setLocation(value);
                }}
            />
            <hr/>
            <Suspense fallback={<div>Loading...</div>}>
                <Map center={location?.lating}/>
            </Suspense>
        </div>
    );

    return (
        <Modal
            isOpen={searchModal.isOpenLocation}
            onClose={searchModal.onCloseLocation}
            onSubmit={onSubmit}
            title="Location filter"
            actionLabel="Search"
            secondaryAction={clearFilter}
            secondaryActionLabel="Clear filter"
            body={bodyContent}
        />
    );
};

export default SearchLocationModal;
