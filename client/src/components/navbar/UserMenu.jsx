import {AiOutlineMenu} from "react-icons/ai";
import Avatar from "../Avatar";
import {useState, useCallback, useEffect} from "react";
import MenuItem from "./MenuItem";
import {useNavigate} from "react-router-dom";
import useRegisterModal from "../../hooks/useRegisterModal";
import useLoginModal from "../../hooks/useLoginModal";
import useRentModal from "../../hooks/useRentModal";
import ROUTES from "../../constants/routes";
import useTokenStore from "../../hooks/storeToken.js";
import useAuth from "../../hooks/useAuth";
import axios from "axios";
import toast from "react-hot-toast";
import checkRole from "../../action/getRole.js";

const UserMenu = (props) => {
    const navigate = useNavigate();
    const {isAuthenticated, setAuth, role, setRole} = useTokenStore();

    let currentUser = false;
    if (isAuthenticated) {
        currentUser = true;
    }

    const logoutHandler = async () => {
        try {
            navigate(ROUTES.HOME);
            if (localStorage.getItem("provider") === "google") {
                const response = await axios.delete(
                    "http://localhost:8080/auth/google/logout",
                    {withCredentials: true}
                );
                if (response.status !== 200) {
                    toast.error("Something went wrong");
                }
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

            toast("You have been logged out", {
                icon: "👋",
                style: {borderRadius: "10px"},
            });

        } catch (error) {
            navigate(ROUTES.HOME);
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("expiresAt");
            localStorage.removeItem("authName");
            localStorage.removeItem("provider");
            localStorage.removeItem("placeId");
            localStorage.removeItem("authImage");
            setRole(null);
            setAuth(false);
            toast("You have been logged out", {
                icon: "👋",
                style: {borderRadius: "10px"},
            });
        }
    };

    const registerModal = useRegisterModal();
    const loginModal = useLoginModal();
    const rentModal = useRentModal();
    const [isOpen, setIsOpen] = useState(false);
    const toggleOpen = useCallback(() => {
        setIsOpen((value) => !value);
    }, []);

    const onRent = useCallback(() => {
        if (!currentUser) {
            return loginModal.onOpen();
        }

        // open rent modal
        rentModal.onOpen();
    }, [currentUser, loginModal, rentModal]);

    return (
        <div className="relative">
            <div className="flex flex-row items-center gap-3">
                {role !== "admin" ? (
                    <div
                        onClick={onRent}
                        className="hidden md:block text-sm font-semibold py-3 px-4 rounded-full hover:bg-neutral-100 transition cursor-pointer"
                    >
                        Add your home
                    </div>
                ) : (
                    <div
                        onClick={() => navigate(ROUTES.DASHBOARD)}
                        className="hidden md:block text-sm font-semibold py-3 px-4 rounded-full hover:bg-neutral-100 transition cursor-pointer"
                    >
                        Dashboard
                    </div>
                )}
                <div
                    onClick={toggleOpen}
                    className="p-4 md:py-1 md:px-2 border-[1px] border-neutral-200 flex flex-row items-center gap-3 rounded-full cursor-pointer hover:shadow-md transition"
                >
                    <AiOutlineMenu/>
                    <div className="hidden md:block">
                        <Avatar/>
                    </div>
                </div>
            </div>
            {isOpen && (
                <div
                    className="absolute rounded-xl shadow-md w-[40vw] md:w-3/4 bg-white overflow-hidden right-0 top-12 text-sm">
                    <div className="flex flex-col cursor-pointer">
                        {currentUser ? (
                            <>
                                {role === "admin" ? (
                                    <>
                                        <MenuItem
                                            label="Dashboard"
                                            onClick={() => navigate(ROUTES.DASHBOARD)}
                                        />
                                        <MenuItem
                                            label="All users"
                                            onClick={() => navigate(ROUTES.USERS)}
                                        />
                                        <MenuItem
                                            label="All places"
                                            onClick={() => navigate(ROUTES.HOME)}
                                        />
                                        <MenuItem
                                            label="All reservations"
                                            onClick={() => navigate(ROUTES.TRIPS)}
                                        />
                                        <hr/>
                                        <MenuItem
                                            label="Logout"
                                            onClick={logoutHandler}
                                        />
                                    </>
                                ) : (
                                    <>
                                        <MenuItem
                                            label="Statistics"
                                            onClick={() => navigate(ROUTES.DASHBOARD)}
                                        />
                                        <MenuItem
                                            label="My trips"
                                            onClick={() => navigate(ROUTES.TRIPS)}
                                        />
                                        <MenuItem
                                            label="My favorites"
                                            onClick={() => navigate(ROUTES.FAVOURITES)}
                                        />
                                        <MenuItem
                                            label="My profile"
                                            onClick={() => navigate(ROUTES.PROFILE)}
                                        />
                                        <MenuItem label="Add your home" onClick={rentModal.onOpen}/>
                                        <hr/>
                                        <MenuItem label="Logout" onClick={logoutHandler}/>
                                    </>
                                )}
                            </>
                        ) : (
                            <>
                                <MenuItem onClick={loginModal.onOpen} label="Login"/>
                                <MenuItem onClick={registerModal.onOpen} label="Sign up"/>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserMenu;
