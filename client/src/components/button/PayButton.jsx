import axios from "axios";
import {useSelector} from "react-redux";
import Button from "./Button.jsx";

const PayButton = ({cartItems}) => {
    const user = useSelector((state) => state.auth);

    const handleCheckout = () => {
        axios
            .post(`http://localhost:8080/api/reservation/payments`, {
                cartItems,
                userId: user._id,
            })
            .then((response) => {
                if (response.data.url) {
                    window.location.href = response.data.url;
                }
            })
            .catch((err) => console.log(err.message));
    };

    return (
        <>
            <Button onClick={() => handleCheckout()}>Check out</Button>
        </>
    );
};

export default PayButton;