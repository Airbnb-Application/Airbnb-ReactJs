import { BarChart3, Package } from "lucide-react";
import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";
import ROUTES from "../constants/routes.js";
import storeToken from "../hooks/storeToken.js";
import useLoginModal from "../hooks/useLoginModal.js";
import Sidebar, { SidebarItem } from "./Sidebar.jsx";

const WrapSidebar = ({ element }) => {
  const { role, isAuthenticated } = storeToken();
  const location = useLocation();
  const navigate = useNavigate();
  const loginModal = useLoginModal();
  const query = new URLSearchParams(location.search);
  let sidebarItems = (
    <Sidebar className="sticky top-0">
      <hr className="border-gray-200 mb-3" />
      <SidebarItem
        route={ROUTES.DASHBOARD}
        icon={<BarChart3 size={20} />}
        text="Statistics"
      />
      <hr className="border-gray-200 my-3" />
      <SidebarItem
        route={ROUTES.TRIPS}
        query={{ placeOwner: "true" }}
        icon={<Package size={20} />}
        text="Guest Reservations"
      />
      <SidebarItem
        route={ROUTES.LISTING}
        query={{ placeOwner: "true" }}
        icon={<Package size={20} />}
        text="Host Place"
      />
    </Sidebar>
  );

  let adminSidebarItems = (
    <Sidebar className="sticky top-0">
      <hr className="border-gray-200 mb-3" />
      <SidebarItem
        route={ROUTES.DASHBOARD}
        icon={<BarChart3 size={20} />}
        text="Statistics"
      />
      <hr className="border-gray-200 my-3" />
      <SidebarItem
        route={ROUTES.USERS}
        icon={<Package size={20} />}
        text="Users"
      />
      <SidebarItem
        route={ROUTES.TRIPS}
        icon={<Package size={20} />}
        text="Guest Reservations"
      />
      <SidebarItem
        route={ROUTES.LISTING}
        icon={<Package size={20} />}
        query={{ placeOwner: "true" }}
        text="Place"
      />
    </Sidebar>
  );

  // if not authenticated, return / and display login modal
  if (!isAuthenticated) {
    if (location.pathname !== ROUTES.HOME) {
      navigate(ROUTES.HOME);
    }
    loginModal.open();
    toast.error("Please log in to access this page.");
    return;
  }

  if (role === "user") {
    if (
      location.pathname === ROUTES.TRIPS ||
      location.pathname === ROUTES.LISTING
    ) {
      if (query.get("placeOwner") !== "true") {
        sidebarItems = null;
      }
    }
  }

  return (
    <div className="relative flex flex-row">
      {role === "user" && sidebarItems}
      {role === "admin" && adminSidebarItems}
      {element}
    </div>
  );
};

export default WrapSidebar;
