import {Box, Button, IconButton, Typography, useTheme} from "@mui/material";
import {tokens} from "../theme.js";
import {useState, useEffect} from "react";
import axios from "axios";
// import { mockTransactions } from "../../src/data/mockData";
import {jsPDF} from "jspdf";
import html2canvas from "html2canvas";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import {confirmAlert} from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import AddHomeIcon from '@mui/icons-material/AddHome';
import AspectRatioIcon from '@mui/icons-material/AspectRatio';
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import Header from "../../src/components/Heading"
import LineChart from "../../src/components/dashboards/LineChart"
import BarChart from "../../src/components/dashboards/BarChart";
import StatBox from "../../src/components/dashboards/StatBox";
import ProgressCircle from "../../src/components/dashboards/ProgressCircle";
import useAuth from "../../src/hooks/useAuth";
import ROUTES from "../constants/routes.js";
import toast from "react-hot-toast";
import loginModal from "../components/modals/LoginModal.jsx";
import {useNavigate} from "react-router-dom";
import storeToken from "../hooks/storeToken.js";
import useLoginModal from "../hooks/useLoginModal.js";
import api from "../action/axios-interceptor.js";
import Sidebar, {SidebarItem} from "../components/Sidebar.jsx";
import {BarChart3, Package} from "lucide-react";


const Dashboard = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const [totalCustomer, setTotalCustomer] = useState("");
    const [totalReservation, setTotalReservation] = useState("");
    const [totalPayment, setTotalPayment] = useState("");
    const {authToken, isAuthenticated} = useAuth()
    const navigate = useNavigate();
    const {role} = storeToken();
    const loginModal = useLoginModal();

    const downloadReports = () => {
        confirmAlert({
            title: 'Confirm to save',
            message: 'Are you sure you want to save this dashboard?',
            buttons: [
                {
                    label: 'Yes',
                    onClick: () => {
                        const dashboardElement = document.getElementById('dashboard');
                        html2canvas(dashboardElement).then(canvas => {
                            const imgData = canvas.toDataURL('image/png');
                            const pdf = new jsPDF('l', 'mm', 'a4'); // create A4 pdf in landscape orientation
                            const imgProps = pdf.getImageProperties(imgData);
                            const pdfWidth = pdf.internal.pageSize.getWidth();
                            const pdfHeight = pdf.internal.pageSize.getHeight();
                            const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
                            const height = Math.min(pdfHeight, imgHeight);
                            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, height);

                            // Get current date and time
                            const now = new Date();
                            const dateTimeString = now.toLocaleString();

                            pdf.text(`Date and Time: ${dateTimeString}`, 10, 10);
                            pdf.save("dashboard.pdf");
                        });
                    }
                },
                {
                    label: 'No',
                    onClick: () => {
                    }
                },
            ]
        });
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (!isAuthenticated) {
                    navigate(ROUTES.HOME);
                    toast.error("Please login to view your trips");
                    loginModal.onOpen();
                    return;
                }
                // Fetch data from backend API
                // axios.get("http://localhost:8080/api/admin/dashboard/total-data", {
                //     headers: {
                //         Authorization: "Bearer " + authToken,
                //     },
                //     withCredentials: true
                // })
                let response;
                if (role === "admin") {
                    response = await api.get("/api/admin/dashboard/total-data")
                    console.log(response.data);
                    setTotalCustomer(response.data.totalCustomer);
                    setTotalReservation(response.data.totalReservation);
                    setTotalPayment(response.data.totalPayment);
                } else {
                    response = await api.get("/api/statistics/total-data")
                    console.log(response.data);
                    setTotalReservation(response.data.totalReservation);
                    setTotalPayment(response.data.totalPayment);
                }
            } catch (error) {
                console.log("Error fetching data:", error);
            }
        }

        fetchData();
    }, []);

    return (
        <div className="pt-[120px] px-20 w-full" id="dashboard">
            <Box m="20px">
                {/* HEADER */}
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Header title="DASHBOARD" subtitle="Welcome to your dashboard"/>

                    <Box>
                        <Button
                            onClick={downloadReports}
                            sx={{
                                backgroundColor: colors.blueAccent[700],
                                color: colors.grey[100],
                                fontSize: "14px",
                                fontWeight: "bold",
                                padding: "10px 20px",
                            }}
                        >
                            <DownloadOutlinedIcon sx={{mr: "10px"}}/>
                            Download Reports
                        </Button>
                    </Box>
                </Box>

                {/* GRID & CHARTS */}
                <Box
                    display="grid"
                    gridTemplateColumns="repeat(12, 1fr)"
                    gridAutoRows="140px"
                    gap="50px"
                    mt="40px"
                >
                    {/* ROW 1 */}
                    {role === "admin" && (
                        <Box
                            gridColumn="span 4"
                            backgroundColor={colors.primary[400]}
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                        >
                            <StatBox
                                title={totalCustomer}
                                subtitle="Total User"
                                progress="0.25"
                                icon1={
                                    <PersonAddIcon
                                        sx={{color: colors.greenAccent[600], fontSize: "40px"}}
                                    />
                                }
                                icon2={
                                    <AspectRatioIcon
                                        sx={{color: colors.greenAccent[600], fontSize: "40px"}}
                                    />
                                }
                            />
                        </Box>
                    )}
                    <Box
                        gridColumn={role === "admin" ? "span 4" : "span 6"}
                        backgroundColor={colors.primary[400]}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                    >
                        <StatBox
                            title={totalReservation}
                            subtitle="Total Reservation"
                            progress="0.50"
                            icon1={
                                <AddHomeIcon
                                    sx={{color: colors.greenAccent[600], fontSize: "40px"}}
                                />
                            }
                            icon2={
                                <AspectRatioIcon
                                    sx={{color: colors.greenAccent[600], fontSize: "40px"}}
                                />
                            }
                        />
                    </Box>
                    <Box
                        gridColumn={role === "admin" ? "span 4" : "span 6"}
                        backgroundColor={colors.primary[400]}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                    >
                        <StatBox
                            title={totalPayment}
                            subtitle="Booking Amount"
                            progress="0.75"
                            icon1={
                                <LocalAtmIcon
                                    sx={{color: colors.greenAccent[600], fontSize: "40px"}}
                                />
                            }
                            icon2={
                                <AspectRatioIcon
                                    sx={{color: colors.greenAccent[600], fontSize: "40px"}}
                                />
                            }
                        />
                    </Box>

                    {/* ROW 2 */}
                    <Box
                        gridColumn="span 12"
                        gridRow="span 2"
                        backgroundColor={colors.primary[400]}
                    >
                        <Box
                            mt="25px"
                            p="0 30px"
                            display="flex "
                            justifyContent="space-between"
                            alignItems="center"
                        >
                            <Box>
                                <Typography
                                    variant="h5"
                                    fontWeight="600"
                                    color={colors.grey[100]}
                                >
                                    House in Each Country
                                </Typography>
                                <Typography
                                    variant="h5"
                                    fontWeight="bold"
                                    color={colors.greenAccent[500]}
                                >
                                    Line Chart View
                                </Typography>
                            </Box>
                        </Box>
                        <Box height="250px" m="-20px 0 0 0">
                            <LineChart isDashboard={true}/>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </div>
    );
};

export default Dashboard;