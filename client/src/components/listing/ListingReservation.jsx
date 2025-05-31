import { useNavigate } from "react-router-dom";
import Button from "../button/Button.jsx";
import Calendar from "../inputs/Calender";

import { toast } from "react-hot-toast";
import api from "../../action/axios-interceptor.js";
import ROUTES from "../../constants/routes";
import storeToken from "../../hooks/storeToken.js";
import useAuth from "../../hooks/useAuth";
import useEditPlaceModal from "../../hooks/useEditPlaceModal";

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
    creatorEmail,
    isTrip,
    status,
    onStatusChange,
  } = props;

  const { authToken } = useAuth();
  const editPlaceModal = useEditPlaceModal();
  const authEmail = localStorage.getItem("authEmail");
  const navigate = useNavigate();
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumSignificantDigits: 3,
  });
  const { role } = storeToken();

  const handleDelete = async () => {
    try {
      const response = await api.delete(
        `http://localhost:8080/api/place/${placeId}`
      );
      toast.success(response.data.message);
      navigate(ROUTES.HOME);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    }
  };

  const handleToggleStatus = async () => {
    try {
      // Xác định trạng thái mới dựa trên trạng thái hiện tại
      const newStatus = status === "active" ? "inactive" : "active";

      const response = await api.put(
        `http://localhost:8080/api/place/status/${placeId}`,
        { status: newStatus }
      );

      // Kiểm tra phản hồi từ server
      if (response.status !== 200) {
        toast.error(response.data.message || "Failed to update place status");
        return;
      }

      if (onStatusChange) {
        onStatusChange(newStatus);
      }

      // Hiển thị thông báo thành công
      toast.success(
        `Place ${
          newStatus === "active" ? "activated" : "deactivated"
        } successfully!`
      );

      // Tùy chọn: Chuyển hướng người dùng hoặc reload trang
      // navigate(ROUTES.HOME);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to update place status"
      );
    }
  };

  const toggleStatusButtonLabel =
    status === "active" ? "Deactivate" : "Activate";

  const cancelReservation = async () => {
    try {
      if (isPastReservation) {
        toast.error("This reservation can not be canceled!");
        return;
      }
      const location = window.location.href;
      const reservationId = location.split("/").pop();
      const response = await api.delete(
        `http://localhost:8080/api/reservation/${reservationId}`
      );
      toast.success(response.data.message);
      navigate(ROUTES.TRIPS);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    }
  };

  const viewInvoice = () => {
    window.open(isTrip, "_blank");
  };

  return (
    <div className="bg-white rounded-xl border-[1px] border-neutral-200 overflow-hidden sticky top-[100px]">
      <div className="flex flex-row items-center gap-1 p-4">
        <div className="text-2xl font-semibold">{formatter.format(price)}</div>
        <div className="font-light text-neutral-600">/ night</div>
      </div>
      <hr />
      <Calendar
        isReserve={true}
        value={dateRange}
        onChange={(value) => onChangeDate(value.selection)}
        disabledDate={disabledDate}
      />
      <hr />
      <div className="p-4 flex flex-col gap-4">
        {status === "cancelled" && (
          <div className="text-red-500 text-lg font-semibold">
            Reservation has been cancelled
          </div>
        )}
        {status === "inactive" &&
          (creatorEmail === authEmail || role === "admin") && (
            <div className="bg-yellow-100 text-yellow-800 p-2 rounded text-center">
              This place is currently inactive
            </div>
          )}
        {isTrip && status !== "cancelled" && (
          <>
            <Button label="View invoice" onClick={viewInvoice} />
            {!isPastReservation && (
              <Button label="Cancel reservation" onClick={cancelReservation} />
            )}
          </>
        )}
        {creatorEmail !== authEmail &&
          !isTrip &&
          status !== "cancelled" &&
          role !== "admin" && <Button label="Reserve" onClick={onSubmit} />}
        {(creatorEmail === authEmail || role === "admin") &&
          !isTrip &&
          authToken && (
            <div className="flex flex-row gap-4">
              <Button
                label={toggleStatusButtonLabel}
                onClick={handleToggleStatus}
                outline={status === "active"}
              />
              <Button label="Edit" onClick={editPlaceModal.onOpen} />
            </div>
          )}
      </div>
      <div className="mx-2">
        <div className="p-4 flex flex-row items-center justify-between text-lg">
          <div>
            {formatter.format(price)} x {totalDays} days
          </div>
          <div>{formatter.format(totalPrice)}</div>
        </div>
        <div className="p-4 flex flex-row items-center justify-between font-semibold text-lg border-t-2 border-solid border-[rgb(221, 221, 221)]">
          <div>Total:</div>
          <div>{formatter.format(totalPrice)}</div>
        </div>
      </div>
    </div>
  );
};

export default ListingReservation;
