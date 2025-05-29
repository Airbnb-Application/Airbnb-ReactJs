import Sidebar, {SidebarItem} from "./Sidebar.jsx";
import ROUTES from "../constants/routes.js";
import {BarChart3, Package} from "lucide-react";
import storeToken from "../hooks/storeToken.js";
import {useLocation} from "react-router-dom";

const WrapSidebar = ({element}) => {
    const {role} = storeToken();
    const location = useLocation();
    const query = new URLSearchParams(location.search);
    let sidebarItems =
        <Sidebar className="sticky top-0">
            <hr className="border-gray-200 mb-3"/>
            <SidebarItem
                route={ROUTES.DASHBOARD}
                icon={<BarChart3 size={20}/>}
                text="Statistics"
            />
            <hr className="border-gray-200 my-3"/>
            <SidebarItem
                route={ROUTES.TRIPS}
                query={{placeOwner: "true"}}
                icon={<Package size={20}/>}
                text="Guest Reservations"
            />
        </Sidebar>;

    if (role === "user") {
        if (location.pathname === ROUTES.TRIPS) {
            if (query.get("placeOwner") !== "true") {
                sidebarItems = null;
            }
        }
    }

    return (
        <div className="relative flex flex-row">
            {
                (
                    role === "user"
                )
                && sidebarItems
            }
            {element}
        </div>
    )
};

export default WrapSidebar;
