import Head from "next/head";
import LoaderPage from "@/components/LoaderPage";
import { useState, useEffect } from "react";
import ErrorOnLoadingThePage from "@/components/ErrorOnLoadingThePage";
import { FaRegSmileWink } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { getAdminInfo, getStoreDetails, getOrderDetails, handleSelectUserLanguage } from "../../../../../public/global_functions/popular";
import { useRouter } from "next/router";
import AdminPanelHeader from "@/components/AdminPanelHeader";
import { getCurrencyNameByCountry, getUSDPriceAgainstCurrency } from "../../../../../public/global_functions/prices";
import NotFoundError from "@/components/NotFoundError";

export default function ShowBilling({ orderIdAsProperty, countryAsProperty }) {

    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const [errorMsgOnLoadingThePage, setErrorMsgOnLoadingThePage] = useState("");

    const [usdPriceAgainstCurrency, setUsdPriceAgainstCurrency] = useState(1);

    const [currencyNameByCountry, setCurrencyNameByCountry] = useState("");

    const [isGetOrderDetails, setIsGetOrderDetails] = useState(true);

    const [adminInfo, setAdminInfo] = useState({});

    const [storeDetails, setStoreDetails] = useState({});

    const [orderDetails, setOrderDetails] = useState({});

    const [pricesDetailsSummary, setPricesDetailsSummary] = useState({
        totalPriceBeforeDiscount: 0,
        totalDiscount: 0,
    });

    const router = useRouter();

    const { t, i18n } = useTranslation();

    useEffect(() => {
        const userLanguage = localStorage.getItem(process.env.adminDashboardlanguageFieldNameInLocalStorage);
        handleSelectUserLanguage(userLanguage === "ar" || userLanguage === "en" || userLanguage === "tr" || userLanguage === "de" ? userLanguage : "en", i18n.changeLanguage);
    }, []);

    useEffect(() => {
        setIsLoadingPage(true);
        getUSDPriceAgainstCurrency(countryAsProperty).then((price) => {
            setUsdPriceAgainstCurrency(price);
            setCurrencyNameByCountry(getCurrencyNameByCountry(countryAsProperty));
            if (!isGetOrderDetails) {
                setIsLoadingPage(false);
            }
        })
            .catch((err) => {
                setIsLoadingPage(false);
                setErrorMsgOnLoadingThePage(err?.message === "Network Error" ? "Network Error" : "Sorry, Something Went Wrong, Please Try Again !");
            });
    }, [countryAsProperty]);

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
                            setStoreDetails((await getStoreDetails(adminDetails.storeId)).data);
                            result = await getOrderDetails(orderIdAsProperty);
                            if (!result.error) {
                                setOrderDetails(result.data);
                                setPricesDetailsSummary({
                                    totalPriceBeforeDiscount: calcTotalOrderPriceBeforeDiscount(result.data.products),
                                    totalDiscount: calcTotalOrderDiscount(result.data.products),
                                });
                            }
                            setIsGetOrderDetails(false);
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

    useEffect(() => {
        if (!isGetOrderDetails) {
            setIsLoadingPage(false);
        }
    }, [isGetOrderDetails]);

    const calcTotalOrderPriceBeforeDiscount = (allProductsData) => {
        let tempTotalPriceBeforeDiscount = 0;
        allProductsData.forEach((product) => {
            tempTotalPriceBeforeDiscount += product.unitPrice * product.quantity;
        });
        return tempTotalPriceBeforeDiscount;
    }

    const calcTotalOrderDiscount = (allProductsData) => {
        let tempTotalDiscount = 0;
        allProductsData.forEach((product) => {
            tempTotalDiscount += product.discount * product.quantity;
        });
        return tempTotalDiscount;
    }

    return (
        <div className="billing admin-dashboard page">
            <Head>
                <title>{process.env.storeName} Admin Dashboard - Billing</title>
            </Head>
            {!isLoadingPage && !errorMsgOnLoadingThePage && <>
                <AdminPanelHeader isWebsiteOwner={adminInfo.isWebsiteOwner} isMerchant={adminInfo.isMerchant} />
                <div className="page-content p-4 bg-white">
                    {Object.keys(orderDetails).length > 0 && orderDetails?.checkoutStatus === "Checkout Successfull" && <section className="order-total border border-3 border-dark p-4 ps-md-5 pe-md-5 text-center" id="order-total">
                        <h1 className="welcome-msg text-center mb-4 fw-bold border-bottom border-4 border-dark w-fit mx-auto pb-2">{t("Your Order Billing From Store")}: {storeDetails.name}</h1>
                        <h5 className="fw-bold mb-4 text-center">{t("Your Request")}</h5>
                        <div className="order-id-and-number border border-2 border-dark p-4 mb-5">
                            <h5 className="mb-4 text-center">{t("Order Id")}: {orderDetails._id}</h5>
                            <h5 className="mb-0 text-center">{t("Order Number")}: {orderDetails.orderNumber}</h5>
                        </div>
                        <h5 className="mb-5 text-center border border-2 border-dark p-4">{t("Order Details")}</h5>
                        <div className="row total pb-3 mb-5">
                            <div className="col-md-3 fw-bold p-0">
                                {t("Product Name And Quantity")}
                            </div>
                            <div className="col-md-3 fw-bold p-0">
                                {t("Unit Price Before Discount")}
                            </div>
                            <div className="col-md-3 fw-bold p-0">
                                {t("Unit Discount")}
                            </div>
                            <div className="col-md-3 fw-bold p-0">
                                {t("Sum")}
                            </div>
                        </div>
                        {orderDetails.products.map((product, productIndex) => (
                            <div className="row total pb-3 mb-5" key={productIndex}>
                                <div className="col-md-3 fw-bold p-0">
                                    {i18n.language !== "ar" ? <span>
                                        ( {product.name} ) x {product.quantity}
                                    </span> : <span>
                                        ( {product.name} ) {product.quantity} x
                                    </span>}
                                </div>
                                <div className="col-md-3 fw-bold p-0">
                                    {(product.unitPrice * usdPriceAgainstCurrency).toFixed(2)} {t(currencyNameByCountry)}
                                </div>
                                <div className="col-md-3 fw-bold p-0">
                                    {product.discount * usdPriceAgainstCurrency} {t(currencyNameByCountry)}
                                </div>
                                <div className="col-md-3 fw-bold p-0">
                                    {((product.unitPrice - product.discount) * product.quantity * usdPriceAgainstCurrency).toFixed(2)} {t(currencyNameByCountry)}
                                </div>
                            </div>
                        ))}
                        <div className="row total-price-before-discount total pb-3 mb-5">
                            <div className="col-md-3 fw-bold p-0">
                                {t("Total Price Before Discount")}
                            </div>
                            <div className={`col-md-9 fw-bold p-0 ${i18n.language !== "ar" ? "text-md-end" : "text-md-start"}`}>
                                {(pricesDetailsSummary.totalPriceBeforeDiscount * usdPriceAgainstCurrency).toFixed(2)} {t(currencyNameByCountry)}
                            </div>
                        </div>
                        <div className="row total-price-discount total pb-3 mb-5">
                            <div className="col-md-3 fw-bold p-0">
                                {t("Total Discount")}
                            </div>
                            <div className={`col-md-9 fw-bold p-0 ${i18n.language !== "ar" ? "text-md-end" : "text-md-start"}`}>
                                {(pricesDetailsSummary.totalDiscount * usdPriceAgainstCurrency).toFixed(2)} {t(currencyNameByCountry)}
                            </div>
                        </div>
                        <div className="row total-price-after-discount total pb-3 mb-5">
                            <div className="col-md-3 fw-bold p-0">
                                {t("Total Price After Discount")}
                            </div>
                            <div className={`col-md-9 fw-bold p-0 ${i18n.language !== "ar" ? "text-md-end" : "text-md-start"}`}>
                                {(orderDetails.totalPriceAfterDiscount * usdPriceAgainstCurrency).toFixed(2)} {t(currencyNameByCountry)}
                            </div>
                        </div>
                        <div className="row shipping-cost-for-local-products total pb-3 mb-5">
                            <div className="col-md-3 fw-bold p-0">
                                {t("Shipping Cost For Local Products")}
                            </div>
                            <div className={`col-md-9 fw-bold p-0 ${i18n.language !== "ar" ? "text-md-end" : "text-md-start"}`}>
                                {(orderDetails.shippingCost.forLocalProducts * usdPriceAgainstCurrency).toFixed(2)} {t(currencyNameByCountry)}
                            </div>
                        </div>
                        <div className="row shipping-cost-for-local-products total pb-3 mb-5">
                            <div className="col-md-3 fw-bold p-0">
                                {t("Shipping Cost For International Products")}
                            </div>
                            <div className={`col-md-9 fw-bold p-0 ${i18n.language !== "ar" ? "text-md-end" : "text-md-start"}`}>
                                {(orderDetails.shippingCost.forInternationalProducts * usdPriceAgainstCurrency).toFixed(2)} {t(currencyNameByCountry)}
                            </div>
                        </div>
                        <div className="row total-shipping-cost total pb-3 mb-5">
                            <div className="col-md-3 fw-bold p-0">
                                {t("Total Shipping Cost")}
                            </div>
                            <div className={`col-md-9 fw-bold p-0 ${i18n.language !== "ar" ? "text-md-end" : "text-md-start"}`}>
                                {((orderDetails.shippingCost.forLocalProducts + orderDetails.shippingCost.forInternationalProducts) * usdPriceAgainstCurrency).toFixed(2)} {t(currencyNameByCountry)}
                            </div>
                        </div>
                        <div className="row total-amount total pb-3 mb-5">
                            <div className="col-md-3 fw-bold p-0">
                                {t("Total Amount")}
                            </div>
                            <div className={`col-md-9 fw-bold p-0 ${i18n.language !== "ar" ? "text-md-end" : "text-md-start"}`}>
                                {(orderDetails.orderAmount * usdPriceAgainstCurrency).toFixed(2)} {t(currencyNameByCountry)}
                            </div>
                        </div>
                        <div className="thanks-icon-box mb-4">
                            <FaRegSmileWink className="thanks-icon" style={{ fontSize: "70px" }} />
                        </div>
                        <h4 className="mb-4">
                            {t("Thanks For Purchase From Store")} {storeDetails.name}
                        </h4>
                    </section>}
                    {Object.keys(orderDetails).length > 0 && orderDetails?.checkoutStatus !== "Checkout Successfull" && <NotFoundError errorMsg="Sorry, This Order Is Not Completed !!" />}
                    {Object.keys(orderDetails).length === 0 && <NotFoundError errorMsg="Sorry, This Order Is Not Found !!" />}
                </div>
            </>}
            {isLoadingPage && !errorMsgOnLoadingThePage && <LoaderPage />}
            {errorMsgOnLoadingThePage && <ErrorOnLoadingThePage errorMsg={errorMsgOnLoadingThePage} />}
        </div>
    );
}

export async function getServerSideProps({ query, params }) {
    if (!params.orderId) {
        return {
            redirect: {
                permanent: false,
                destination: "/orders-managment",
            },
            props: {
                countryAsProperty: "kuwait",
            },
        }
    }
    const allowedCountries = ["kuwait", "germany", "turkey"];
    if (query.country) {
        if (!allowedCountries.includes(query.country)) {
            return {
                redirect: {
                    permanent: false,
                    destination: `/orders-managment/${params.orderId}`,
                },
                props: {
                    countryAsProperty: "kuwait",
                    orderIdAsProperty: params.orderId,
                },
            }
        }
        if (Object.keys(query).filter((key) => key !== "country").length > 1) {
            return {
                redirect: {
                    permanent: false,
                    destination: `/orders-managment/${params.orderId}?country=${query.country}`,
                },
                props: {
                    countryAsProperty: query.country,
                    orderIdAsProperty: params.orderId,
                },
            }
        }
        return {
            props: {
                countryAsProperty: query.country,
                orderIdAsProperty: params.orderId,
            },
        }
    }
    return {
        props: {
            countryAsProperty: "kuwait",
            orderIdAsProperty: params.orderId,
        },
    }
}