import Head from "next/head";
import { PiHandWavingThin } from "react-icons/pi";
import { useEffect, useState } from "react";
import axios from "axios";
import LoaderPage from "@/components/LoaderPage";
import ErrorOnLoadingThePage from "@/components/ErrorOnLoadingThePage";
import AdminPanelHeader from "@/components/AdminPanelHeader";
import { useRouter } from "next/router";
import PaginationBar from "@/components/PaginationBar";
import { getAdminInfo, getDateFormated, handleDisplayConfirmDeleteBox } from "../../../public/global_functions/popular";
import NotFoundError from "@/components/NotFoundError";
import TableLoader from "@/components/TableLoader";
import ConfirmDelete from "@/components/ConfirmDelete";

export default function UsersManagment() {

    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const [errorMsgOnLoadingThePage, setErrorMsgOnLoadingThePage] = useState("");

    const [adminInfo, setAdminInfo] = useState({});

    const [isGetUsers, setIsGetUsers] = useState(false);

    const [allUsersInsideThePage, setAllUsersInsideThePage] = useState([]);

    const [waitMsg, setWaitMsg] = useState("");

    const [selectedUserIndex, setSelectedUserIndex] = useState(-1);

    const [errorMsg, setErrorMsg] = useState("");

    const [errorMsgOnGetUsersData, setErrorMsgOnGetUsersData] = useState("");

    const [successMsg, setSuccessMsg] = useState("");

    const [currentPage, setCurrentPage] = useState(1);

    const [totalPagesCount, setTotalPagesCount] = useState(0);

    const [filters, setFilters] = useState({
        isVerified: "",
        _id: "",
        firstName: "",
        lastName: "",
    });

    const [isDisplayConfirmDeleteBox, setIsDisplayConfirmDeleteBox] = useState(false);

    const router = useRouter();

    const pageSize = 10;

    useEffect(() => {
        const adminToken = localStorage.getItem(process.env.adminTokenNameInLocalStorage);
        if (adminToken) {
            getAdminInfo()
                .then(async (result) => {
                    if (result.error) {
                        localStorage.removeItem(process.env.adminTokenNameInLocalStorage);
                        await router.replace("/login");
                    } else {
                        const adminDetails = result.data;
                        if (adminDetails.isWebsiteOwner) {
                            setAdminInfo(adminDetails);
                            const filtersAsQuery = getFiltersAsQuery(filters);
                            result = (await getAllUsersInsideThePage(1, pageSize, filtersAsQuery)).data;
                            setAllUsersInsideThePage(result.users);
                            setTotalPagesCount(Math.ceil(result.usersCount / pageSize));
                            setIsLoadingPage(false);
                        }
                        else {
                            await router.replace("/");
                        }
                    }
                })
                .catch(async (err) => {
                    if (err?.response?.status === 401) {
                        localStorage.removeItem(process.env.adminTokenNameInLocalStorage);
                        await router.replace("/login");
                    }
                    else {
                        setIsLoadingPage(false);
                        setErrorMsgOnLoadingThePage(err?.message === "Network Error" ? "Network Error" : "Sorry, Something Went Wrong, Please Try Again !");
                    }
                });
        } else router.replace("/login");
    }, []);

    const getFiltersAsQuery = (filters) => {
        let filteringString = "";
        if (filters.isVerified) filteringString += `isVerified=${filters.isVerified}&`;
        if (filters._id) filteringString += `_id=${filters._id}&`;
        if (filters.email) filteringString += `email=${filters.email}&`;
        if (filters.firstName) filteringString += `firstName=${filters.firstName}&`;
        if (filters.lastName) filteringString += `lastName=${filters.lastName}&`;
        if (filters.provider) filteringString += `provider=${filters.provider}&`;
        if (filteringString) filteringString = filteringString.substring(0, filteringString.length - 1);
        return filteringString;
    }

    const getAllUsersInsideThePage = async (pageNumber, pageSize, filters) => {
        try {
            return (await axios.get(`${process.env.BASE_API_URL}/users/all-users-inside-the-page?pageNumber=${pageNumber}&pageSize=${pageSize}&language=${process.env.defaultLanguage}&${filters ? filters : ""}`, {
                headers: {
                    Authorization: localStorage.getItem(process.env.adminTokenNameInLocalStorage),
                }
            })).data;
        }
        catch (err) {
            throw err;
        }
    }

    const getPreviousPage = async () => {
        try {
            setIsGetUsers(true);
            setErrorMsgOnGetUsersData("");
            const newCurrentPage = currentPage - 1;
            setAllUsersInsideThePage((await getAllUsersInsideThePage(newCurrentPage, pageSize)).data.users);
            setCurrentPage(newCurrentPage);
            setIsGetUsers(false);
        }
        catch (err) {
            if (err?.response?.status === 401) {
                localStorage.removeItem(process.env.adminTokenNameInLocalStorage);
                await router.replace("/login");
            }
            else {
                setIsGetUsers(false);
                setErrorMsgOnGetUsersData(err?.message === "Network Error" ? "Network Error When Get Users Data" : "Sorry, Someting Went Wrong When Get Users Data, Please Repeate The Process !!");
            }
        }
    }

    const getNextPage = async () => {
        try {
            setIsGetUsers(true);
            setErrorMsgOnGetUsersData("");
            const newCurrentPage = currentPage + 1;
            setAllUsersInsideThePage((await getAllUsersInsideThePage(newCurrentPage, pageSize)).data.users);
            setCurrentPage(newCurrentPage);
            setIsGetUsers(false);
        }
        catch (err) {
            if (err?.response?.status === 401) {
                localStorage.removeItem(process.env.adminTokenNameInLocalStorage);
                await router.replace("/login");
            }
            else {
                setIsGetUsers(false);
                setErrorMsgOnGetUsersData(err?.message === "Network Error" ? "Network Error When Get Users Data" : "Sorry, Someting Went Wrong When Get Users Data, Please Repeate The Process !!");
            }
        }
    }

    const getSpecificPage = async (pageNumber) => {
        try {
            setIsGetUsers(true);
            setErrorMsgOnGetUsersData("");
            setAllUsersInsideThePage((await getAllUsersInsideThePage(pageNumber, pageSize)).data.users);
            setCurrentPage(pageNumber);
            setIsGetUsers(false);
        }
        catch (err) {
            if (err?.response?.status === 401) {
                localStorage.removeItem(process.env.adminTokenNameInLocalStorage);
                await router.replace("/login");
            }
            else {
                setIsGetUsers(false);
                setErrorMsgOnGetUsersData(err?.message === "Network Error" ? "Network Error When Get Users Data" : "Sorry, Someting Went Wrong When Get Users Data, Please Repeate The Process !!");
            }
        }
    }

    const filterUsers = async (filters) => {
        try {
            setIsGetUsers(true);
            setCurrentPage(1);
            const result = (await getAllUsersInsideThePage(1, pageSize, getFiltersAsQuery(filters))).data;
            setAllUsersInsideThePage(result.users);
            setTotalPagesCount(Math.ceil(result.usersCount / pageSize));
            setIsGetUsers(false);
        }
        catch (err) {
            if (err?.response?.status === 401) {
                localStorage.removeItem(process.env.adminTokenNameInLocalStorage);
                await router.replace("/login");
            }
            else {
                setIsGetUsers(false);
                setErrorMsg(err?.message === "Network Error" ? "Network Error" : "Sorry, Someting Went Wrong, Please Repeate The Process !!");
                let errorTimeout = setTimeout(() => {
                    setErrorMsg("");
                    clearTimeout(errorTimeout);
                }, 1500);
            }
        }
    }

    const deleteUser = async (userIndex) => {
        try {
            setWaitMsg("Please Wait To Deleting ...");
            setSelectedUserIndex(userIndex);
            const result = (await axios.delete(`${process.env.BASE_API_URL}/users/${allUsersInsideThePage[userIndex]._id}?language=${process.env.defaultLanguage}`, {
                headers: {
                    Authorization: localStorage.getItem(process.env.adminTokenNameInLocalStorage),
                }
            })).data;
            setWaitMsg("");
            if (!result.error) {
                setSuccessMsg("Deleting Successfull !!");
                let successTimeout = setTimeout(async () => {
                    setSuccessMsg("");
                    setSelectedUserIndex(-1);
                    setAllUsersInsideThePage(allUsersInsideThePage.filter((user, index) => index !== userIndex));
                    clearTimeout(successTimeout);
                }, 1500);
            } else {
                setErrorMsg("Sorry, Someting Went Wrong, Please Repeate The Process !!");
                let errorTimeout = setTimeout(() => {
                    setErrorMsg("");
                    setSelectedUserIndex(-1);
                    clearTimeout(errorTimeout);
                }, 1500);
            }
        }
        catch (err) {
            if (err?.response?.status === 401) {
                localStorage.removeItem(process.env.adminTokenNameInLocalStorage);
                await router.replace("/login");
            }
            else {
                setWaitMsg("");
                setErrorMsg(err?.message === "Network Error" ? "Network Error" : "Sorry, Someting Went Wrong, Please Repeate The Process !!");
                let errorTimeout = setTimeout(() => {
                    setErrorMsg("");
                    setSelectedUserIndex(-1);
                    clearTimeout(errorTimeout);
                }, 1500);
            }
        }
    }

    return (
        <div className="users-managment admin-dashboard">
            <Head>
                <title>{process.env.storeName} Admin Dashboard - Users Managment</title>
            </Head>
            {!isLoadingPage && !errorMsgOnLoadingThePage && <>
                <AdminPanelHeader isWebsiteOwner={adminInfo.isWebsiteOwner} isMerchant={adminInfo.isMerchant} />
                {isDisplayConfirmDeleteBox && <ConfirmDelete
                    name="Product"
                    setIsDisplayConfirmDeleteBox={setIsDisplayConfirmDeleteBox}
                    handleDeleteFunc={() => deleteUser(selectedUserIndex)}
                    setSelectedElementIndex={setSelectedUserIndex}
                    waitMsg={waitMsg}
                    errorMsg={errorMsg}
                    successMsg={successMsg}
                />}
                <div className="page-content d-flex justify-content-center align-items-center flex-column text-center pt-5 pb-5">
                    <div className="container-fluid">
                        <h1 className="welcome-msg mb-4 fw-bold pb-3 mx-auto">
                            <PiHandWavingThin className="me-2" />
                            Hi, Mr {adminInfo.firstName + " " + adminInfo.lastName} In Your Users Managment Page
                        </h1>
                        <section className="filters mb-5 bg-white border-3 border-info p-3 text-start">
                            <h5 className="section-name fw-bold text-center">Filters: </h5>
                            <hr />
                            <div className="row mb-4">
                                <div className="col-md-4">
                                    <h6 className="me-2 fw-bold text-center">User Id</h6>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Pleae Enter User Id"
                                        onChange={(e) => setFilters({ ...filters, _id: e.target.value.trim() })}
                                    />
                                </div>
                                <div className="col-md-4">
                                    <h6 className="me-2 fw-bold text-center">Email</h6>
                                    <input
                                        type="email"
                                        className="form-control"
                                        placeholder="Pleae Enter Email"
                                        onChange={(e) => setFilters({ ...filters, email: e.target.value.trim() })}
                                    />
                                </div>
                                <div className="col-md-4 mt-3">
                                    <h6 className="me-2 fw-bold text-center">First Name</h6>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Pleae Enter First Name"
                                        onChange={(e) => setFilters({ ...filters, firstName: e.target.value.trim() })}
                                    />
                                </div>
                                <div className="col-md-4 mt-3">
                                    <h6 className="me-2 fw-bold text-center">Last Name</h6>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Pleae Enter Last Name"
                                        onChange={(e) => setFilters({ ...filters, lastName: e.target.value.trim() })}
                                    />
                                </div>
                                <div className="col-md-4 mt-4">
                                    <h6 className="me-2 fw-bold text-center">Checkout Status</h6>
                                    <select
                                        className="select-order-status form-select"
                                        onChange={(e) => setFilters({ ...filters, provider: e.target.value })}
                                    >
                                        <option value="" hidden>Pleae Enter Registeration Method</option>
                                        <option value="">All</option>
                                        <option value="google">Google</option>
                                        <option value="same-site">Same Site</option>
                                    </select>
                                </div>
                                <div className="col-md-4 mt-4">
                                    <h6 className="me-2 fw-bold text-center">Is Verified</h6>
                                    <select
                                        className="select-order-status form-select"
                                        onChange={(e) => setFilters({ ...filters, isVerified: e.target.value })}
                                    >
                                        <option value="" hidden>Pleae Enter Is Verified</option>
                                        <option value="">All</option>
                                        <option value="true">Verified</option>
                                        <option value="false">Not Verified</option>
                                    </select>
                                </div>
                            </div>
                            {!isGetUsers && <button
                                className="btn btn-success d-block w-25 mx-auto mt-2 global-button"
                                onClick={() => filterUsers(filters)}
                            >
                                Filter
                            </button>}
                            {isGetUsers && <button
                                className="btn btn-success d-block w-25 mx-auto mt-2 global-button"
                                disabled
                            >
                                Filtering ...
                            </button>}
                        </section>
                        {allUsersInsideThePage.length > 0 && !isGetUsers && <section className="users-box w-100">
                            <table className="users-table mb-4 managment-table bg-white w-100">
                                <thead>
                                    <tr>
                                        <th>Id</th>
                                        <th>Email</th>
                                        <th>First Name</th>
                                        <th>Last Name</th>
                                        <th>Date Of Creation</th>
                                        <th>Registeration Method</th>
                                        <th>Process</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {allUsersInsideThePage.map((user, userIndex) => (
                                        <tr key={user._id}>
                                            <td className="user-email-cell">
                                                {user._id}
                                            </td>
                                            <td className="user-email-cell">
                                                {user.email}
                                            </td>
                                            <td className="user-email-cell">
                                                {user.firstName ? user.firstName : "---------"}
                                            </td>
                                            <td className="user-email-cell">
                                                {user.lastName ? user.lastName : "---------"}
                                            </td>
                                            <td className="user-email-cell">
                                                {getDateFormated(user.dateOfCreation)}
                                            </td>
                                            <td className="user-registeration-method-cell">
                                                {user.provider}
                                            </td>
                                            <td className="update-cell">
                                                {selectedUserIndex !== userIndex && <>
                                                    <button
                                                        className="btn btn-danger global-button"
                                                        onClick={() => handleDisplayConfirmDeleteBox(userIndex, setSelectedUserIndex, setIsDisplayConfirmDeleteBox)}
                                                    >Delete</button>
                                                </>}
                                                {waitMsg && selectedUserIndex === userIndex && <button
                                                    className="btn btn-info d-block mb-3 mx-auto global-button"
                                                    disabled
                                                >{waitMsg}</button>}
                                                {successMsg && selectedUserIndex === userIndex && <button
                                                    className="btn btn-success d-block mx-auto global-button"
                                                    disabled
                                                >{successMsg}</button>}
                                                {errorMsg && selectedUserIndex === userIndex && <button
                                                    className="btn btn-danger d-block mx-auto global-button"
                                                    disabled
                                                >{errorMsg}</button>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </section>}
                        {allUsersInsideThePage.length === 0 && !isGetUsers && <NotFoundError errorMsg="Sorry, Can't Find Any Users !!" />}
                        {isGetUsers && <TableLoader />}
                        {errorMsgOnGetUsersData && <NotFoundError errorMsg={errorMsgOnGetUsersData} />}
                        {totalPagesCount > 1 && !isGetUsers &&
                            <PaginationBar
                                totalPagesCount={totalPagesCount}
                                currentPage={currentPage}
                                getPreviousPage={getPreviousPage}
                                getNextPage={getNextPage}
                                getSpecificPage={getSpecificPage}
                            />
                        }
                    </div>
                </div>
            </>}
            {isLoadingPage && !errorMsgOnLoadingThePage && <LoaderPage />}
            {errorMsgOnLoadingThePage && <ErrorOnLoadingThePage errorMsg={errorMsgOnLoadingThePage} />}
        </div>
    );
}