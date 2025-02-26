import Head from "next/head";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import LoaderPage from "@/components/LoaderPage";
import ErrorOnLoadingThePage from "@/components/ErrorOnLoadingThePage";
import AdminPanelHeader from "@/components/AdminPanelHeader";
import { getAdminInfo, getOrderDetails } from "../../../../public/global_functions/popular";

export default function OrderDetails({ orderIdAsProperty }) {

    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const [errorMsgOnLoadingThePage, setErrorMsgOnLoadingThePage] = useState("");

    const [adminInfo, setAdminInfo] = useState({});

    const [orderDetails, setOrderDetails] = useState({});

    const [selectedOrderProductIndex, setSelectedOrderProductIndex] = useState(-1);

    const [waitMsg, setWaitMsg] = useState("");

    const [errorMsg, setErrorMsg] = useState("");

    const [successMsg, setSuccessMsg] = useState("");

    const router = useRouter();

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
                            result = await getOrderDetails(orderIdAsProperty);
                            if (!result.error) {
                                setOrderDetails(result.data);
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

    const changeOrderProductData = (productIndex, fieldName, newValue) => {
        let productsTemp = orderDetails.products.map((product) => product);
        productsTemp[productIndex][fieldName] = newValue;
        if (fieldName === "quantity" || fieldName === "unitPrice") {
            productsTemp[productIndex]["totalAmount"] = productsTemp[productIndex]["quantity"] * productsTemp[productIndex]["unitPrice"];
        }
        setOrderDetails({ ...orderDetails, products: productsTemp });
    }

    const updateOrderProductData = async (orderProductIndex) => {
        try {
            setWaitMsg("Please Wait To Updating ...");
            setSelectedOrderProductIndex(orderProductIndex);
            const result = (await axios.put(`${process.env.BASE_API_URL}/orders/products/update-product/${orderDetails._id}/${orderDetails.products[orderProductIndex].productId}?language=${process.env.defaultLanguage}`, {
                quantity: orderDetails.products[orderProductIndex].quantity,
                name: orderDetails.products[orderProductIndex].name,
                unitPrice: orderDetails.products[orderProductIndex].unitPrice,
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
                    setSelectedOrderProductIndex(-1);
                    clearTimeout(successTimeout);
                }, 1500);
            } else {
                setErrorMsg(result.msg);
                let errorTimeout = setTimeout(() => {
                    setErrorMsg("");
                    setSelectedOrderProductIndex(-1);
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
                    setSelectedOrderProductIndex(-1);
                    clearTimeout(errorTimeout);
                }, 1500);
            }
        }
    }

    const deleteProductFromOrder = async (orderProductIndex) => {
        try {
            setWaitMsg("Please Wait To Deleting ...");
            setSelectedOrderProductIndex(orderProductIndex);
            const result = (await axios.delete(`${process.env.BASE_API_URL}/orders/products/delete-product/${orderDetails._id}/${orderDetails.products[orderProductIndex].productId}?language=${process.env.defaultLanguage}`, {
                headers: {
                    Authorization: localStorage.getItem(process.env.adminTokenNameInLocalStorage),
                }
            })).data;
            setWaitMsg("");
            if (!result.error) {
                setSuccessMsg("Deleting Successfull !!");
                let successTimeout = setTimeout(() => {
                    setSuccessMsg("");
                    setSelectedOrderProductIndex(-1);
                    orderDetails.products = result.data.newOrderProducts;
                    clearTimeout(successTimeout);
                }, 1500);
            } else {
                setErrorMsg("Sorry, Someting Went Wrong, Please Repeate The Process !!");
                let errorTimeout = setTimeout(() => {
                    setErrorMsg("");
                    setSelectedOrderProductIndex(-1);
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
                    setSelectedOrderProductIndex(-1);
                    clearTimeout(errorTimeout);
                }, 1500);
            }
        }
    }

    return (
        <div className="order-details admin-dashboard">
            <Head>
                <title>{process.env.storeName} Admin Dashboard - Order Details</title>
            </Head>
            {!isLoadingPage && !errorMsgOnLoadingThePage && <>
                {/* Start Admin Dashboard Side Bar */}
                <AdminPanelHeader isWebsiteOwner={adminInfo.isWebsiteOwner} isMerchant={adminInfo.isMerchant} />
                {/* Start Admin Dashboard Side Bar */}
                {/* Start Content Section */}
                <section className="page-content d-flex justify-content-center align-items-center flex-column text-center pt-4 pb-4 p-4">
                    <div className="container-fluid">
                        <h1 className="welcome-msg fw-bold mx-auto mt-3 mb-3">Hello To You In Orders Details Page</h1>
                        {Object.keys(orderDetails).length > 0 ? <div className="order-details-box p-3 data-box admin-dashbboard-data-box">
                            <table className="order-data-table mb-5 managment-table admin-dashbboard-data-table">
                                <thead>
                                    <tr>
                                        <th>Reference / Product Id</th>
                                        <th>Quantity</th>
                                        <th>Name</th>
                                        <th>Unit Price</th>
                                        <th>Unit Discount</th>
                                        <th>Total Amount Before Discount</th>
                                        <th>Total</th>
                                        <th>Image</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orderDetails.products.map((orderProduct, orderProductIndex) => (
                                        <tr key={orderProduct._id}>
                                            <td>{orderProduct._id}</td>
                                            <td>
                                                <input
                                                    type="text"
                                                    className="form-control quantity"
                                                    defaultValue={orderProduct.quantity}
                                                    onChange={(e) => changeOrderProductData(orderProductIndex, "quantity", e.target.value.trim())}
                                                    disabled={orderDetails.isDeleted || orderDetails.checkoutStatus !== "Checkout Successfull"}
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="text"
                                                    className="form-control name"
                                                    defaultValue={orderProduct.name}
                                                    onChange={(e) => changeOrderProductData(orderProductIndex, "name", e.target.value.trim())}
                                                    disabled={orderDetails.isDeleted || orderDetails.checkoutStatus !== "Checkout Successfull"}
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="text"
                                                    className="form-control unit-price"
                                                    defaultValue={orderProduct.unitPrice}
                                                    onChange={(e) => changeOrderProductData(orderProductIndex, "unitPrice", e.target.value.trim())}
                                                    disabled={orderDetails.isDeleted || orderDetails.checkoutStatus !== "Checkout Successfull"}
                                                />
                                            </td>
                                            <td>
                                                {orderProduct.unitDiscount}
                                            </td>
                                            <td>
                                                {orderProduct.unitPrice * orderProduct.quantity}
                                            </td>
                                            <td>
                                                {(orderProduct.unitPrice - orderProduct.unitDiscount) * orderProduct.quantity}
                                            </td>
                                            <td>
                                                <img
                                                    src={`${process.env.BASE_API_URL}/${orderProduct.imagePath}`}
                                                    alt="product Image !!"
                                                    width="100"
                                                    height="100"
                                                />
                                            </td>
                                            <td>
                                                {!orderDetails.isDeleted && orderDetails.checkoutStatus === "Checkout Successfull" ? <>
                                                    {selectedOrderProductIndex !== orderProductIndex && <button
                                                        className="btn btn-info d-block mx-auto mb-3 global-button"
                                                        onClick={() => updateOrderProductData(orderProductIndex)}
                                                    >
                                                        Update
                                                    </button>}
                                                    {waitMsg && selectedOrderProductIndex === orderProductIndex && <button
                                                        className="btn btn-info d-block mx-auto mb-3 global-button"
                                                        disabled
                                                    >
                                                        Updating ...
                                                    </button>}
                                                    {selectedOrderProductIndex !== orderProductIndex && orderDetails.products.length > 1 && <button
                                                        className="btn btn-danger d-block mx-auto mb-3 global-button"
                                                        onClick={() => deleteProductFromOrder(orderProductIndex)}
                                                    >
                                                        Delete
                                                    </button>}
                                                    {waitMsg && selectedOrderProductIndex === orderProductIndex && <button
                                                        className="btn btn-danger d-block mx-auto mb-3 global-button"
                                                        disabled
                                                    >
                                                        Deleting ...
                                                    </button>}
                                                    {successMsg && selectedOrderProductIndex === orderProductIndex && <button
                                                        className="btn btn-success d-block mx-auto global-button"
                                                        disabled
                                                    >{successMsg}</button>}
                                                    {errorMsg && selectedOrderProductIndex === orderProductIndex && <button
                                                        className="btn btn-danger d-block mx-auto global-button"
                                                        disabled
                                                    >{errorMsg}</button>}
                                                </> : <span className="fw-bold text-danger">Reject Actions</span>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div> : <p className="alert alert-danger order-not-found-error">Sorry, This Order Is Not Found !!</p>}
                        {Object.keys(orderDetails).length > 0 && <div className="rest-info">
                            <section className="customer-addresses mb-5">
                                <h4 className="fw-bold mb-4 border border-2 border-dark bg-white p-3">Addresses</h4>
                                <div className="row">
                                    <div className="col-md-6 bg-white border border-2 border-dark">
                                        <div className="billing-address-box text-start p-3">
                                            <h6 className="fw-bold">Billing Address</h6>
                                            <hr />
                                            <p className="city fw-bold">City: {orderDetails.billingAddress.city}</p>
                                            <p className="email fw-bold">Email: {orderDetails.billingAddress.email}</p>
                                            <p className="name fw-bold">Name: {orderDetails.billingAddress.firstName}</p>
                                            <p className="family-name fw-bold">Family Name: {orderDetails.billingAddress.lastName}</p>
                                            <p className="phone fw-bold">Phone: {orderDetails.billingAddress.phone}</p>
                                            <p className="postal-code fw-bold">Postal Code: {orderDetails.billingAddress.postalCode}</p>
                                            <p className="street-address fw-bold">Street Address: {orderDetails.billingAddress.streetAddress}</p>
                                            <p className="apartment-number fw-bold m-0">Apartment Number: {orderDetails.billingAddress.apartmentNumber}</p>
                                        </div>
                                    </div>
                                    <div className="col-md-6 bg-white border border-2 border-dark">
                                        <div className="shipping-address-box text-start p-3">
                                            <h6 className="fw-bold">Shipping Address</h6>
                                            <hr />
                                            <p className="city fw-bold">City: {orderDetails.shippingAddress.city}</p>
                                            <p className="email fw-bold">Email: {orderDetails.shippingAddress.email}</p>
                                            <p className="name fw-bold">Name: {orderDetails.shippingAddress.firstName}</p>
                                            <p className="family-name fw-bold">Family Name: {orderDetails.shippingAddress.lastName}</p>
                                            <p className="phone fw-bold">Phone: {orderDetails.shippingAddress.phone}</p>
                                            <p className="postal-code fw-bold">Postal Code: {orderDetails.shippingAddress.postalCode}</p>
                                            <p className="street-address fw-bold">Street Address: {orderDetails.shippingAddress.streetAddress}</p>
                                            <p className="apartment-number fw-bold m-0">Apartment Number: {orderDetails.shippingAddress.apartmentNumber}</p>
                                        </div>
                                    </div>
                                </div>
                            </section>
                            <section className="shipping-info mb-5">
                                <h4 className="fw-bold mb-4 border border-2 border-dark bg-white p-3">Shipping Info</h4>
                                <div className="row">
                                    <div className="col-md-6 bg-white border border-2 border-dark">
                                        <div className="shipping-cost-box text-start p-3">
                                            <h6 className="fw-bold">Shipping Cost</h6>
                                            <hr />
                                            <p className="shipping-cost shipping-cost-for-local-products fw-bold">For Local Products: {orderDetails.shippingCost.forLocalProducts}</p>
                                            <p className="shipping-cost shipping-cost-for-international-products fw-bold">For Interantional Products: {orderDetails.shippingCost.forInternationalProducts}</p>
                                            <p className="shipping-cost total-shipping-cost fw-bold m-0">Total Cost: {orderDetails.shippingCost.forLocalProducts + orderDetails.shippingCost.forInternationalProducts}</p>
                                        </div>
                                    </div>
                                    <div className="col-md-6 bg-white border border-2 border-dark">
                                        <div className="shipping-methods-box text-start p-3">
                                            <h6 className="fw-bold">Shipping Methods</h6>
                                            <hr />
                                            <p className="shipping-method shipping-method-for-local-products fw-bold">For Local Products: {orderDetails.shippingMethod.forLocalProducts}</p>
                                            <p className="shipping-method shipping-method-for-international-products fw-bold m-0">For Interantional Products: {orderDetails.shippingMethod.forInternationalProducts}</p>
                                        </div>
                                    </div>
                                </div>
                            </section>
                            <section className="other-info mb-4">
                                <h4 className="fw-bold mb-4 border border-2 border-dark bg-white p-3">Other Info</h4>
                                <div className="row">
                                    <div className="col-md-6 bg-white border border-2 border-dark">
                                        <div className="creator-box text-start p-3">
                                            <h6 className="fw-bold">Creator: {orderDetails.creator}</h6>
                                            <h6 className="fw-bold m-0">User Id: {orderDetails.userId}</h6>
                                        </div>
                                    </div>
                                    <div className="col-md-6 bg-white border border-2 border-dark">
                                        <div className="payment-gateway-box text-start p-3">
                                            <h6 className="fw-bold m-0">Payment Gateway: {orderDetails.paymentGateway}</h6>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>}
                    </div>
                </section>
                {/* End Content Section */}
            </>}
            {isLoadingPage && !errorMsgOnLoadingThePage && <LoaderPage />}
            {errorMsgOnLoadingThePage && <ErrorOnLoadingThePage errorMsg={errorMsgOnLoadingThePage} />}
        </div>
    );
}

export async function getServerSideProps({ params }) {
    const { orderId } = params;
    if (!orderId) {
        return {
            redirect: {
                permanent: false,
                destination: "/orders-managment",
            },
        }
    } else {
        return {
            props: {
                orderIdAsProperty: orderId,
            },
        }
    }
}