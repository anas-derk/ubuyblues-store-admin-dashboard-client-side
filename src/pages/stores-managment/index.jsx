import Head from "next/head";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import Link from "next/link";
import LoaderPage from "@/components/LoaderPage";
import ErrorOnLoadingThePage from "@/components/ErrorOnLoadingThePage";
import AdminPanelHeader from "@/components/AdminPanelHeader";
import PaginationBar from "@/components/PaginationBar";
import { inputValuesValidation } from "../../../public/global_functions/validations";
import { HiOutlineBellAlert } from "react-icons/hi2";
import ChangeStoreStatusBox from "@/components/ChangeStoreStatusBox";
import { getAdminInfo, getStoresCount, getAllStoresInsideThePage } from "../../../public/global_functions/popular";
import NotFoundError from "@/components/NotFoundError";
import TableLoader from "@/components/TableLoader";

export default function StoresManagment() {

    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const [errorMsgOnLoadingThePage, setErrorMsgOnLoadingThePage] = useState("");

    const [adminInfo, setAdminInfo] = useState({});

    const [allStoresInsideThePage, setAllStoresInsideThePage] = useState([]);

    const [isGetStores, setIsGetStores] = useState(false);

    const [selectedStoreIndex, setSelectedStoreIndex] = useState(-1);

    const [waitMsg, setWaitMsg] = useState("");

    const [successMsg, setSuccessMsg] = useState("");

    const [errorMsg, setErrorMsg] = useState("");

    const [errorMsgOnGetStoresData, setErrorMsgOnGetStoresData] = useState("");

    const [currentPage, setCurrentPage] = useState(1);

    const [totalPagesCount, setTotalPagesCount] = useState(0);

    const [filters, setFilters] = useState({
        storeId: "",
        name: "",
        status: "",
        ownerFirstName: "",
        ownerLastName: "",
        email: "",
    });

    const [formValidationErrors, setFormValidationErrors] = useState({});

    const [isDisplayChangeStoreStatusBox, setIsDisplayChangeStoreStatusBox] = useState(false);

    const [storeAction, setStoreAction] = useState("");

    const [selectedStore, setSelectedStore] = useState("");

    const router = useRouter();

    const pageSize = 3;

    const storeStatusList = ["pending", "approving", "blocking"];

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
                            result = await getStoresCount();
                            if (result.data > 0) {
                                setAllStoresInsideThePage((await getAllStoresInsideThePage(1, pageSize)).data);
                                setTotalPagesCount(Math.ceil(result.data / pageSize));
                            }
                            setIsLoadingPage(false);
                        } else {
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

    const getPreviousPage = async () => {
        try {
            setIsGetStores(true);
            setErrorMsgOnGetStoresData("");
            const newCurrentPage = currentPage - 1;
            setAllStoresInsideThePage((await getAllStoresInsideThePage(newCurrentPage, pageSize, getFilteringString(filters))).data);
            setCurrentPage(newCurrentPage);
            setIsGetStores(false);
        }
        catch (err) {
            if (err?.response?.status === 401) {
                localStorage.removeItem(process.env.adminTokenNameInLocalStorage);
                await router.replace("/login");
            }
            else {
                setErrorMsgOnGetStoresData(err?.message === "Network Error" ? "Network Error When Get Brands Data" : "Sorry, Someting Went Wrong When Get Brands Data, Please Repeate The Process !!");
            }
        }
    }

    const getNextPage = async () => {
        try {
            setIsGetStores(true);
            setErrorMsgOnGetStoresData("");
            const newCurrentPage = currentPage + 1;
            setAllStoresInsideThePage((await getAllStoresInsideThePage(newCurrentPage, pageSize, getFilteringString(filters))).data);
            setCurrentPage(newCurrentPage);
            setIsGetStores(false);
        }
        catch (err) {
            if (err?.response?.status === 401) {
                localStorage.removeItem(process.env.adminTokenNameInLocalStorage);
                await router.replace("/login");
            }
            else {
                setErrorMsgOnGetStoresData(err?.message === "Network Error" ? "Network Error When Get Brands Data" : "Sorry, Someting Went Wrong When Get Brands Data, Please Repeate The Process !!");
            }
        }
    }

    const getSpecificPage = async (pageNumber) => {
        try {
            setIsGetStores(true);
            setErrorMsgOnGetStoresData("");
            setAllStoresInsideThePage((await getAllStoresInsideThePage(pageNumber, pageSize, getFilteringString(filters))).data);
            setCurrentPage(pageNumber);
            setIsGetStores(false);
        }
        catch (err) {
            if (err?.response?.status === 401) {
                localStorage.removeItem(process.env.adminTokenNameInLocalStorage);
                await router.replace("/login");
            }
            else {
                setErrorMsgOnGetStoresData(err?.message === "Network Error" ? "Network Error When Get Brands Data" : "Sorry, Someting Went Wrong When Get Brands Data, Please Repeate The Process !!");
            }
        }
    }

    const getFilteringString = (filters) => {
        let filteringString = "";
        if (filters.storeId) filteringString += `_id=${filters.storeId}&`;
        if (filters.name) filteringString += `name=${filters.name}&`;
        if (filters.status) filteringString += `status=${filters.status}&`;
        if (filters.ownerFirstName) filteringString += `ownerFirstName=${filters.ownerFirstName}&`;
        if (filters.ownerLastName) filteringString += `ownerLastName=${filters.ownerLastName}&`;
        if (filters.ownerEmail) filteringString += `ownerEmail=${filters.ownerEmail}&`;
        if (filteringString) filteringString = filteringString.substring(0, filteringString.length - 1);
        return filteringString;
    }

    const filterStores = async (filters) => {
        try {
            setIsGetStores(true);
            setCurrentPage(1);
            const filteringString = getFilteringString(filters);
            const result = await getStoresCount(filteringString);
            if (result.data > 0) {
                setAllStoresInsideThePage((await getAllStoresInsideThePage(1, pageSize, filteringString)).data);
                setTotalPagesCount(Math.ceil(result.data / pageSize));
                setIsGetStores(false);
            } else {
                setAllStoresInsideThePage([]);
                setTotalPagesCount(0);
                setIsGetStores(false);
            }
        }
        catch (err) {
            if (err?.response?.status === 401) {
                localStorage.removeItem(process.env.adminTokenNameInLocalStorage);
                await router.replace("/login");
            }
            else {
                setIsGetStores(false);
                setCurrentPage(-1);
                setErrorMsg(err?.message === "Network Error" ? "Network Error" : "Sorry, Someting Went Wrong, Please Repeate The Process !!");
                let errorTimeout = setTimeout(() => {
                    setErrorMsg("");
                    clearTimeout(errorTimeout);
                }, 1500);
            }
        }
    }

    const handleDisplayChangeStoreStatusBox = (storeDetails, storeAction) => {
        setStoreAction(storeAction);
        setSelectedStore(storeDetails);
        setIsDisplayChangeStoreStatusBox(true);
    }

    const changeStoreData = (storeIndex, fieldName, newValue) => {
        allStoresInsideThePage[storeIndex][fieldName] = newValue;
    }

    const updateStoreData = async (storeIndex) => {
        try {
            setFormValidationErrors({});
            const errorsObject = inputValuesValidation([
                {
                    name: "name",
                    value: allStoresInsideThePage[storeIndex].name,
                    rules: {
                        isRequired: {
                            msg: "Sorry, This Field Can't Be Empty !!",
                        },
                    },
                },
                {
                    name: "ownerEmail",
                    value: allStoresInsideThePage[storeIndex].ownerEmail,
                    rules: {
                        isEmail: {
                            msg: "Sorry, Invalid Email !!",
                        },
                    },
                },
                {
                    name: "productsType",
                    value: allStoresInsideThePage[storeIndex].productsType,
                    rules: {
                        isRequired: {
                            msg: "Sorry, This Field Can't Be Empty !!",
                        },
                    },
                },
            ]);
            setFormValidationErrors(errorsObject);
            setSelectedStoreIndex(storeIndex);
            if (Object.keys(errorsObject).length == 0) {
                setWaitMsg("Please Wait To Updating ...");
                const result = (await axios.put(`${process.env.BASE_API_URL}/stores/update-store-info/${allStoresInsideThePage[storeIndex]._id}?language=${process.env.defaultLanguage}`, {
                    name: allStoresInsideThePage[storeIndex].name,
                    ownerEmail: allStoresInsideThePage[storeIndex].ownerEmail,
                    productsType: allStoresInsideThePage[storeIndex].productsType,
                }, {
                    headers: {
                        Authorization: localStorage.getItem(process.env.adminTokenNameInLocalStorage),
                    }
                })).data;
                setWaitMsg("");
                if (!result.error) {
                    setSuccessMsg("Updating Successfull !!");
                    let successTimeout = setTimeout(() => {
                        setSuccessMsg(false);
                        setSelectedStoreIndex(-1);
                        clearTimeout(successTimeout);
                    }, 3000);
                } else {
                    setErrorMsg("Sorry, Someting Went Wrong, Please Repeate The Process !!");
                    let errorTimeout = setTimeout(() => {
                        setErrorMsg("");
                        setSelectedStoreIndex(-1);
                        clearTimeout(errorTimeout);
                    }, 3000);
                }
            }
        }
        catch (err) {
            if (err?.response?.status === 401) {
                localStorage.removeItem(process.env.adminTokenNameInLocalStorage);
                await router.replace("/login");
                return;
            }
            setWaitMsg("");
            setErrorMsg(err?.message === "Network Error" ? "Network Error" : "Sorry, Someting Went Wrong, Please Repeate The Process !!");
            let errorTimeout = setTimeout(() => {
                setErrorMsg("");
                setSelectedStoreIndex(-1);
                clearTimeout(errorTimeout);
            }, 3000);
        }
    }

    const deleteStore = async (storeIndex) => {
        try {
            setWaitMsg("Please Wait To Deleting ...");
            setSelectedStoreIndex(storeIndex);
            let result = (await axios.delete(`${process.env.BASE_API_URL}/stores/delete-store/${allStoresInsideThePage[storeIndex]._id}?language=${process.env.defaultLanguage}`, {
                headers: {
                    Authorization: localStorage.getItem(process.env.adminTokenNameInLocalStorage),
                }
            })).data;
            setWaitMsg("");
            if (!result.error) {
                setSuccessMsg(true);
                let successTimeout = setTimeout(async () => {
                    setSuccessMsg("Deleting Successfull !!");
                    setSelectedStoreIndex(-1);
                    setIsGetStores(true);
                    result = await getStoresCount();
                    if (result.data > 0) {
                        setAllStoresInsideThePage((await getAllStoresInsideThePage(1, pageSize)).data);
                        setTotalPagesCount(Math.ceil(result.data / pageSize));
                    }
                    setCurrentPage(1);
                    setIsGetStores(false);
                    clearTimeout(successTimeout);
                }, 3000);
            } else {
                setErrorMsg("Sorry, Someting Went Wrong, Please Repeate The Process !!");
                let errorTimeout = setTimeout(() => {
                    setErrorMsg("");
                    setSelectedStoreIndex(-1);
                    clearTimeout(errorTimeout);
                }, 3000);
            }
        }
        catch (err) {
            if (err?.response?.status === 401) {
                localStorage.removeItem(process.env.adminTokenNameInLocalStorage);
                await router.replace("/login");
                return;
            }
            setWaitMsg("");
            setErrorMsg(err?.message === "Network Error" ? "Network Error" : "Sorry, Someting Went Wrong, Please Repeate The Process !!");
            let errorTimeout = setTimeout(() => {
                setErrorMsg("");
                setSelectedStoreIndex(-1);
                clearTimeout(errorTimeout);
            }, 3000);
        }
    }

    const handleChangeStoreStatus = async (newStatus) => {
        try {
            switch (newStatus) {
                case "approving": {
                    setIsGetStores(true);
                    const filteringString = getFilteringString(filters);
                    setAllStoresInsideThePage((await getAllStoresInsideThePage(1, pageSize, filteringString)).data);
                    setCurrentPage(currentPage);
                    setIsGetStores(false);
                    return;
                }
                case "rejecting": {
                    setIsGetStores(true);
                    const filteringString = getFilteringString(filters);
                    const result = await getStoresCount(filteringString);
                    if (result.data > 0) {
                        setAllStoresInsideThePage((await getAllStoresInsideThePage(1, pageSize)).data);
                        setTotalPagesCount(Math.ceil(result.data / pageSize));
                    }
                    setCurrentPage(1);
                    setIsGetStores(false);
                    return;
                }
                case "blocking": {
                    setIsGetStores(true);
                    const filteringString = getFilteringString(filters);
                    setAllStoresInsideThePage((await getAllStoresInsideThePage(1, pageSize, filteringString)).data);
                    setCurrentPage(currentPage);
                    setIsGetStores(false);
                    return;
                }
            }
        }
        catch (err) {
            setIsGetStores(false);
            setErrorMsg(true);
            let errorTimeout = setTimeout(() => {
                setErrorMsg(false);
                clearTimeout(errorTimeout);
            }, 3000);
        }
    }

    return (
        <div className="stores-managment admin-dashboard">
            <Head>
                <title>{process.env.storeName} Admin Dashboard - Stores Managment</title>
            </Head>
            {!isLoadingPage && !errorMsgOnLoadingThePage && <>
                {/* Start Admin Dashboard Side Bar */}
                <AdminPanelHeader isWebsiteOwner={adminInfo.isWebsiteOwner} isMerchant={adminInfo.isMerchant} />
                {/* Start Admin Dashboard Side Bar */}
                {/* Start Share Options Box */}
                {isDisplayChangeStoreStatusBox && <ChangeStoreStatusBox
                    setIsDisplayChangeStoreStatusBox={setIsDisplayChangeStoreStatusBox}
                    setStoreAction={setStoreAction}
                    selectedStore={selectedStore}
                    storeAction={storeAction}
                    handleChangeStoreStatus={handleChangeStoreStatus}
                />}
                {/* End Share Options Box */}
                {/* Start Content Section */}
                <section className="page-content d-flex justify-content-center align-items-center flex-column text-center pt-5 pb-5">
                    <div className="container-fluid">
                        <h1 className="welcome-msg mb-4 fw-bold pb-3 mx-auto">Hi, Mr {adminInfo.firstName + " " + adminInfo.lastName} In Stores Managment</h1>
                        <section className="filters mb-3 bg-white border-3 border-info p-3 text-start">
                            <h5 className="section-name fw-bold text-center">Filters: </h5>
                            <hr />
                            <div className="row mb-4">
                                <div className="col-md-4">
                                    <h6 className="me-2 fw-bold text-center">Store Id</h6>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Pleae Enter Store Id"
                                        onChange={(e) => setFilters({ ...filters, storeId: e.target.value.trim() })}
                                    />
                                </div>
                                <div className="col-md-4">
                                    <h6 className="me-2 fw-bold text-center">Store Name</h6>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Pleae Enter Store Name"
                                        onChange={(e) => setFilters({ ...filters, name: e.target.value.trim() })}
                                    />
                                </div>
                                <div className="col-md-4">
                                    <h6 className="me-2 fw-bold text-center">Status</h6>
                                    <select
                                        className="select-store-status form-select"
                                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                    >
                                        <option value="" hidden>Pleae Enter Status</option>
                                        <option value="">All</option>
                                        {storeStatusList.map((status, index) => (
                                            <option value={status} key={index}>{status}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-md-4 mt-5">
                                    <h6 className="me-2 fw-bold text-center">Owner First Name</h6>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Pleae Enter Owner First Name"
                                        onChange={(e) => setFilters({ ...filters, ownerFirstName: e.target.value.trim() })}
                                    />
                                </div>
                                <div className="col-md-4 mt-5">
                                    <h6 className="me-2 fw-bold text-center">Owner Last Name</h6>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Pleae Enter Owner Last Name"
                                        onChange={(e) => setFilters({ ...filters, ownerLastName: e.target.value.trim() })}
                                    />
                                </div>
                                <div className="col-md-4 mt-5">
                                    <h6 className="me-2 fw-bold text-center">Owner Email</h6>
                                    <input
                                        type="email"
                                        className="form-control"
                                        placeholder="Pleae Enter Owner Email"
                                        onChange={(e) => setFilters({ ...filters, ownerEmail: e.target.value.trim() })}
                                    />
                                </div>
                            </div>
                            {!isGetStores && <button
                                className="btn btn-success d-block w-25 mx-auto mt-2 global-button"
                                onClick={() => filterStores(filters)}
                            >
                                Filter
                            </button>}
                            {isGetStores && <button
                                className="btn btn-success d-block w-25 mx-auto mt-2 global-button"
                                disabled
                            >
                                Filtering ...
                            </button>}
                        </section>
                        {allStoresInsideThePage.length > 0 && !isGetStores && <section className="stores-data-box p-3 data-box admin-dashbboard-data-box">
                            <table className="stores-data-table mb-4 managment-table bg-white admin-dashbboard-data-table">
                                <thead>
                                    <tr>
                                        <th width="50">Store Id</th>
                                        <th width="250">Name</th>
                                        <th>Owner Full Name</th>
                                        <th width="300">Owner Email</th>
                                        <th width="300">Products Type</th>
                                        <th width="250">Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {allStoresInsideThePage.map((store, storeIndex) => (
                                        <tr key={store._id}>
                                            <td>{store._id}</td>
                                            <td>
                                                <section className="store-name mb-4">
                                                    <input
                                                        type="text"
                                                        defaultValue={store.name}
                                                        className={`form-control d-block mx-auto p-2 border-2 store-name-field ${formValidationErrors["name"] && storeIndex === selectedStoreIndex ? "border-danger mb-3" : "mb-4"}`}
                                                        placeholder="Pleae Enter Store Name"
                                                        onChange={(e) => changeStoreData(storeIndex, "name", e.target.value)}
                                                    />
                                                    {formValidationErrors["name"] && storeIndex === selectedStoreIndex && <p className="bg-danger p-2 form-field-error-box m-0 text-white">
                                                        <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                                        <span>{formValidationErrors["name"]}</span>
                                                    </p>}
                                                </section>
                                            </td>
                                            <td>{store.ownerFirstName + " " + store.ownerLastName}</td>
                                            <td>
                                                <section className="store-owner-email mb-4">
                                                    <input
                                                        type="text"
                                                        defaultValue={store.ownerEmail}
                                                        className={`form-control d-block mx-auto p-2 border-2 store-owner-email-field ${formValidationErrors["ownerEmail"] && storeIndex === selectedStoreIndex ? "border-danger mb-3" : "mb-4"}`}
                                                        placeholder="Pleae Enter Owner Email"
                                                        onChange={(e) => changeStoreData(storeIndex, "ownerEmail", e.target.value)}
                                                    />
                                                    {formValidationErrors["ownerEmail"] && storeIndex === selectedStoreIndex && <p className="bg-danger p-2 form-field-error-box m-0 text-white">
                                                        <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                                        <span>{formValidationErrors["ownerEmail"]}</span>
                                                    </p>}
                                                </section>
                                            </td>
                                            <td>
                                                <section className="store-products-type mb-4">
                                                    <input
                                                        type="text"
                                                        defaultValue={store.productsType}
                                                        className={`form-control d-block mx-auto p-2 border-2 store-products-type-field ${formValidationErrors["productsType"] && storeIndex === selectedStoreIndex ? "border-danger mb-3" : "mb-4"}`}
                                                        placeholder="Pleae Enter Products Type"
                                                        onChange={(e) => changeStoreData(storeIndex, "productsType", e.target.value)}
                                                    />
                                                    {formValidationErrors["productsType"] && storeIndex === selectedStoreIndex && <p className="bg-danger p-2 form-field-error-box m-0 text-white">
                                                        <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                                        <span>{formValidationErrors["productsType"]}</span>
                                                    </p>}
                                                </section>
                                            </td>
                                            <td>
                                                {store.status}
                                            </td>
                                            <td>
                                                {storeIndex !== selectedStoreIndex && <button
                                                    className="btn btn-info d-block mx-auto mb-3 global-button"
                                                    onClick={() => updateStoreData(storeIndex)}
                                                >
                                                    Update
                                                </button>}
                                                {store._id !== adminInfo.storeId && <>
                                                    {
                                                        storeIndex !== selectedStoreIndex &&
                                                        <button
                                                            className="btn btn-danger d-block mx-auto mb-3 global-button"
                                                            onClick={() => deleteStore(storeIndex)}
                                                        >
                                                            Delete
                                                        </button>
                                                    }
                                                    {waitMsg && storeIndex === selectedStoreIndex && <button
                                                        className="btn btn-danger d-block mx-auto mb-3 global-button"
                                                        disabled
                                                    >
                                                        {waitMsg}
                                                    </button>}
                                                    {successMsg && storeIndex === selectedStoreIndex && <button
                                                        className="btn btn-success d-block mx-auto mb-3 global-button"
                                                        disabled
                                                    >
                                                        {successMsg}
                                                    </button>}
                                                    {
                                                        !waitMsg &&
                                                        !successMsg &&
                                                        !errorMsg &&
                                                        store.status === "pending" &&
                                                        <button
                                                            className="btn btn-success d-block mx-auto mb-3 global-button"
                                                            onClick={() => handleDisplayChangeStoreStatusBox(store, "approving")}
                                                        >
                                                            Approve
                                                        </button>
                                                    }
                                                    {
                                                        !waitMsg &&
                                                        !successMsg &&
                                                        !errorMsg &&
                                                        store.status === "pending" &&
                                                        <button
                                                            className="btn btn-danger d-block mx-auto mb-3 global-button"
                                                            onClick={() => handleDisplayChangeStoreStatusBox(store, "rejecting")}
                                                        >
                                                            Reject
                                                        </button>
                                                    }
                                                    {
                                                        !waitMsg &&
                                                        !successMsg &&
                                                        !errorMsg &&
                                                        store.status === "pending" || store.status === "approving" &&
                                                        <button
                                                            className="btn btn-danger d-block mx-auto mb-3 global-button"
                                                            onClick={() => handleDisplayChangeStoreStatusBox(store, "blocking")}
                                                        >
                                                            Blocking
                                                        </button>
                                                    }
                                                    {
                                                        !waitMsg &&
                                                        !successMsg &&
                                                        !errorMsg &&
                                                        store.status === "blocking" &&
                                                        <button
                                                            className="btn btn-danger d-block mx-auto mb-3 global-button"
                                                            onClick={() => handleDisplayChangeStoreStatusBox(store, "cancel-blocking")}
                                                        >
                                                            Cancel Blocking
                                                        </button>
                                                    }
                                                    {errorMsg && storeIndex === selectedStoreIndex && <button
                                                        className="btn btn-danger d-block mx-auto mb-3 global-button"
                                                        disabled
                                                    >
                                                        {errorMsg}
                                                    </button>}
                                                </>}
                                                {!waitMsg && !errorMsg && !successMsg && <>
                                                    <Link
                                                        href={`/stores-managment/${store._id}`}
                                                        className="btn btn-success d-block mx-auto mb-4 global-button"
                                                    >Show Full Details</Link>
                                                </>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </section>}
                        {allStoresInsideThePage.length === 0 && !isGetStores && <NotFoundError errorMsg="Sorry, Can't Find Any Stores !!" />}
                        {isGetStores && <TableLoader />}
                        {errorMsgOnGetStoresData && <NotFoundError errorMsg={errorMsgOnGetStoresData} />}
                        {totalPagesCount > 1 && !isGetStores &&
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