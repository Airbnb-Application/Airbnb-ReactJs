import axios from "axios";
import DataTable from "react-data-table-component";
import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import ROUTES from "../constants/routes.js";
import toast from "react-hot-toast";
import storeToken from "../hooks/storeToken.js";
import useLoginModal from "../hooks/useLoginModal.js";
import useAuth from "../hooks/useAuth.js";
import api from "../action/axios-interceptor.js";
// import { useAuth } from "../hooks/useAuth";


const AllUserPage = () => {
    const [records, setRecords] = useState([]);
    const {authToken} = useAuth();
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(true);
    const {role} = storeToken();
    const loginModal = useLoginModal();
    const [isDeleted, setIsDeleted] = useState(false);


    const handleDelete = async (id) => {
        try {
            console.log(id);
            const response = await axios.delete(`http://localhost:8080/api/admin/user/${id}`, {
                headers: {
                    Authorization: "Bearer " + authToken,
                },
                withCredentials: true,
            });
            console.log(response.data);
            setIsDeleted(!isDeleted);
            toast.success("User deleted successfully");
        } catch (error) {
            console.log(error);
            toast.error("Something went wrong");
        }
    }

    const customStyles = {
        headCells: {
            style: {
                fontSize: "18px",
                fontWeight: "bold",
                color: "#000",
                backgroundColor: "#f3f4f6",
                padding: "8px",
                textAlign: "center",
            },
        },
        rows: {
            style: {
                highlightOnHoverStyle: {
                    backgroundColor: "#f43f5e",
                    color: "#000",
                }
            },
        },
    };

    const classDisable = "font-bold px-2 py-1 mr-2 opacity-50 cursor-not-allowed bg-gray-300 rounded-md w-20";
    const classEnable = "font-bold px-2 py-1 mr-2 bg-rose-500 hover:bg-rose-600 text-white rounded-md cursor-pointer w-20";

    const columns = [
        {
            name: 'Name',
            selector: row => row.name,
            sortable: true,
        },
        {
            name: 'Email',
            selector: row => row.email,
            sortable: true
        },
        {
            name: 'Role',
            selector: row => row.role,
            sortable: true
        },
        {
            name: 'Provider',
            selector: row => row.provider ? row.provider : "local",
        },
        {
            name: 'View',
            cell: row => <button
                onClick={() => navigate(`/profile?userId=${row._id}`)}
                className={classEnable}
            >
                View
            </button>
        },
        {
            name: 'Delete',
            cell: row => <button
                onClick={() => handleDelete(row._id)}
                className={(row.role === "admin") ? classDisable : classEnable}
            >
                Delete
            </button>
        }
    ]

    const fetchData = async (query) => {
        try {
            let url = "/api/admin/users";
            if (query) {
                url += `?name=${query}`
            }
            // const response = await axios.get(url, {
            //     headers: {
            //         Authorization: "Bearer " + authToken,
            //     },
            //     withCredentials: true,
            // });
            const response = await api.get(url);
            console.log(response.data);
            setRecords(response.data.users);
        } catch (error) {
            console.log(error);
            toast.error("Something went wrong");
        }
    };


    useEffect(() => {
        if (!isAuthenticated && role !== "admin") {
            navigate(ROUTES.HOME);
            toast.error("Please login to view your trips");
            loginModal.onOpen();
            return;
        }
        fetchData();
    }, [isDeleted]);

    function handleFilter(e) {
        const value = e.target.value.toLowerCase();
        fetchData(value);
    }

    return (
        <div className="pt-[120px] px-20 bg-gray-100 min-h-screen">
            <h1 className="text-4xl text-indigo-500 mb-8 text-center bg-indigo-200 p-4 rounded-lg shadow-lg">User
                Information</h1>
            <div className="bg-white shadow-md rounded-lg p-8">
                <input
                    type="text"
                    placeholder="Search by name"
                    onChange={handleFilter}
                    className="border border-gray-300 p-2 rounded-md mb-4 w-full"
                />
                <DataTable
                    columns={columns}
                    data={records}
                    customStyles={customStyles}
                    // selectableRows
                    rdt_TableHeader="text-center"
                    fixedHeader
                    pagination
                    className="w-full"
                />
            </div>
        </div>
    );
};

export default AllUserPage;