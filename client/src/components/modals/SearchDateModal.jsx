import Heading from "../Heading";
import Modal from "./Modal";
import Calendar from "../inputs/Calender";

import useSearchModal from "../../hooks/useSearchModal";
import useSearchUrl from "../../hooks/useSearchUrl";
import React, {useState} from "react";
import qs from "query-string";
import {useNavigate} from "react-router-dom";
import {formatISO} from "date-fns";
import ROUTES from "../../constants/routes";

const SearchDateModal = () => {
    const searchModal = useSearchModal();
    const {searchUrl, setSearchUrl} = useSearchUrl();
    const navigate = useNavigate();
    const [dateRange, setDateRange] = useState({
        startDate: new Date(),
        endDate: new Date(),
        key: "selection",
    });
    const params = new URLSearchParams(window.location.search);

    const onSubmit = () => {

        let currentQuery = {};
        if (params) {
            currentQuery = qs.parse(params.toString());
        }

        const query = {
            ...currentQuery,
        };
        if (dateRange.startDate) {
            query.startDate = formatISO(dateRange.startDate)
        }

        if (dateRange.endDate) {
            query.endDate = formatISO(dateRange.endDate)
        }

        const url = qs.stringifyUrl({
            url: "/",
            query,
        }, {skipEmptyString: true, skipNull: true});
        console.log(url);
        setSearchUrl(url);
        navigate(url);
        searchModal.onCloseDate();
    }

    const clearFilter = () => {
        let currentQuery = {};
        if (params) {
            currentQuery = qs.parse(params.toString());
        }
        delete currentQuery.startDate;
        delete currentQuery.endDate;
        const url = qs.stringifyUrl({
            url: "/",
            query: currentQuery,
        }, {skipEmptyString: true, skipNull: true});
        console.log(url);
        setSearchUrl(url);
        navigate(url);
        searchModal.onCloseDate();
        // clear date range
        setDateRange({
            startDate: new Date(),
            endDate: new Date(),
            key: "selection",
        });
    }

    let bodyContent = (
        <div className="flex flex-col gap-8d">
            <Heading
                title="When you want to go?"
                subtitle="Select the date range!"
            />
            <Calendar
                value={dateRange}
                onChange={(value) => {
                    setDateRange(value.selection);
                }}
            />
        </div>
    );

    return (
        <Modal
            isOpen={searchModal.isOpenDate}
            onClose={searchModal.onCloseDate}
            onSubmit={onSubmit}
            title="Date filter"
            body={bodyContent}
            actionLabel="Search"
            secondaryActionLabel="Clear filter"
            secondaryAction={clearFilter}
        />
    )
}

export default SearchDateModal; 