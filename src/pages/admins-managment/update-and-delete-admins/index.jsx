import Head from "next/head";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import LoaderPage from "@/components/LoaderPage";
import ErrorOnLoadingThePage from "@/components/ErrorOnLoadingThePage";
import AdminPanelHeader from "@/components/AdminPanelHeader";
import PaginationBar from "@/components/PaginationBar";
import { inputValuesValidation } from "../../../../public/global_functions/validations";
import { getAdminInfo } from "../../../../public/global_functions/popular";
import { HiOutlineBellAlert } from "react-icons/hi2";
import NotFoundError from "@/components/NotFoundError";
import TableLoader from "@/components/TableLoader";

export default function UpdateAndDeleteAdmins() {

    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const [errorMsgOnLoadingThePage, setErrorMsgOnLoadingThePage] = useState("");

    const [adminInfo, setAdminInfo] = useState({});

    const [allAdminsInsideThePage, setAllAdminsInsideThePage] = useState([]);

    const [isGetAdmins, setIsGetAdmins] = useState(false);

    const [selectedAdminIndex, setSelectedAdminIndex] = useState(-1);

    const [waitMsg, setWaitMsg] = useState("");

    const [successMsg, setSuccessMsg] = useState("");

    const [errorMsg, setErrorMsg] = useState("");

    const [errorMsgOnGetAdminsData, setErrorMsgOnGetAdminsData] = useState("");

    const [currentPage, setCurrentPage] = useState(1);

    const [totalPagesCount, setTotalPagesCount] = useState(0);

    const [filters, setFilters] = useState({
        adminId: "",
        firstName: "",
        lastName: "",
        email: "",
    });

    const [formValidationErrors, setFormValidationErrors] = useState({});

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
                        if (!adminDetails.isMerchant) {
                            localStorage.removeItem(process.env.adminTokenNameInLocalStorage);
                            await router.replace("/");
                        } else {
                            setAdminInfo(adminDetails);
                            const tempFilters = { ...filters, storeId: adminDetails.storeId };
                            setFilters(tempFilters);
                            result = await getAdminsCount();
                            if (result.data > 0) {
                                setAllAdminsInsideThePage((await getAllAdminsInsideThePage(1, pageSize, getFilteringString(tempFilters))).data);
                                setTotalPagesCount(Math.ceil(result.data / pageSize));
                            }
                            setIsLoadingPage(false);
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

    const getAdminsCount = async (filters) => {
        try {
            return (await axios.get(`${process.env.BASE_API_URL}/admins/admins-count?language=${process.env.defaultLanguage}&${filters ? filters : ""}`, {
                headers: {
                    Authorization: localStorage.getItem(process.env.adminTokenNameInLocalStorage)
                }
            })).data;
        }
        catch (err) {
            throw err;
        }
    }

    const getAllAdminsInsideThePage = async (pageNumber, pageSize, filters) => {
        try {
            return (await axios.get(`${process.env.BASE_API_URL}/admins/all-admins-inside-the-page?pageNumber=${pageNumber}&pageSize=${pageSize}&language=${process.env.defaultLanguage}&${filters ? filters : ""}`, {
                headers: {
                    Authorization: localStorage.getItem(process.env.adminTokenNameInLocalStorage)
                }
            })).data;
        }
        catch (err) {
            throw err;
        }
    }

    const getPreviousPage = async () => {
        try {
            setIsGetAdmins(true);
            setErrorMsgOnGetAdminsData("");
            const newCurrentPage = currentPage - 1;
            setAllAdminsInsideThePage((await getAllAdminsInsideThePage(newCurrentPage, pageSize, getFilteringString(filters))).data);
            setCurrentPage(newCurrentPage);
            setIsGetAdmins(false);
        }
        catch (err) {
            if (err?.response?.status === 401) {
                localStorage.removeItem(process.env.adminTokenNameInLocalStorage);
                await router.replace("/login");
            }
            else {
                setErrorMsgOnGetAdminsData(err?.message === "Network Error" ? "Network Error When Get Admins Data" : "Sorry, Someting Went Wrong When Get Admins Data, Please Repeate The Process !!");
            }
        }
    }

    const getNextPage = async () => {
        try {
            setIsGetAdmins(true);
            setErrorMsgOnGetAdminsData("");
            const newCurrentPage = currentPage + 1;
            setAllAdminsInsideThePage((await getAllAdminsInsideThePage(newCurrentPage, pageSize, getFilteringString(filters))).data);
            setCurrentPage(newCurrentPage);
            setIsGetAdmins(false);
        }
        catch (err) {
            if (err?.response?.status === 401) {
                localStorage.removeItem(process.env.adminTokenNameInLocalStorage);
                await router.replace("/login");
            }
            else {
                setErrorMsgOnGetAdminsData(err?.message === "Network Error" ? "Network Error When Get Admins Data" : "Sorry, Someting Went Wrong When Get Admins Data, Please Repeate The Process !!");
            }
        }
    }

    const getSpecificPage = async (pageNumber) => {
        try {
            setIsGetAdmins(true);
            setErrorMsgOnGetAdminsData("");
            setAllAdminsInsideThePage((await getAllAdminsInsideThePage(pageNumber, pageSize, getFilteringString(filters))).data);
            setCurrentPage(pageNumber);
            setIsGetAdmins(false);
        }
        catch (err) {
            if (err?.response?.status === 401) {
                localStorage.removeItem(process.env.adminTokenNameInLocalStorage);
                await router.replace("/login");
            }
            else {
                setErrorMsgOnGetAdminsData(err?.message === "Network Error" ? "Network Error When Get Admins Data" : "Sorry, Someting Went Wrong When Get Admins Data, Please Repeate The Process !!");
            }
        }
    }

    const getFilteringString = (filters) => {
        let filteringString = "";
        if (filters.storeId) filteringString += `storeId=${filters.storeId}&`;
        if (filters.adminId) filteringString += `_id=${filters.adminId}&`;
        if (filters.firstName) filteringString += `firstName=${filters.firstName}&`;
        if (filters.lastName) filteringString += `lastName=${filters.lastName}&`;
        if (filters.email) filteringString += `email=${filters.email}&`;
        if (filteringString) filteringString = filteringString.substring(0, filteringString.length - 1);
        return filteringString;
    }

    const filterAdmins = async (filters) => {
        try {
            setIsGetAdmins(true);
            setCurrentPage(1);
            const filteringString = getFilteringString(filters);
            const result = await getAdminsCount(filteringString);
            if (result.data > 0) {
                setAllAdminsInsideThePage((await getAllAdminsInsideThePage(1, pageSize, filteringString)).data);
                setTotalPagesCount(Math.ceil(result.data / pageSize));
                setIsGetAdmins(false);
            } else {
                setAllAdminsInsideThePage([]);
                setTotalPagesCount(0);
                setIsGetAdmins(false);
            }
        }
        catch (err) {
            if (err?.response?.status === 401) {
                localStorage.removeItem(process.env.adminTokenNameInLocalStorage);
                await router.replace("/login");
            }
            else {
                setIsGetAdmins(false);
                setErrorMsg(err?.message === "Network Error" ? "Network Error" : "Sorry, Someting Went Wrong, Please Repeate The Process !!");
                let errorTimeout = setTimeout(() => {
                    setErrorMsg("");
                    clearTimeout(errorTimeout);
                }, 1500);
            }
        }
    }

    const changeAdminData = (adminIndex, fieldName, newValue) => {
        setSelectedAdminIndex(-1);
        allAdminsInsideThePage[adminIndex][fieldName] = newValue;
    }

    const updateAdminData = async (adminIndex) => {
        try {
            setFormValidationErrors({});
            const errorsObject = inputValuesValidation([
                {
                    name: "firstName",
                    value: allAdminsInsideThePage[adminIndex].firstName,
                    rules: {
                        isRequired: {
                            msg: "Sorry, This Field Can't Be Empty !!",
                        },
                        isName: {
                            msg: "Sorry, This Name Is Not Valid !!",
                        },
                    },
                },
                {
                    name: "lastName",
                    value: allAdminsInsideThePage[adminIndex].lastName,
                    rules: {
                        isRequired: {
                            msg: "Sorry, This Field Can't Be Empty !!",
                        },
                        isName: {
                            msg: "Sorry, This Name Is Not Valid !!",
                        },
                    },
                },
                {
                    name: "email",
                    value: allAdminsInsideThePage[adminIndex].email,
                    rules: {
                        isRequired: {
                            msg: "Sorry, This Field Can't Be Empty !!",
                        },
                        isEmail: {
                            msg: "Sorry, Invalid Email !!",
                        },
                    },
                },
            ]);
            setFormValidationErrors(errorsObject);
            setSelectedAdminIndex(adminIndex);
            if (Object.keys(errorsObject).length == 0) {
                setWaitMsg("Please Wait To Updating ...");
                const result = (await axios.put(`${process.env.BASE_API_URL}/admins/update-admin-info/${allAdminsInsideThePage[adminIndex]._id}?language=${process.env.defaultLanguage}`, {
                    firstName: allAdminsInsideThePage[adminIndex].firstName,
                    lastName: allAdminsInsideThePage[adminIndex].lastName,
                    email: allAdminsInsideThePage[adminIndex].email,
                }, {
                    headers: {
                        Authorization: localStorage.getItem(process.env.adminTokenNameInLocalStorage),
                    }
                })).data;
                if (!result.error) {
                    setWaitMsg("");
                    setSuccessMsg("Updating Successfull !!");
                    let successTimeout = setTimeout(() => {
                        setSuccessMsg("");
                        setSelectedAdminIndex(-1);
                        clearTimeout(successTimeout);
                    }, 3000);
                } else {
                    setErrorMsg("Sorry, Someting Went Wrong, Please Repeate The Process !!");
                    let errorTimeout = setTimeout(() => {
                        setErrorMsg("");
                        setSelectedAdminIndex(-1);
                        clearTimeout(errorTimeout);
                    }, 3000);
                }
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
                    setSelectedAdminIndex(-1);
                    clearTimeout(errorTimeout);
                }, 1500);
            }
        }
    }

    const deleteAdmin = async (adminIndex) => {
        try {
            setWaitMsg("Please Wait To Deleting ...");
            setSelectedAdminIndex(adminIndex);
            let result = (await axios.delete(`${process.env.BASE_API_URL}/admins/delete-admin/${allAdminsInsideThePage[adminIndex]._id}?language=${process.env.defaultLanguage}`, {
                headers: {
                    Authorization: localStorage.getItem(process.env.adminTokenNameInLocalStorage),
                }
            })).data;
            setWaitMsg("");
            if (!result.error) {
                setSuccessMsg("Deleting Successfull !!");
                let successTimeout = setTimeout(async () => {
                    setSuccessMsg("");
                    setSelectedAdminIndex(-1);
                    setIsGetAdmins(true);
                    result = await getAdminsCount();
                    if (result.data > 0) {
                        setAllAdminsInsideThePage((await getAllAdminsInsideThePage(currentPage, pageSize)).data);
                        setTotalPagesCount(Math.ceil(result.data / pageSize));
                    }
                    setCurrentPage(1);
                    setIsGetAdmins(false);
                    clearTimeout(successTimeout);
                }, 3000);
            } else {
                setErrorMsg("Sorry, Someting Went Wrong, Please Repeate The Process !!");
                let errorTimeout = setTimeout(() => {
                    setErrorMsg("");
                    setSelectedAdminIndex(-1);
                    clearTimeout(errorTimeout);
                }, 3000);
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
                    setSelectedAdminIndex(-1);
                    clearTimeout(errorTimeout);
                }, 1500);
            }
        }
    }

    return (
        <div className="admins-managment admin-dashboard">
            <Head>
                <title>{process.env.storeName} Admin Dashboard - Admins Managment</title>
            </Head>
            {!isLoadingPage && !errorMsgOnLoadingThePage && <>
                {/* Start Admin Dashboard Side Bar */}
                <AdminPanelHeader isWebsiteOwner={adminInfo.isWebsiteOwner} isMerchant={adminInfo.isMerchant} />
                {/* Start Admin Dashboard Side Bar */}
                {/* Start Content Section */}
                <section className="page-content d-flex justify-content-center align-items-center flex-column text-center pt-5 pb-5">
                    <div className="container-fluid">
                        <h1 className="welcome-msg mb-4 fw-bold pb-3 mx-auto">Hi, Mr {adminInfo.firstName + " " + adminInfo.lastName} In Admins Managment</h1>
                        <section className="filters mb-3 bg-white border-3 border-info p-3 text-start">
                            <h5 className="section-name fw-bold text-center">Filters: </h5>
                            <hr />
                            <div className="row mb-4">
                                <div className="col-md-6">
                                    <h6 className="me-2 fw-bold text-center">Admin Id</h6>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Pleae Enter Admin Id"
                                        onChange={(e) => setFilters({ ...filters, adminId: e.target.value.trim() })}
                                    />
                                </div>
                                <div className="col-md-6">
                                    <h6 className="me-2 fw-bold text-center">Email</h6>
                                    <input
                                        type="email"
                                        className="form-control"
                                        placeholder="Pleae Enter Email"
                                        onChange={(e) => setFilters({ ...filters, email: e.target.value.trim() })}
                                    />
                                </div>
                                <div className="col-md-6 mt-3">
                                    <h6 className="me-2 fw-bold text-center">First Name</h6>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Pleae Enter First Name"
                                        onChange={(e) => setFilters({ ...filters, firstName: e.target.value.trim() })}
                                    />
                                </div>
                                <div className="col-md-6 mt-3">
                                    <h6 className="me-2 fw-bold text-center">Last Name</h6>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Pleae Enter Last Name"
                                        onChange={(e) => setFilters({ ...filters, lastName: e.target.value.trim() })}
                                    />
                                </div>
                            </div>
                            {!isGetAdmins && <button
                                className="btn btn-success d-block w-25 mx-auto mt-2 global-button"
                                onClick={() => filterAdmins(filters)}
                            >
                                Filter
                            </button>}
                            {isGetAdmins && <button
                                className="btn btn-success d-block w-25 mx-auto mt-2 global-button"
                                disabled
                            >
                                Filtering ...
                            </button>}
                        </section>
                        {allAdminsInsideThePage.length > 0 && !isGetAdmins && !errorMsgOnGetAdminsData && <section className="admins-data-box p-3 data-box admin-dashbboard-data-box">
                            <table className="admins-data-table mb-4 managment-table bg-white admin-dashbboard-data-table">
                                <thead>
                                    <tr>
                                        <th>Admin Id</th>
                                        <th>First Name</th>
                                        <th>Last Name</th>
                                        <th>Email</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {allAdminsInsideThePage.map((admin, adminIndex) => (
                                        <tr key={admin._id}>
                                            <td>{admin._id}</td>
                                            <td>
                                                <section className="first-name mb-4">
                                                    <input
                                                        type="text"
                                                        defaultValue={admin.firstName}
                                                        className={`form-control d-block mx-auto p-2 border-2 first-name-field ${formValidationErrors["firstName"] && adminIndex === selectedAdminIndex ? "border-danger mb-3" : "mb-4"}`}
                                                        placeholder="Pleae Enter New First Name"
                                                        onChange={(e) => changeAdminData(adminIndex, "firstName", e.target.value)}
                                                    />
                                                    {formValidationErrors["firstName"] && adminIndex === selectedAdminIndex && <p className="bg-danger p-2 form-field-error-box m-0 text-white">
                                                        <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                                        <span>{formValidationErrors["firstName"]}</span>
                                                    </p>}
                                                </section>
                                            </td>
                                            <td>
                                                <section className="last-name mb-4">
                                                    <input
                                                        type="text"
                                                        defaultValue={admin.lastName}
                                                        className={`form-control d-block mx-auto p-2 border-2 last-name-field ${formValidationErrors["lastName"] && adminIndex === selectedAdminIndex ? "border-danger mb-3" : "mb-4"}`}
                                                        placeholder="Pleae Enter New Last Name"
                                                        onChange={(e) => changeAdminData(adminIndex, "lastName", e.target.value)}
                                                    />
                                                    {formValidationErrors["lastName"] && adminIndex === selectedAdminIndex && <p className="bg-danger p-2 form-field-error-box m-0 text-white">
                                                        <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                                        <span>{formValidationErrors["lastName"]}</span>
                                                    </p>}
                                                </section>
                                            </td>
                                            <td>
                                                <section className="email mb-4">
                                                    <input
                                                        type="text"
                                                        defaultValue={admin.email}
                                                        className={`form-control d-block mx-auto p-2 border-2 email-field ${formValidationErrors["email"] && adminIndex === selectedAdminIndex ? "border-danger mb-3" : "mb-4"}`}
                                                        placeholder="Pleae Enter New Email"
                                                        onChange={(e) => changeAdminData(adminIndex, "email", e.target.value)}
                                                    />
                                                    {formValidationErrors["email"] && adminIndex === selectedAdminIndex && <p className="bg-danger p-2 form-field-error-box m-0 text-white">
                                                        <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                                        <span>{formValidationErrors["email"]}</span>
                                                    </p>}
                                                </section>
                                            </td>
                                            <td>
                                                {adminIndex !== selectedAdminIndex &&
                                                    <button
                                                        className="btn btn-info d-block mx-auto mb-3 global-button"
                                                        onClick={() => updateAdminData(adminIndex)}
                                                    >
                                                        Update
                                                    </button>
                                                }
                                                {
                                                    adminIndex !== selectedAdminIndex &&
                                                    !admin.isMerchant &&
                                                    <button
                                                        className="btn btn-danger d-block mx-auto mb-3 global-button"
                                                        onClick={() => deleteAdmin(adminIndex)}
                                                    >
                                                        Delete
                                                    </button>
                                                }
                                                {waitMsg && adminIndex === selectedAdminIndex && <button
                                                    className="btn btn-info d-block mx-auto mb-3 global-button"
                                                    disabled
                                                >
                                                    {waitMsg}
                                                </button>}
                                                {successMsg && adminIndex === selectedAdminIndex && <button
                                                    className="btn btn-success d-block mx-auto mb-3 global-button"
                                                    disabled
                                                >
                                                    {successMsg}
                                                </button>}
                                                {errorMsg && adminIndex === selectedAdminIndex && <button
                                                    className="btn btn-danger d-block mx-auto mb-3 global-button"
                                                    disabled
                                                >
                                                    {errorMsg}
                                                </button>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </section>}
                        {allAdminsInsideThePage.length === 0 && !isGetAdmins && <NotFoundError errorMsg="Sorry, Can't Find Any Admins !!" />}
                        {isGetAdmins && <TableLoader />}
                        {errorMsgOnGetAdminsData && <NotFoundError errorMsg={errorMsgOnGetAdminsData} />}
                        {totalPagesCount > 1 && !isGetAdmins &&
                            <PaginationBar
                                totalPagesCount={totalPagesCount}
                                currentPage={currentPage}
                                getPreviousPage={getPreviousPage}
                                getNextPage={getNextPage}
                                getSpecificPage={getSpecificPage}
                            />
                        }
                    </div>
                </section>
                {/* End Content Section */}
            </>}
            {isLoadingPage && !errorMsgOnLoadingThePage && <LoaderPage />}
            {errorMsgOnLoadingThePage && <ErrorOnLoadingThePage errorMsg={errorMsgOnLoadingThePage} />}
        </div>
    );
}