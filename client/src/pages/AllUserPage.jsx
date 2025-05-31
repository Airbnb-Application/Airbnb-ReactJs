import { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import api from "../action/axios-interceptor.js";
import ROUTES from "../constants/routes.js";
import storeToken from "../hooks/storeToken.js";
import useAuth from "../hooks/useAuth.js";
import useLoginModal from "../hooks/useLoginModal.js";

const AllUserPage = () => {
  const [records, setRecords] = useState([]);
  const { authToken } = useAuth();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const { role } = storeToken();
  const loginModal = useLoginModal();
  const [isStatusChanged, setIsStatusChanged] = useState(false);

  // Thay thế hàm handleDelete bằng hàm toggleStatus
  const handleToggleStatus = async (id, currentStatus) => {
    try {
      // Xác định trạng thái mới (ngược với trạng thái hiện tại)
      const newStatus = currentStatus === "active" ? "inactive" : "active";

      // Gọi API để cập nhật trạng thái người dùng
      const response = await api.patch(`/api/admin/user/${id}/status`, {
        status: newStatus,
      });

      // Kiểm tra phản hồi từ server
      if (response.status === 200) {
        toast.success(
          `User ${
            newStatus === "active" ? "activated" : "deactivated"
          } successfully`
        );

        // Cập nhật trạng thái local để trigger re-render
        setIsStatusChanged((prev) => !prev);

        // Tùy chọn: Cập nhật trạng thái trong bảng mà không cần gọi lại API
        setRecords((prevRecords) =>
          prevRecords.map((user) =>
            user._id === id ? { ...user, status: newStatus } : user
          )
        );
      } else {
        toast.error("Failed to update user status");
      }
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Something went wrong");
    }
  };

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
        },
      },
    },
  };

  // Định nghĩa classes cho các nút
  const classDisable =
    "font-bold px-2 py-1 mr-2 opacity-50 cursor-not-allowed bg-gray-300 rounded-md w-24";
  const classActivate =
    "font-bold px-2 py-1 mr-2 bg-green-500 hover:bg-green-600 text-white rounded-md cursor-pointer w-24";
  const classDeactivate =
    "font-bold px-2 py-1 mr-2 bg-amber-500 hover:bg-amber-600 text-white rounded-md cursor-pointer w-24";
  const classView =
    "font-bold px-2 py-1 mr-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md cursor-pointer w-20";

  // Cập nhật định nghĩa columns để hiển thị trạng thái và nút toggle
  const columns = [
    {
      name: "Name",
      selector: (row) => row.name,
      sortable: true,
    },
    {
      name: "Email",
      selector: (row) => row.email,
      sortable: true,
    },
    {
      name: "Role",
      selector: (row) => row.role,
      sortable: true,
    },
    {
      name: "Provider",
      selector: (row) => (row.provider ? row.provider : "local"),
    },
    {
      name: "Status",
      selector: (row) => row.status || "active",
      sortable: true,
      cell: (row) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium 
                    ${
                      row.status === "inactive"
                        ? "bg-red-100 text-red-800"
                        : "bg-green-100 text-green-800"
                    }`}
        >
          {row.status === "inactive" ? "Inactive" : "Active"}
        </span>
      ),
    },
    {
      name: "View",
      cell: (row) => (
        <button
          onClick={() => navigate(`/profile?userId=${row._id}`)}
          className={classView}
        >
          View
        </button>
      ),
    },
    {
      name: "Action",
      cell: (row) => (
        <button
          onClick={() => handleToggleStatus(row._id, row.status || "active")}
          className={
            row.role === "admin"
              ? classDisable
              : row.status === "inactive"
              ? classActivate
              : classDeactivate
          }
          disabled={row.role === "admin"}
        >
          {row.status === "inactive" ? "Activate" : "Deactivate"}
        </button>
      ),
    },
  ];

  const fetchData = async (query) => {
    try {
      let url = "/api/admin/users";
      if (query) {
        url += `?name=${query}`;
      }

      const response = await api.get(url);
      console.log(response.data);

      // Đảm bảo mỗi user có status (mặc định là "active" nếu không có)
      const usersWithStatus = response.data.users.map((user) => ({
        ...user,
        status: user.status || "active",
      }));

      setRecords(usersWithStatus);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch users");
    }
  };

  useEffect(() => {
    if (!isAuthenticated && role !== "admin") {
      navigate(ROUTES.HOME);
      toast.error("Please login with admin privileges");
      loginModal.onOpen();
      return;
    }
    fetchData();
  }, [isStatusChanged]); // Thay isDeleted thành isStatusChanged

  function handleFilter(e) {
    const value = e.target.value.toLowerCase();
    fetchData(value);
  }

  return (
    <div className="pt-[120px] px-20 bg-gray-100 min-h-screen w-full">
      <h1 className="text-4xl text-indigo-500 mb-8 text-center bg-indigo-200 p-4 rounded-lg shadow-lg">
        User Management
      </h1>
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
          fixedHeader
          pagination
          className="w-full"
          paginationPerPage={10}
          paginationRowsPerPageOptions={[5, 10, 15, 20]}
        />
      </div>
    </div>
  );
};

export default AllUserPage;
