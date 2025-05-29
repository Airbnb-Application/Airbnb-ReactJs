import Heading from "../Heading"
import Counter from "../inputs/Counter"
import Modal from "./Modal"

import useSearchModal from "../../hooks/useSearchModal"
import useSearchUrl from "../../hooks/useSearchUrl"
import {useState, useCallback} from "react"
import qs from "query-string"
import {useNavigate} from "react-router-dom"
import ROUTES from "../../constants/routes"


const SearchCountModal = () => {
    const navigate = useNavigate()
    const searchModal = useSearchModal()
    const {searchUrl, setSearchUrl} = useSearchUrl()
    const [guestCount, setGuestCount] = useState(0)
    const [roomCount, setRoomCount] = useState(0)
    const [bathroomCount, setBathroomCount] = useState(0)
    const params = new URLSearchParams(window.location.search);

    let bodyContent = (
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

    const onSubmit = () => {

        let currentQuery = {}
        if (params) {
            currentQuery = qs.parse(params.toString())
        }

        const query = {
            ...currentQuery,
            guestCount,
            roomCount,
            bathroomCount
        }
        const url = qs.stringifyUrl({
            url: "/",
            query
        }, {skipEmptyString: true, skipNull: true})
        console.log(url)
        setSearchUrl(url)
        navigate(url)
        searchModal.onCloseCount()
    }

    const clearFilter = () => {
        let currentQuery = {}
        if (params) {
            currentQuery = qs.parse(params.toString())
        }
        delete currentQuery.guestCount
        delete currentQuery.roomCount
        delete currentQuery.bathroomCount
        const url = qs.stringifyUrl({
            url: "/",
            query: currentQuery
        }, {skipEmptyString: true, skipNull: true})
        console.log(url)
        setSearchUrl(url)
        navigate(url)
        searchModal.onCloseCount()
        // clear count filter
        setGuestCount(0)
        setRoomCount(0)
        setBathroomCount(0)
    }

    return (
        <Modal
            isOpen={searchModal.isOpenCount}
            onClose={searchModal.onCloseCount}
            onSubmit={onSubmit}
            title="Guests filter"
            actionLabel="Search"
            body={bodyContent}
            secondaryActionLabel="Clear filter"
            secondaryAction={clearFilter}
        />
    )
}

export default SearchCountModal