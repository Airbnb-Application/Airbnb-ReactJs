import {useNavigate, useRouteError} from "react-router-dom";
import ROUTES from "../constants/routes.js";
import Button from "../components/button/Button.jsx";

export default function ErrorPage() {
    const navigate = useNavigate();

    const redirectToHome = () => {
        navigate(ROUTES.HOME);
    }
    
    return (
        <div id="error-page" className="pt-48 flex flex-col justify-center items-center">
            <div className="text-9xl m-3 font-black text-[#f43f5e]">Oops!</div>
            <div className="text-3xl font-bold m-6">404 - Page Not Found</div>
            <div className="mb-6">Sorry, the page you are looking for might have been removed, had its name changed, or
                is temporarily
                unavailable.
            </div>
            <div>
                <Button onClick={() => redirectToHome()} label="Go to Home"/>
            </div>
        </div>
    );
}