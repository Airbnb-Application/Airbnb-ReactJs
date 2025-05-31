import axios from "axios";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { getTokenDuration } from "../utils/auth.js";
import "./App.css";
import ChangePasswordModal from "./components/modals/ChangePasswordModal.jsx";
import EditPlaceModal from "./components/modals/EditPlaceModal.jsx";
import EditUserModal from "./components/modals/EditUserModal.jsx";
import LoginModal from "./components/modals/LoginModal.jsx";
import RegisterModal from "./components/modals/RegisterModal.jsx";
import RentModal from "./components/modals/RentModal.jsx";
import SearchCountModal from "./components/modals/SearchCountModal.jsx";
import SearchDateModal from "./components/modals/SearchDateModal.jsx";
import SearchLocationModal from "./components/modals/SearchLocationModal.jsx";
import SearchModal from "./components/modals/SearchModal.jsx";
import Navbar from "./components/navbar/Navbar.jsx";
import WrapSidebar from "./components/WrapSidebar.jsx";
import ROUTES from "./constants/routes";
import useTokenStore from "./hooks/storeToken.js";
import AllUserPage from "./pages/AllUserPage.jsx";
import CheckoutSuccessPage from "./pages/CheckoutSuccessPage.jsx";
import DashboardPage from "./pages/DashboardPage";
import ErrorPage from "./pages/ErrorPage";
import FavouritePage from "./pages/FavouritePage";
import IndexPage from "./pages/IndexPage";
import ListingOwnerPage from "./pages/ListingOwnerPage.jsx";
import ListingPage from "./pages/ListingPage";
import ProfilePage from "./pages/ProfilePage";
import TripDetailPage from "./pages/TripDetailPage.jsx";
import TripPage from "./pages/TripPage";
import ToasterProvider from "./providers/ToasterProvider.jsx";

function App() {
  const { isAuthenticated } = useTokenStore();
  const refreshToken = localStorage.getItem("refreshToken");
  const tokenDuration = getTokenDuration();
  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }
    const refreshInterval = setInterval(() => {
      if (localStorage.getItem("provider") === "google") {
        axios
          .post(
            "http://localhost:8080/auth/google/refresh",
            { refreshToken },
            { withCredentials: true }
          )
          .then((response) => {
            const { accessToken, expires_in, token_type } = response.data;
            console.log("Google refresh");
            localStorage.setItem("accessToken", accessToken);
            localStorage.setItem("expiresAt", expires_in);
          })
          .catch((error) => {
            console.log(error);
            toast.error("Could not refresh token. Please log in again.");
          });
        return;
      }
      axios
        .post("http://localhost:8080/auth/refresh", { refreshToken })
        .then((response) => {
          const { accessToken, expires_in, token_type } = response.data;
          console.log(response.data);
          localStorage.setItem("accessToken", accessToken);
          localStorage.setItem("expiresAt", expires_in);
        })
        .catch((error) => {
          console.log(error);
          toast.error("Could not refresh token. Please log in again.");
        });
    }, tokenDuration); // Refresh every minute

    // Cleanup interval on component unmount
    return () => {
      clearInterval(refreshInterval);
    };
  }, [isAuthenticated]);

  return (
    <div className="app">
      <BrowserRouter>
        <ToasterProvider />
        <RentModal />
        <LoginModal />
        <RegisterModal />
        <EditPlaceModal />
        <SearchModal />
        <SearchLocationModal />
        <SearchDateModal />
        <SearchCountModal />
        <EditUserModal />
        <ChangePasswordModal />
        <Navbar />
        <div className="content-container">
          <Routes>
            <Route index element={<IndexPage />} />
            <Route
              path={ROUTES.DASHBOARD}
              element={<WrapSidebar element={<DashboardPage />} />}
            />
            <Route
              path={ROUTES.TRIPS}
              element={<WrapSidebar element={<TripPage />} />}
            />
            <Route
              path={ROUTES.LISTING}
              element={<WrapSidebar element={<ListingOwnerPage />} />}
            />
            <Route
              path={ROUTES.USERS}
              element={<WrapSidebar element={<AllUserPage />} />}
            />
            <Route path={ROUTES.LISTING_DETAIL} element={<ListingPage />} />
            <Route path={ROUTES.CHECKOUT} element={<CheckoutSuccessPage />} />
            <Route path={ROUTES.TRIPS_DETAIL} element={<TripDetailPage />} />
            <Route path={ROUTES.FAVOURITES} element={<FavouritePage />} />
            <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
            <Route path="*" element={<ErrorPage />} />
          </Routes>
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;
