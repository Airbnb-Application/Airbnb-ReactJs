import ROUTES from "../constants/routes.js";
import {useLocation, useNavigate} from "react-router-dom";
import Button from "../components/button/Button.jsx";
import {useEffect, useState} from "react";
import axios from "axios";
import useAuth from "../hooks/useAuth.js";
import toast from "react-hot-toast";
import useLoginModal from "../hooks/useLoginModal.js";

const CheckoutSuccessPage = () => {
    const {authToken} = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const query = new URLSearchParams(location.search);
    const [invoice, setInvoice] = useState(null);
    const {isAuthenticated} = useAuth();
    const loginModal = useLoginModal();

    useEffect(() => {
        if (!isAuthenticated && role !== "admin") {
            navigate(ROUTES.HOME);
            toast.error("Please login to view your trips");
            loginModal.onOpen();
            return;
        }
        const checkoutSuccess = async () => {
            // console.log(query.get('paymentId'));
            if (!query.get('paymentId')) return;
            const response = await axios.get(`http://localhost:8080/api/checkout/success_payment?paymentId=${query.get('paymentId')}`, {
                headers: {
                    Authorization: `Bearer ${authToken}`
                },
                withCredentials: true
            });
            console.log(response);
            if (response.status !== 200) {
                console.log('Error checking out');
                return;
            }
            setInvoice(response.data.invoice);
        }
        checkoutSuccess();
    }, []);
    const backToHome = () => {
        navigate(ROUTES.HOME);
    }

    return (
        <div className="pt-44 min-h-[80vh] max-w-[800px] w-full m-auto flex flex-col items-center justify-center">
            <h2 className="text-[#029e02] text-6xl font-black">Checkout Successful</h2>
            <div className="my-12 text-center">
                <p>Your order might take some time to process.</p>
                <p>Check your order status at your profile after about 10mins.</p>
                <p>
                    Incase of any inqueries contact the support at{" "}
                    <strong>support@onlineshop.com</strong>
                </p>
            </div>
            <div className="flex flex-col gap-3">
                <Button onClick={() => backToHome()} label="Go to Home"/>
                {invoice &&
                    <a href={invoice} target="_blank" className="hover:text-rose-500 cursor-pointer">Click here to
                        download
                        invoice</a>
                }
            </div>
        </div>
    );
};

export default CheckoutSuccessPage;
