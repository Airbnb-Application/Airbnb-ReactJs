import Container from "../components/Container";
import EmptyState from "../components/EmptyState";
import ListingCard from "../components/listing/ListingCard";
import getAllPlaces from "../action/getAllPlaces";
import {useEffect, useState} from "react";
import toast from "react-hot-toast";
import axios from "axios";
import {useLocation, useNavigate} from "react-router-dom";
import useTokenStore from "../hooks/storeToken.js";
import useSearchUrl from "../hooks/useSearchUrl.js";
import useAuth from "../hooks/useAuth.js";
import ROUTES from "../constants/routes.js";
import api from "../action/axios-interceptor.js";

const IndexPage = () => {
    const [data, setData] = useState([]);
    const location = useLocation();
    const query = new URLSearchParams(location.search);
    const {authToken} = useAuth();
    const {searchUrl} = useSearchUrl();
    const {
        isAuthenticated,
        setAuth,
        role,
        setRole,
    } = useTokenStore();
    const navigate = useNavigate();
    // console.log(searchUrl);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await getAllPlaces(query)
                setData(response)
                console.log(1);
            } catch (error) {
                toast.error(error?.response?.data?.message || "Something went wrong")
            }
        }
        fetchData();
    }, [searchUrl, data.toString()]);

    useEffect(() => {

        // check login with google success
        const ggLg = async () => {
            try {
                if (query.get("auth") === null) return;
                if (query.get("authError") && query.get("authError") === "true") {
                    toast.error("Something went wrong with google login");
                    window.history.replaceState({}, document.title, "/");
                    return;
                }
                // const response = await axios.get("http://localhost:8080/auth/google/success", {
                //     withCredentials: true,
                // });
                const response = await api.get("/auth/google/success", {
                    withCredentials: true,
                });
                console.log(response.data);
                if (response.status !== 200) {
                    toast.error("Cannot login with google");
                    window.history.replaceState({}, document.title, "/");
                    return;
                }
                const accessToken = localStorage.getItem("accessToken");
                const expiresAt = localStorage.getItem("expiresAt");
                const refreshToken = localStorage.getItem("refreshToken");
                const authName = localStorage.getItem("authName");
                const authImage = localStorage.getItem("authImage");

                if (!accessToken || !expiresAt || !refreshToken || !authName || !isAuthenticated || !authImage || !role) {
                    localStorage.setItem("accessToken", response.data.accessToken);
                    localStorage.setItem("expiresAt", response.data.expires_in);
                    localStorage.setItem("refreshToken", response.data.refreshToken);
                    localStorage.setItem("authName", response.data.name);
                    localStorage.setItem("authImage", response.data.image);
                    localStorage.setItem("provider", "google");
                    setRole(response.data.role);
                    setAuth(true);
                }
                // remove query params
                window.history.replaceState({}, document.title, "/");
            } catch (error) {
                toast.error("Cannot login with google");
                window.history.replaceState({}, document.title, "/");
            }
        }

        const cancelReservation = async () => {
            try {
                if (!isAuthenticated) return;
                if (query.get("cancel") === null) return;
                const reservationId = query.get("reservationId");
                console.log(reservationId);
                // const response = await axios.delete(`http://localhost:8080/api/checkout/cancel_payment/${reservationId}`, {
                //     headers: {
                //         Authorization: "Bearer " + authToken,
                //     },
                //     withCredentials: true,
                // });
                const response = await api.delete(`/api/checkout/cancel_payment/${reservationId}`);
                if (response.status !== 200) {
                    toast.error("Something went wrong");
                    return;
                }
                // console.log(response.data);
                toast.success(response.data.message);
                window.history.replaceState({}, document.title, "/");
            } catch (error) {
                toast.error(error?.response?.data?.message || "Something went wrong");
            }
        }

        if (query.get("auth") || query.get("authError")) {
            ggLg();
        }

        if (query.get("cancel")) {
            cancelReservation();
        }
    }, [searchUrl]);

    return (
        <>
            {(data.length === 0 && <EmptyState showReset/>) || (
                <div className="pb-20 pt-40">
                    <Container>
                        <div
                            className="
                pt-24
                grid
                grid-cols-1
                sm:grid-cols-1
                md:grid-cols-2
                lg:grid-cols-3
                2xl:grid-cols-4
                gap-10
              "
                        >
                            {data.map((item) => (
                                <ListingCard data={item} key={item._id}/>
                            ))}
                        </div>
                    </Container>
                </div>
            )}
        </>
    );
};

export default IndexPage;
