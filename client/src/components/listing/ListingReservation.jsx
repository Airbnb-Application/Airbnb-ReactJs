import {useNavigate, useParams} from "react-router-dom";
import Calendar from "../inputs/Calender";
import Button from "../button/Button.jsx";

import useEditPlaceModal from "../../hooks/useEditPlaceModal";
import useAuth from "../../hooks/useAuth";
import axios from "axios";
import {toast} from "react-hot-toast";
import ROUTES from "../../constants/routes";
import storeToken from "../../hooks/storeToken.js";
import {differenceInCalendarDays} from "date-fns";

const ListingReservation = (props) => {
    const {
        price,
        totalPrice,
        totalDays,
        onChangeDate,
        dateRange,
        onSubmit,
        disabled,
        isPastReservation,
        disabledDate,
        placeId,
        creatorName,
        isTrip,
    } = props;

    const {authToken} = useAuth();
    const editPlaceModal = useEditPlaceModal();
    const authName = localStorage.getItem("authName");
    const navigate = useNavigate();
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumSignificantDigits: 3
    })
    const {role} = storeToken();

    const handleDelete = async () => {
        try {
            const response = await axios.delete(`http://localhost:8080/api/place/${placeId}`, {
                headers: {
                    Authorization: "Bearer " + authToken,
                },
                withCredentials: true
            });
            toast.success(response.data.message);
            navigate(ROUTES.HOME)
        } catch (error) {
            toast.error(error?.response?.data?.message || "Something went wrong");
        }
    }

    const cancelReservation = async () => {
        try {
            if (isPastReservation) {
                toast.error("This reservation can not be canceled!");
                return;
            }
            const location = window.location.href;
            const reservationId = location.split("/").pop();
            const response = await axios.delete(`http://localhost:8080/api/reservation/${reservationId}`, {
                headers: {
                    Authorization: "Bearer " + authToken,
                },
                withCredentials: true
            });
            toast.success(response.data.message);
            navigate(ROUTES.TRIPS);
        } catch (error) {
            toast.error(error?.response?.data?.message || "Something went wrong");
        }
    }

    const viewInvoice = () => {
        window.open(isTrip, "_blank");
    }

    return (
        <div className="bg-white rounded-xl border-[1px] border-neutral-200 overflow-hidden sticky top-[100px]">
            <div className="flex flex-row items-center gap-1 p-4">
                <div className="text-2xl font-semibold">{formatter.format(price)}</div>
                <div className="font-light text-neutral-600">/ night</div>
            </div>
            <hr/>
            <Calendar
                isReserve={true}
                value={dateRange}
                onChange={(value) => onChangeDate(value.selection)}
                disabledDate={disabledDate}
            />
            <hr/>
            <div className="p-4 flex flex-col gap-4">
                {isTrip &&
                    <>
                        <Button label="View invoice" onClick={viewInvoice}/>
                        {!isPastReservation &&
                            <Button label="Cancel reservation" onClick={cancelReservation}/>
                        }
                    </>
                }
                {(creatorName !== authName && !isTrip && role !== 'admin') &&
                    <Button
                        label="Reserve"
                        onClick={onSubmit}
                    />
                }
                {(creatorName === authName || role === 'admin') && !isTrip && authToken && (
                    <div className="flex flex-row gap-4">
                        <Button label="Delete" onClick={handleDelete}/>
                        <Button label="Edit" onClick={editPlaceModal.onOpen}/>
                    </div>
                )}
            </div>
            <div className="mx-2">
                <div className="p-4 flex flex-row items-center justify-between text-lg">
                    <div>{formatter.format(price)} x {totalDays} days</div>
                    <div>{formatter.format(totalPrice)}</div>
                </div>
                <div
                    className="p-4 flex flex-row items-center justify-between font-semibold text-lg border-t-2 border-solid border-[rgb(221, 221, 221)]">
                    <div>
                        Total:
                    </div>
                    <div>
                        {formatter.format(totalPrice)}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ListingReservation;
