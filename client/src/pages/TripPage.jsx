import getReservation from "../action/getReservation";
import {useEffect, useState} from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {useLocation, useNavigate} from "react-router-dom";
import useAuth from "../hooks/useAuth";
import ROUTES from "../constants/routes";
import useLoginModal from "../hooks/useLoginModal";

import EmptyState from "../components/EmptyState";
import Container from "../components/Container";
import Heading from "../components/Heading";
import ListingCard from "../components/listing/ListingCard";
import storeToken from "../hooks/storeToken.js";
import api from "../action/axios-interceptor.js";
import {differenceInCalendarDays} from "date-fns";

const TripPage = () => {
    const navigate = useNavigate();
    const loginModal = useLoginModal();
    const [reservations, setReservations] = useState([]);
    const [deleteId, setDeleteId] = useState("");
    const location = useLocation();
    const query = new URLSearchParams(location.search);

    const {authToken, isAuthenticated} = useAuth();
    const {role} = storeToken();

    useEffect(() => {
        if (!isAuthenticated) {
            navigate(ROUTES.HOME);
            toast.error("Please login to view your trips");
            loginModal.onOpen();
            return;
        }
        const fetchData = async () => {
            try {
                let response;
                if (role === "admin") {
                    // response = await axios.get("http://localhost:8080/api/admin/reservations", {
                    //     headers: {
                    //         Authorization: "Bearer " + authToken,
                    //     },
                    //     withCredentials: true,
                    // });
                    response = await api.get("/api/admin/reservations");
                } else {
                    response = await getReservation(query.get("placeOwner") === "true");
                }
                if (response.status !== 200) {
                    setReservations([]);
                } else {
                    setReservations(response.data.reservations);
                }
            } catch (error) {
                // toast.error("Something went wrong");
            }
        };
        fetchData();
    }, [isAuthenticated, query.get("placeOwner")]);

    // TODO: hạn chế dùng promise, dùng try catch với async await đi
    //     // Cái này không cần dùng useCallback vì navigate, token không thay đổi, tốn bộ nhớ cho useCallback

    const onAction = async (id) => {
        setDeleteId(id);
        try {
            // const response = await axios.delete(
            //     `http://localhost:8080/api/reservation/${id}`,
            //     {
            //         headers: {
            //             Authorization: "Bearer " + authToken,
            //         },
            //         withCredentials: true,
            //     }
            // );
            const response = await api.delete(`/api/reservation/${id}`);
            toast.success("Reservation has been cancelled");
            navigate(ROUTES.HOME);
        } catch (error) {
            toast.error(error?.response?.data?.message || "Something went wrong");
        }
        setDeleteId("");
    };

    const isPastReservation = (endDate) => {
        return differenceInCalendarDays(new Date(), new Date(endDate)) > 0;
    };

    if (reservations.length === 0) {
        return (
            <EmptyState
                title="No trips found"
                subtitle={query.get("placeOwner") === "true" ? "You have not hosted any trips yet" : "You have not reserved any trips yet"}
                showReset
            />
        );
    }

    return (
        <Container>
            <div className="pt-[120px]">
                <Heading
                    title={query.get("placeOwner") === "true" ? "Your Hosted Trips" : "Your Trips"}
                    subtitle={query.get("placeOwner") === "true" ? "Where you have hosted" : "Where you have been and where you are going"}
                />
                <div
                    className="mt-10 grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-10">
                    {reservations?.map((reservation) => (
                        <ListingCard
                            key={reservation._id}
                            actionId={reservation._id}
                            data={reservation._doc.placeId}
                            reservationParams={reservation.placeReservationParams}
                            reservation={reservation._doc}
                            onAction={onAction}
                            disabled={isPastReservation(reservation._doc.endDate) ? true : deleteId === reservation._id}
                            actionLabel={isPastReservation(reservation._doc.endDate) ? "Reserve Successfully!" : "Cancel Reservation"}
                        />
                    ))}
                </div>
            </div>
        </Container>
    );
};

export default TripPage;
