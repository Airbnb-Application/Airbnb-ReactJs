import React, {useState, useEffect} from "react";
import {useForm} from "react-hook-form";
import Modal from "../modals/Modal";
import Heading from "../Heading";
import Input from "../inputs/Input";
import useEditProfileModal from "../../hooks/useEditProfileModal";
import useAuth from "../../hooks/useAuth";
import axios from "axios";
import toast from "react-hot-toast";
import {useLocation, useNavigate} from "react-router-dom";
import storeToken from "../../hooks/storeToken.js";
import ROUTES from "../../constants/routes.js";
import useLoginModal from "../../hooks/useLoginModal.js";
import api from "../../action/axios-interceptor.js";

const ChangePasswordModal = () => {
    const editProfile = useEditProfileModal();
    const {authToken} = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const location = useLocation();
    const {role} = storeToken();
    const navigate = useNavigate();
    const loginModal = useLoginModal();
    const {setAuth, setRole} = storeToken();

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: {errors},
        reset,
    } = useForm({
        defaultValues: {
            oldPassword: "",
            newPassword: "",
        },
    });

    const oldPassword = watch("oldPassword");
    const newPassword = watch("newPassword");

    const setCustomValue = (id, value) => {
        setValue(id, value, {
            shouldValidate: true,
            shouldDirty: true,
            shouldTouch: true,
        });
    };

    const bodyContent = (
        <div className="flex flex-col gap-4">
            <Heading title="Change your password" subtitle="Input carefully!"/>
            <Input
                id="oldPassword"
                label="Old password"
                value={oldPassword}
                showPassword={showPassword}
                setShowPassword={() => setShowPassword(!showPassword)}
                type={showPassword ? "text" : "password"}
                onChange={(value) => setCustomValue("oldPassword", value)}
                errors={errors}
                required
                register={register}
            />
            <Input
                id="newPassword"
                label="New password"
                showPassword={showPassword}
                setShowPassword={() => setShowPassword(!showPassword)}
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(value) => setCustomValue("newPassword", value)}
                errors={errors}
                required
                register={register}
            />
        </div>
    );

    const onSubmit = async (data) => {
        console.log(data);
        try {
            const query = new URLSearchParams(location.search);
            let url = "/api/profile/change-password";
            if (query.get("userId") && role === "admin") {
                url = url + "?userId=" + query.get("userId");
            }
            // const response = await axios.put(
            //     url,
            //     data,
            //     {
            //         headers: {
            //             Authorization: "Bearer " + authToken,
            //         }
            //     }
            // )
            const response = await api.put(url, data);
            console.log(role);
            // logout if password changed
            if (response.status === 200 && role !== "admin") {
                navigate(ROUTES.HOME)
                loginModal.onOpen();
                if (localStorage.getItem("provider") === "google") {
                    // const response = await axios.delete(
                    //     "http://localhost:8080/auth/google/logout",
                    //     {withCredentials: true}
                    // );
                    const response = await api.delete("/auth/google/logout");
                }
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                localStorage.removeItem("expiresAt");
                localStorage.removeItem("authName");
                localStorage.removeItem("provider");
                localStorage.removeItem("placeId");
                localStorage.removeItem("authImage");
                setRole(null);
                setAuth(false);
            }
            editProfile.onChangePasswordClose();
            toast.success("Password changed successfully. Please login again.");
        } catch (error) {
            console.log(error);
            toast.error("Fail to update password");
        }
    };

    return (
        <Modal
            isOpen={editProfile.isChangePassword}
            onClose={editProfile.onChangePasswordClose}
            title="Change password"
            actionLabel="Save Changes"
            body={bodyContent}
            onSubmit={handleSubmit(onSubmit)}
        />
    );
};

export default ChangePasswordModal;
