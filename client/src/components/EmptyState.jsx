import Heading from "./Heading";
import Button from "./button/Button.jsx";
import {useNavigate} from "react-router-dom";
import ROUTES from "../constants/routes";
import useSearchUrl from "../hooks/useSearchUrl.js";

const EmptyState = (props) => {
    const navigate = useNavigate();
    const {setSearchUrl} = useSearchUrl();
    const {
        title = "No exact matches",
        subtitle = "Try changing or removing some of your filters",
        showReset,
    } = props;

    return (
        <div className="h-[100vh] flex flex-col gap-2 justify-center items-center pt-20 pb-[200px] w-full">
            <Heading center title={title} subtitle={subtitle}/>
            <div className="w-48 mt-4">
                {showReset && (
                    <Button
                        outline
                        label="Back to Homepage"
                        onClick={() => {
                            setSearchUrl("");
                            navigate(ROUTES.HOME);
                            // window.location.reload();
                        }}
                    ></Button>
                )}
            </div>
        </div>
    );
};

export default EmptyState;
