import React, {Suspense, useEffect, useMemo, useState} from "react";
import {useForm} from "react-hook-form";
import {categoriesArray} from "../navbar/Categories";
import {amenitiesArray} from "../Amenities";
import Modal from "./Modal";
import Heading from "../Heading";
import ImageUpload from "../inputs/ImageUpload";
import AmenitiesInput from "../inputs/AmenitiesInput";
import CategoryInput from "../inputs/CategoryInput";
import CountrySelect from "../inputs/CountrySelect";
import Counter from "../inputs/Counter";
import Input from "../inputs/Input";

import useCountries from "../../hooks/useCountries";
import getPlaceById from "../../action/getPlaceById";
import useEditPlaceModal from "../../hooks/useEditPlaceModal";
import axios from "axios";
import toast from "react-hot-toast";
import {useNavigate} from "react-router-dom";
import ROUTES from "../../constants/routes";
import useAuth from "../../hooks/useAuth";
import api from "../../action/axios-interceptor.js";

const STEPS = {
    CATEGORY: 0,
    LOCATION: 1,
    INFO: 2,
    IMAGES: 3,
    DESCRIPTION: 4,
    AMENITIES: 5,
    PRICE: 6,
};

const EditPlaceModal = () => {
    const {authToken, isAuthenticated} = useAuth();
    const editPlaceModal = useEditPlaceModal();
    const navigate = useNavigate();
    const [step, setStep] = useState(STEPS.CATEGORY);
    const [selectedAmenities, setSelectedAmenities] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentPlaceData, setCurrentPlaceData] = useState();
    const placeId = localStorage.getItem("placeId");

    useEffect(() => {
        const fetchPlace = async () => {
            try {
                if (placeId && isAuthenticated) {
                    const response = await getPlaceById(placeId);
                    setCurrentPlaceData(response);
                }
            } catch (error) {
                toast.error(error?.response?.data?.message || "Something went wrong");
            }
        };
        fetchPlace();
    }, [placeId]);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: {errors},
        reset,
    } = useForm({
        defaultValues: {
            category: "",
            location: null,
            guestCapacity: 0,
            roomCount: 0,
            bathroomCount: 0,
            imageSrc: "",
            price: -1,
            title: "0",
            description: "0",
        },
    });

    const category = watch("category");
    const location = watch("location");
    const guestCapacity = watch("guestCapacity");
    const roomCount = watch("roomCount");
    const bathroomCount = watch("bathroomCount");
    const imageSrc = watch("imageSrc");
    const title = watch("title");
    const description = watch("description");
    const price = watch("price")

    const handleAmenities = (id) => {
        const isSelected = selectedAmenities.includes(id);
        // If it's already selected, remove it; otherwise, add it
        const updatedAmenities = isSelected
            ? selectedAmenities.filter((item) => item !== id)
            : [...selectedAmenities, id];

        // Update the selected amenities state
        setSelectedAmenities(updatedAmenities);
    };
    const {getByValue} = useCountries();
    const currentLocation = getByValue(currentPlaceData?.locationValue);

    const Map = useMemo(() => React.lazy(() => import("../Map")), [location]);
    const setCustomValue = (id, value) => {
        setValue(id, value, {
            shouldValidate: true,
            // check if the input value is valid
            shouldDirty: true,
            // check if the input value is dirty (changed from default value)
            shouldTouch: true,
            // check if the input has been touched (focused and leaved)
        });
    };


    const onBack = (value) => {
        setStep((value) => value - 1);
    };

    const onNext = (value) => {
        setStep((value) => value + 1);
    };

    const onSubmit = async (data) => {
        if (step !== STEPS.PRICE) {
            return onNext();
        }

        console.log(data)

        const updateListingData = {
            title: data.title === '0' ? currentPlaceData?.title : data.title,
            description: data.description === '0' ? currentPlaceData?.description : data.description,
            category: data.category === undefined ? currentPlaceData?.category : data.category,
            roomCount: data.roomCount === 0 ? currentPlaceData?.roomCount : data.roomCount,
            bathroomCount: data.bathroomCount === 0 ? currentPlaceData?.bathroomCount : data.bathroomCount,
            guestCapacity: data.guestCapacity === 0 ? currentPlaceData?.guestCapacity : data.guestCapacity,
            location: data.location === undefined || data.location === null ? currentPlaceData?.locationValue : data.location.value,
            price: data.price === -1 ? currentPlaceData?.price : data.price,
            imageSrc: data.imageSrc,
        };

        const amenities = {};
        selectedAmenities.forEach((item) => {
            amenities[item] = true;
        });
        updateListingData.amenities = amenities;

        console.log(updateListingData);
        setIsLoading(true);
        try {
            // const response = await axios.put(
            //     `http://localhost:8080/api/place/${placeId}`,
            //     updateListingData,
            //     {
            //         headers: {
            //             Authorization: "Bearer " + authToken,
            //         },
            //         withCredentials: true
            //     }
            // );
            const response = await api.put(`/api/place/${placeId}`, updateListingData);
            toast.success("Your place has been updated");
            setSelectedAmenities([]);
            setCurrentPlaceData(updateListingData);
            navigate(ROUTES.HOME); // redirect to the home page
            reset();
            setStep(STEPS.CATEGORY);
            editPlaceModal.onClose();
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    const actionLabel = useMemo(() => {
        if (step === STEPS.PRICE) {
            return "Update";
        }
        return "Next";
    }, [step]);

    const secondaryActionLabel = useMemo(() => {
        if (step === STEPS.CATEGORY) {
            return undefined;
        }
        return "Back";
    }, [step]);

    let bodyContent = (
        <div className="flex flex-col gap-8">
            <Heading
                title="Which of these best describes your place"
                subtitle="Pick a category"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto">
                {categoriesArray.map((item) => (
                    <div key={item.label} className="col-span-1 font-semibold">
                        <CategoryInput
                            onClick={(category) => setCustomValue("category", category)}
                            selected={!category ? currentPlaceData?.category === item.label : category === item.label}
                            label={item.label}
                            icon={item.icon}
                        />
                    </div>
                ))}
            </div>
        </div>
    );

    if (step === STEPS.LOCATION) {
        bodyContent = (
            <div className="flex flex-col gap-8 max-h-[65vh]">
                <Heading
                    title="Where is your place located?"
                    subtitle="Help guests find you"
                />
                <CountrySelect
                    value={!location ? currentLocation : location}
                    onChange={(value) => setCustomValue("location", value)}
                />
                <Suspense fallback={<div>Loading...</div>}>
                    <Map center={!location ? currentLocation?.lating : location?.lating}/>
                </Suspense>
            </div>
        );
    }

    if (step === STEPS.INFO) {
        bodyContent = (
            <div className="flex flex-col gap-8">
                <Heading
                    title="Share some basics about your place"
                    subtitle="What amenities do you have?"
                />
                <Counter
                    title="Guests"
                    subtitle="How many guests do you allow?"
                    value={guestCapacity === 0 ? currentPlaceData?.guestCapacity : guestCapacity}
                    onChange={(value) => setCustomValue("guestCapacity", value)}
                />
                <hr/>
                <Counter
                    title="Rooms"
                    subtitle="How many rooms do you have?"
                    value={roomCount === 0 ? currentPlaceData?.roomCount : roomCount}
                    onChange={(value) => setCustomValue("roomCount", value)}
                />
                <hr/>
                <Counter
                    title="Bathrooms"
                    subtitle="How many bathrooms do you bathroom?"
                    value={bathroomCount === 0 ? currentPlaceData?.bathroomCount : bathroomCount}
                    onChange={(value) => setCustomValue("bathroomCount", value)}
                />
            </div>
        );
    }

    if (step === STEPS.IMAGES) {
        bodyContent = (
            <div className="flex flex-col gap-8 h-[65vh]">
                <Heading
                    title="Add a photo of your place"
                    subtitle="Show guests what your place looks like"
                />
                <ImageUpload
                    value={!imageSrc ? currentPlaceData?.imageSrc : imageSrc}
                    onChange={(value) => setCustomValue("imageSrc", value)}
                />
            </div>
        );
    }

    if (step === STEPS.DESCRIPTION) {
        bodyContent = (
            <div className="flex flex-col gap-8">
                <Heading
                    title="How would you describe your place?"
                    subtitle="Short and sweet works best"
                />
                <Input
                    id="title"
                    label="Title"
                    disabled={isLoading}
                    register={register}
                    errors={errors}
                    value={title === '0' ? currentPlaceData?.title : title}
                    onChange={(value) => setCustomValue("title", value)}
                    required
                />
                <hr/>
                <Input
                    id="description"
                    label="Description"
                    disabled={isLoading}
                    register={register}
                    value={description === '0' ? currentPlaceData?.description : description}
                    onChange={(value) => setCustomValue("description", value)}
                    errors={errors}
                    required
                />
            </div>
        );
    }

    if (step === STEPS.AMENITIES) {
        bodyContent = (
            <div className="flex flex-col gap-8">
                <Heading
                    title="What amenities does the place have?"
                    subtitle="Select all that apply"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto">
                    {amenitiesArray.map((item) => (
                        <div key={item.id} className="col-span-1 font-semibold">
                            <AmenitiesInput
                                id={item.id}
                                onClick={() => handleAmenities(item.id)}
                                selected={selectedAmenities.length === 0 ? currentPlaceData?.amenities[item.id] : selectedAmenities.includes(item.id)}
                                label={item.label}
                                icon={item.icon}
                            />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (step === STEPS.PRICE) {
        bodyContent = (
            <div className="flex flex-col gap-8">
                <Heading
                    title="Now, set your price"
                    subtitle="How much do you charge per night?"
                />
                <Input
                    id="price"
                    label="Price"
                    formatPrice
                    type="number"
                    disabled={isLoading}
                    register={register}
                    value={price === -1 ? currentPlaceData?.price : price}
                    onChange={(value) => setCustomValue("price", value)}
                    errors={errors}
                    required
                />
            </div>
        );
    }
    return (
        <Modal
            isOpen={editPlaceModal.isOpen}
            onClose={editPlaceModal.onClose}
            onSubmit={handleSubmit(onSubmit)}
            actionLabel={actionLabel}
            secondaryActionLabel={secondaryActionLabel}
            secondaryAction={step === STEPS.CATEGORY ? undefined : onBack}
            title="Edit your home"
            body={bodyContent}
        />
    );
};

export default EditPlaceModal;