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
import { getAdminInfo, getDateFormated } from "../../../public/global_functions/popular";
import NotFoundError from "@/components/NotFoundError";
import TableLoader from "@/components/TableLoader";

export default function OrdersManagment() {

    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const [errorMsgOnLoadingThePage, setErrorMsgOnLoadingThePage] = useState("");

    const [adminInfo, setAdminInfo] = useState({});

    const [allOrdersInsideThePage, setAllOrdersInsideThePage] = useState([]);

    const [isSendEmailToTheCustomerList, setIsSendEmailToTheCustomerList] = useState([]);

    const [isGetOrders, setIsGetOrders] = useState(false);

    const [selectedOrderIndex, setSelectedOrderIndex] = useState(-1);

    const [waitMsg, setWaitMsg] = useState("");

    const [successMsg, setSuccessMsg] = useState("");

    const [errorMsg, setErrorMsg] = useState("");

    const [errorMsgOnGetOrdersData, setErrorMsgOnGetOrdersData] = useState("");

    const [currentPage, setCurrentPage] = useState(1);

    const [totalPagesCount, setTotalPagesCount] = useState(0);

    const [filters, setFilters] = useState({
        storeId: "",
        orderNumber: -1,
        orderId: "",
        status: "",
        customerName: "",
        email: "",
        isDeleted: false,
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
                        if (adminDetails.isBlocked) {
                            localStorage.removeItem(process.env.adminTokenNameInLocalStorage);
                            await router.replace("/login");
                        } else {
                            setAdminInfo(adminDetails);
                            result = await getOrdersCount(getFilteringString(filters));
                            if (result.data > 0) {
                                setAllOrdersInsideThePage((await getAllOrdersInsideThePage(1, pageSize, getFilteringString(filters))).data);
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

    const getFilteringString = (filters) => {
        let filteringString = "destination=admin&";
        if (filters.orderNumber !== -1 && filters.orderNumber) filteringString += `orderNumber=${filters.orderNumber}&`;
        if (filters.orderId) filteringString += `_id=${filters.orderId}&`;
        if (filters.status) filteringString += `status=${filters.status}&`;
        if (filters.customerName) filteringString += `customerName=${filters.customerName}&`;
        if (filters.email) filteringString += `email=${filters.email}&`;
        if (filters.isDeleted) filteringString += `isDeleted=yes&`;
        else filteringString += `isDeleted=no&`;
        if (filteringString) filteringString = filteringString.substring(0, filteringString.length - 1);
        return filteringString;
    }

    const getOrdersCount = async (filters) => {
        try {
            return (await axios.get(`${process.env.BASE_API_URL}/orders/orders-count?language=${process.env.defaultLanguage}&${filters ? filters : ""}`, {
                headers: {
                    Authorization: localStorage.getItem(process.env.adminTokenNameInLocalStorage)
                }
            })).data;
        }
        catch (err) {
            throw err;
        }
    }

    const getAllOrdersInsideThePage = async (pageNumber, pageSize, filters) => {
        try {
            return (await axios.get(`${process.env.BASE_API_URL}/orders/all-orders-inside-the-page?pageNumber=${pageNumber}&pageSize=${pageSize}&language=${process.env.defaultLanguage}&${filters ? filters : ""}`, {
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
            setIsGetOrders(true);
            setErrorMsgOnGetOrdersData("");
            const newCurrentPage = currentPage - 1;
            setAllOrdersInsideThePage((await getAllOrdersInsideThePage(newCurrentPage, pageSize, getFilteringString(filters))).data);
            setCurrentPage(newCurrentPage);
            setIsGetOrders(false);
        }
        catch (err) {
            if (err?.response?.status === 401) {
                localStorage.removeItem(process.env.adminTokenNameInLocalStorage);
                await router.replace("/login");
            }
            else {
                setErrorMsgOnGetOrdersData(err?.message === "Network Error" ? "Network Error When Get Brands Data" : "Sorry, Someting Went Wrong When Get Brands Data, Please Repeate The Process !!");
            }
        }
    }

    const getNextPage = async () => {
        try {
            setIsGetOrders(true);
            setErrorMsgOnGetOrdersData("");
            const newCurrentPage = currentPage + 1;
            setAllOrdersInsideThePage((await getAllOrdersInsideThePage(newCurrentPage, pageSize, getFilteringString(filters))).data);
            setCurrentPage(newCurrentPage);
            setIsGetOrders(false);
        }
        catch (err) {
            if (err?.response?.status === 401) {
                localStorage.removeItem(process.env.adminTokenNameInLocalStorage);
                await router.replace("/login");
            }
            else {
                setErrorMsgOnGetOrdersData(err?.message === "Network Error" ? "Network Error When Get Brands Data" : "Sorry, Someting Went Wrong When Get Brands Data, Please Repeate The Process !!");
            }
        }
    }

    const getSpecificPage = async (pageNumber) => {
        try {
            setIsGetOrders(true);
            setErrorMsgOnGetOrdersData("");
            setAllOrdersInsideThePage((await getAllOrdersInsideThePage(pageNumber, pageSize, getFilteringString(filters))).data);
            setCurrentPage(pageNumber);
            setIsGetOrders(false);
        }
        catch (err) {
            if (err?.response?.status === 401) {
                localStorage.removeItem(process.env.adminTokenNameInLocalStorage);
                await router.replace("/login");
            }
            else {
                setErrorMsgOnGetOrdersData(err?.message === "Network Error" ? "Network Error When Get Brands Data" : "Sorry, Someting Went Wrong When Get Brands Data, Please Repeate The Process !!");
            }
        }
    }

    const filterOrders = async (filters) => {
        try {
            setFormValidationErrors({});
            // const errorsObject = inputValuesValidation([
            //     {
            //         name: "orderNumber",
            //         value: filters.orderNumber,
            //         rules: {
            //             minNumber: {
            //                 value: 1,
            //                 msg: "Sorry, Min Number Is: 1 !!",
            //             },
            //         },
            //     },
            // ]);
            const errorsObject = {};
            if (Object.keys(errorsObject).length == 0) {
                setIsGetOrders(true);
                setCurrentPage(1);
                let filteringString = getFilteringString(filters);
                const result = await getOrdersCount(filteringString);
                if (result.data > 0) {
                    setAllOrdersInsideThePage((await getAllOrdersInsideThePage(1, pageSize, filteringString)).data);
                    setTotalPagesCount(Math.ceil(result.data / pageSize));
                    setIsGetOrders(false);
                } else {
                    setAllOrdersInsideThePage([]);
                    setTotalPagesCount(0);
                    setIsGetOrders(false);
                }
            }
        }
        catch (err) {
            if (err?.response?.status === 401) {
                localStorage.removeItem(process.env.adminTokenNameInLocalStorage);
                await router.replace("/login");
            }
            else {
                setIsGetOrders(false);
                setErrorMsg(err?.message === "Network Error" ? "Network Error" : "Sorry, Someting Went Wrong, Please Repeate The Process !!");
                let errorTimeout = setTimeout(() => {
                    setErrorMsg("");
                    clearTimeout(errorTimeout);
                }, 1500);
            }
        }
    }

    const changeOrderData = (orderIndex, fieldName, newValue) => {
        if (fieldName === "isSendEmailToTheCustomer") {
            isSendEmailToTheCustomerList[orderIndex] = newValue;
        } else {
            allOrdersInsideThePage[orderIndex][fieldName] = newValue;
        }
    }

    const updateOrderData = async (orderIndex) => {
        try {
            setFormValidationErrors({});
            const errorsObject = inputValuesValidation([
                {
                    name: "totalAmount",
                    value: allOrdersInsideThePage[orderIndex].orderAmount,
                    rules: {
                        isRequired: {
                            msg: "Sorry, This Field Can't Be Empty !!",
                        },
                        minNumber: {
                            value: 1,
                            msg: "Sorry, Min Number Is: 1 !!",
                        },
                    },
                },
            ]);
            setFormValidationErrors(errorsObject);
            setSelectedOrderIndex(orderIndex);
            if (Object.keys(errorsObject).length == 0) {
                setWaitMsg("Please Wait To Updating ...");
                const result = (await axios.post(`${process.env.BASE_API_URL}/orders/update-order/${allOrdersInsideThePage[orderIndex]._id}?language=${process.env.defaultLanguage}${isSendEmailToTheCustomerList[orderIndex] && allOrdersInsideThePage[orderIndex].status !== "pending" ? "&isSendEmailToTheCustomer=true" : ""}`, {
                    orderAmount: allOrdersInsideThePage[orderIndex].orderAmount,
                    status: allOrdersInsideThePage[orderIndex].status,
                }, {
                    headers: {
                        Authorization: localStorage.getItem(process.env.adminTokenNameInLocalStorage),
                    }
                })).data;
                setWaitMsg("");
                if (!result.error) {
                    setSuccessMsg("Updating Successfull !!");
                    let successTimeout = setTimeout(() => {
                        setSuccessMsg("");
                        setSelectedOrderIndex(-1);
                        clearTimeout(successTimeout);
                    }, 3000);
                } else {
                    setErrorMsg("Sorry, Someting Went Wrong, Please Repeate The Process !!");
                    let errorTimeout = setTimeout(() => {
                        setErrorMsg("");
                        setSelectedOrderIndex(-1);
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
                    setSelectedOrderIndex(-1);
                    clearTimeout(errorTimeout);
                }, 1500);
            }
        }
    }

    const deleteOrder = async (orderIndex) => {
        try {
            setWaitMsg("Please Wait To Deleting ...");
            setSelectedOrderIndex(orderIndex);
            const result = (await axios.delete(`${process.env.BASE_API_URL}/orders/delete-order/${allOrdersInsideThePage[orderIndex]._id}?language=${process.env.defaultLanguage}`, {
                headers: {
                    Authorization: localStorage.getItem(process.env.adminTokenNameInLocalStorage),
                }
            })).data;
            setWaitMsg("");
            if (!result.error) {
                setSuccessMsg("Deleting Successfull !!");
                let successTimeout = setTimeout(async () => {
                    setSuccessMsg("");
                    setSelectedOrderIndex(-1);
                    const filteringString = getFilteringString(filters);
                    const result = await getOrdersCount(filteringString);
                    if (result.data > 0) {
                        setAllOrdersInsideThePage((await getAllOrdersInsideThePage(currentPage, pageSize, filteringString)).data);
                        setTotalPagesCount(Math.ceil(result.data / pageSize));
                        setIsGetOrders(false);
                    } else {
                        setAllOrdersInsideThePage([]);
                        setTotalPagesCount(0);
                        setIsGetOrders(false);
                    }
                    clearTimeout(successTimeout);
                }, 3000);
            } else {
                setErrorMsg(err?.message === "Network Error" ? "Network Error" : "Sorry, Someting Went Wrong, Please Repeate The Process !!");
                let errorTimeout = setTimeout(() => {
                    setErrorMsg("");
                    setSelectedOrderIndex(-1);
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
                    setSelectedOrderIndex(-1);
                    clearTimeout(errorTimeout);
                }, 1500);
            }
        }
    }

    return (
        <div className="orders-managment admin-dashboard">
            <Head>
                <title>{process.env.storeName} Admin Dashboard - Orders Managment</title>
            </Head>
            {!isLoadingPage && !errorMsgOnLoadingThePage && <>
                {/* Start Admin Dashboard Side Bar */}
                <AdminPanelHeader isWebsiteOwner={adminInfo.isWebsiteOwner} isMerchant={adminInfo.isMerchant} />
                {/* Start Admin Dashboard Side Bar */}
                {/* Start Content Section */}
                <section className="page-content d-flex justify-content-center align-items-center flex-column text-center pt-5 pb-5">
                    <div className="container-fluid">
                        <h1 className="welcome-msg mb-4 fw-bold pb-3 mx-auto">Hi, Mr {adminInfo.firstName + " " + adminInfo.lastName} In Orders Managment</h1>
                        <section className="filters mb-3 bg-white border-3 border-info p-3 text-start">
                            <h5 className="section-name fw-bold text-center">Filters: </h5>
                            <hr />
                            <div className="row mb-4">
                                <div className="col-md-4">
                                    <h6 className="me-2 fw-bold text-center">Order Number</h6>
                                    <input
                                        type="number"
                                        className="form-control"
                                        placeholder="Pleae Enter Order Number"
                                        min="1"
                                        max={allOrdersInsideThePage.length}
                                        onChange={(e) => setFilters({ ...filters, orderNumber: e.target.valueAsNumber ? e.target.valueAsNumber : -1 })}
                                    />
                                </div>
                                <div className="col-md-4">
                                    <h6 className="me-2 fw-bold text-center">Order Id</h6>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Pleae Enter Order Id"
                                        onChange={(e) => setFilters({ ...filters, orderId: e.target.value.trim() })}
                                    />
                                </div>
                                <div className="col-md-4">
                                    <h6 className="me-2 fw-bold text-center">Status</h6>
                                    <select
                                        className="select-order-status form-select"
                                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                    >
                                        <option value="" hidden>Pleae Enter Status</option>
                                        <option value="">All</option>
                                        <option value="pending">Pending</option>
                                        <option value="shipping">Shipping</option>
                                        <option value="completed">Completed</option>
                                    </select>
                                </div>
                                <div className="col-md-6 mt-4">
                                    <h6 className="me-2 fw-bold text-center">Customer Name</h6>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Pleae Enter Customer Name"
                                        onChange={(e) => setFilters({ ...filters, customerName: e.target.value.trim() })}
                                    />
                                </div>
                                <div className="col-md-6 mt-4">
                                    <h6 className="me-2 fw-bold text-center">Customer Email</h6>
                                    <input
                                        type="email"
                                        className="form-control"
                                        placeholder="Pleae Enter Customer Email"
                                        onChange={(e) => setFilters({ ...filters, email: e.target.value.trim() })}
                                    />
                                </div>
                            </div>
                            {!isGetOrders && <button
                                className="btn btn-success d-block w-25 mx-auto mt-2 global-button"
                                onClick={() => filterOrders(filters)}
                            >
                                Filter
                            </button>}
                            {isGetOrders && <button
                                className="btn btn-success d-block w-25 mx-auto mt-2 global-button"
                                disabled
                            >
                                Filtering ...
                            </button>}
                        </section>
                        {allOrdersInsideThePage.length > 0 && !isGetOrders && <section className="orders-data-box p-3 data-box admin-dashbboard-data-box">
                            <table className="orders-data-table mb-4 managment-table bg-white admin-dashbboard-data-table">
                                <thead>
                                    <tr>
                                        <th>Order Number</th>
                                        <th>Order Id</th>
                                        <th>Checkout Status</th>
                                        <th>Status</th>
                                        <th>Order Total Amount</th>
                                        <th>Added Date</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {allOrdersInsideThePage.map((order, orderIndex) => (
                                        <tr key={order._id}>
                                            <td>{order.orderNumber}</td>
                                            <td>{order._id}</td>
                                            <td>
                                                <div className={`p-2 text-white ${order.checkoutStatus === "Checkout Successfull" ? "bg-success" : "bg-danger"}`}>
                                                    {order.checkoutStatus}
                                                </div>
                                            </td>
                                            <td>
                                                <h6 className="fw-bold">{order.status}</h6>
                                                {order.checkoutStatus === "Checkout Successfull" && <>
                                                    <hr />
                                                    <select
                                                        className="select-order-status form-select mb-5"
                                                        onChange={(e) => changeOrderData(orderIndex, "status", e.target.value)}
                                                    >
                                                        <option value="" hidden>Pleae Enter Status</option>
                                                        <option value="pending">Pending</option>
                                                        <option value="shipping">Shipping</option>
                                                        <option value="completed">Completed</option>
                                                    </select>
                                                    <div className="form-check border border-2 border-dark p-3">
                                                        <input
                                                            className="form-check-input m-0"
                                                            type="checkbox"
                                                            id="sendEmailCheckout"
                                                            onChange={(e) => changeOrderData(orderIndex, "isSendEmailToTheCustomer", e.target.checked)}
                                                        />
                                                        <label className="form-check-label" htmlFor="sendEmailCheckout" onClick={(e) => changeOrderData(orderIndex, "isSendEmailToTheCustomer", e.target.checked)}>
                                                            Send Email To Customer
                                                            <span className="d-block mt-3 fw-bold">( In Status: Shipping Or Completed)</span>
                                                        </label>
                                                    </div>
                                                </>}
                                            </td>
                                            <td>
                                                {order.checkoutStatus === "Checkout Successfull" ? <section className="order-total-amount mb-4">
                                                    <input
                                                        type="text"
                                                        defaultValue={order.orderAmount}
                                                        className={`form-control d-block mx-auto p-2 border-2 brand-title-field ${formValidationErrors["totalAmount"] && orderIndex === selectedOrderIndex ? "border-danger mb-3" : "mb-4"}`}
                                                        placeholder="Pleae Enter Order Amount"
                                                        onChange={(e) => changeOrderData(orderIndex, "orderAmount", e.target.value ? e.target.value : "")}
                                                    />
                                                    {formValidationErrors["totalAmount"] && orderIndex === selectedOrderIndex && <p className="bg-danger p-2 form-field-error-box m-0 text-white">
                                                        <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                                        <span>{formValidationErrors["totalAmount"]}</span>
                                                    </p>}
                                                </section> : order.orderAmount}
                                            </td>
                                            <td>{getDateFormated(order.addedDate)}</td>
                                            <td>
                                                {!order.isDeleted && orderIndex !== selectedOrderIndex && <>
                                                    {order.checkoutStatus === "Checkout Successfull" && <button
                                                        className="btn btn-info d-block mx-auto mb-3 global-button"
                                                        onClick={() => updateOrderData(orderIndex)}
                                                    >
                                                        Update
                                                    </button>}
                                                    <button
                                                        className="btn btn-danger d-block mx-auto mb-3 global-button"
                                                        onClick={() => deleteOrder(orderIndex)}
                                                    >
                                                        Delete
                                                    </button>
                                                </>}
                                                {waitMsg && orderIndex === selectedOrderIndex && <button
                                                    className="btn btn-info d-block mx-auto mb-3 global-button"
                                                    disabled
                                                >
                                                    {waitMsg}
                                                </button>}
                                                {successMsg && orderIndex === selectedOrderIndex && <button
                                                    className="btn btn-success d-block mx-auto mb-3 global-button"
                                                    disabled
                                                >
                                                    {successMsg}
                                                </button>}
                                                {errorMsg && orderIndex === selectedOrderIndex && <button
                                                    className="btn btn-danger d-block mx-auto mb-3 global-button"
                                                    disabled
                                                >
                                                    {errorMsg}
                                                </button>}
                                                {order.isDeleted && <button
                                                    className="btn btn-danger d-block mx-auto mb-3 global-button"
                                                    disabled
                                                >
                                                    Deleted
                                                </button>}
                                                {selectedOrderIndex !== orderIndex && <>
                                                    <Link
                                                        href={`/orders-managment/${order._id}`}
                                                        className="btn btn-success d-block mx-auto mb-4 global-button"
                                                    >Show Details</Link>
                                                    {order.checkoutStatus === "Checkout Successfull" && <Link
                                                        href={`/orders-managment/billing/${order._id}`}
                                                        className="btn btn-success d-block mx-auto mb-4 global-button"
                                                    >Show Billing</Link>}
                                                </>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </section>}
                        {allOrdersInsideThePage.length === 0 && !isGetOrders && <NotFoundError errorMsg="Sorry, Can't Find Any Orders !!" />}
                        {isGetOrders && <TableLoader />}
                        {errorMsgOnGetOrdersData && <NotFoundError errorMsg={errorMsgOnGetOrdersData} />}
                        {totalPagesCount > 1 && !isGetOrders &&
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