import React, {useState, useEffect} from "react";
import {useForm} from "react-hook-form";
import Modal from "../modals/Modal";
import Heading from "../Heading"
import Input from "../inputs/Input"
import useEditProfileModal from "../../hooks/useEditProfileModal";
import useAuth from "../../hooks/useAuth";
import axios from "axios";
import toast from "react-hot-toast";
import {useLocation} from "react-router-dom";
import storeToken from "../../hooks/storeToken.js";
import api from "../../action/axios-interceptor.js";
import ROUTES from "../../constants/routes.js";

const EditUserModal = () => {
    const editProfile = useEditProfileModal();
    const {authToken} = useAuth();
    const location = useLocation();
    const {role} = storeToken();
    const [userData, setUserData] = useState([]);
    const {isUserEdit} = useEditProfileModal();

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: {errors},
        reset,
    } = useForm({
        defaultValues: {
            email: "",
            name: "",
        },
    });

    const name = watch("name");
    const email = watch("email");

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                if (!isUserEdit) return;
                const query = new URLSearchParams(location.search);
                let url = "/api/profile";
                if (query.get("userId") && role === "admin") {
                    url += `?userId=${query.get("userId")}`;
                }
                // const response = await axios.get(url, {
                //   headers: {
                //     Authorization: "Bearer " + authToken,
                //   },
                //   withCredentials: true,
                // });
                const response = await api.get(url);
                localStorage.setItem("authName", response.data.profile.name);
                setUserData(response.data.profile);
            } catch (error) {
                console.log(error);
            }
        };
        fetchUserData();
    }, []);

    const setCustomValue = (id, value) => {
        setValue(id, value, {
            shouldValidate: true,
            shouldDirty: true,
            shouldTouch: true,
        });
    }

    const bodyContent = (
        <div className="flex flex-col gap-4">
            <Heading title="Change your information" subtitle="Input carefully!"/>
            <Input
                id="email"
                label="New email"
                value={email ? email : userData.email}
                onChange={(value) => setCustomValue("email", value)}
                errors={errors}
                required
                register={register}
            />
            <Input
                id="name"
                label="New name"
                value={name ? name : userData.name}
                onChange={(value) => setCustomValue("name", value)}
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
            let url = "/api/profile";
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
            setUserData(data);
            toast.success("Profile updated successfully");
            editProfile.onUserClose();
        } catch (error) {
            console.log(error);
            toast.error("Failed to update profile");
        }
    }

    return (
        <Modal
            isOpen={editProfile.isUserEdit}
            onClose={editProfile.onUserClose}
            title="Edit user Information"
            actionLabel="Save Changes"
            body={bodyContent}
            onSubmit={handleSubmit(onSubmit)}
        />
    );
};

export default EditUserModal;
