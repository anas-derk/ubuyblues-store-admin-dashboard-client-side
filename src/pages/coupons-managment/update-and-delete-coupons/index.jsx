import Head from "next/head";
import { PiHandWavingThin } from "react-icons/pi";
import { useEffect, useState } from "react";
import axios from "axios";
import LoaderPage from "@/components/LoaderPage";
import ErrorOnLoadingThePage from "@/components/ErrorOnLoadingThePage";
import AdminPanelHeader from "@/components/AdminPanelHeader";
import { useRouter } from "next/router";
import { inputValuesValidation } from "../../../../public/global_functions/validations";
import { getAdminInfo, handleDisplayConfirmDeleteBox } from "../../../../public/global_functions/popular";
import NotFoundError from "@/components/NotFoundError";
import FormFieldErrorBox from "@/components/FormFieldErrorBox";
import ConfirmDelete from "@/components/ConfirmDelete";

export default function UpdateAndDeleteCoupons() {

    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const [errorMsgOnLoadingThePage, setErrorMsgOnLoadingThePage] = useState("");

    const [adminInfo, setAdminInfo] = useState({});

    const [allCoupons, setAllCoupons] = useState([]);

    const [waitMsg, setWaitMsg] = useState("");

    const [selectedCouponIndex, setSelectedCouponIndex] = useState(-1);

    const [errorMsg, setErrorMsg] = useState("");

    const [successMsg, setSuccessMsg] = useState("");

    const [formValidationErrors, setFormValidationErrors] = useState({});

    const [isDisplayConfirmDeleteBox, setIsDisplayConfirmDeleteBox] = useState(false);

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
                        }
                        else {
                            setAdminInfo(adminDetails);
                            setAllCoupons((await getAllCoupons()).data);
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

    const getAllCoupons = async () => {
        try {
            return (await axios.get(`${process.env.BASE_API_URL}/coupons/all-coupons?language=${process.env.defaultLanguage}`, {
                headers: {
                    Authorization: localStorage.getItem(process.env.adminTokenNameInLocalStorage)
                }
            })).data;
        }
        catch (err) {
            throw err;
        }
    }

    const changeCouponDiscountPercentage = (couponIndex, newValue) => {
        setSelectedCouponIndex(-1);
        let couponsTemp = allCoupons;
        couponsTemp[couponIndex].discountPercentage = newValue;
        setAllCoupons(couponsTemp);
    }

    const updateCoupon = async (couponIndex) => {
        try {
            setFormValidationErrors({});
            const errorsObject = inputValuesValidation([
                {
                    name: "discountPercentage",
                    value: allCoupons[couponIndex].discountPercentage,
                    rules: {
                        isRequired: {
                            msg: "Sorry, This Field Can't Be Empty !!",
                        },
                        isNumber: {
                            msg: "Sorry, This Field Must Be Number !!",
                        },
                        minNumber: {
                            value: 0.1,
                            msg: "Sorry, Minimum Value Can't Be Less Than 0.1 !!",
                        },
                        maxNumber: {
                            value: 100,
                            msg: "Sorry, Minimum Value Can't Be Greater Than 100 !!",
                        }
                    },
                },
            ]);
            setFormValidationErrors(errorsObject);
            setSelectedCouponIndex(couponIndex);
            if (Object.keys(errorsObject).length == 0) {
                setWaitMsg("Please Wait To Updating ...");
                const result = (await axios.put(`${process.env.BASE_API_URL}/coupons/update-coupon-info/${allCoupons[couponIndex]._id}?language=${process.env.defaultLanguage}`, {
                    discountPercentage: Number(allCoupons[couponIndex].discountPercentage),
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
                        setSelectedCouponIndex(-1);
                        clearTimeout(successTimeout);
                    }, 1500);
                } else {
                    setErrorMsg("Sorry, Someting Went Wrong, Please Repeate The Process !!");
                    let errorTimeout = setTimeout(() => {
                        setErrorMsg("");
                        setSelectedCouponIndex(-1);
                        clearTimeout(errorTimeout);
                    }, 1500);
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
                    setSelectedCouponIndex(-1);
                    clearTimeout(errorTimeout);
                }, 1500);
            }
        }
    }

    const deleteCoupon = async (couponIndex) => {
        try {
            setWaitMsg("Please Wait To Deleting ...");
            setSelectedCouponIndex(couponIndex);
            const result = (await axios.delete(`${process.env.BASE_API_URL}/coupons/${allCoupons[couponIndex]._id}?language=${process.env.defaultLanguage}`, {
                headers: {
                    Authorization: localStorage.getItem(process.env.adminTokenNameInLocalStorage),
                }
            })).data;
            setWaitMsg("");
            if (!result.error) {
                setSuccessMsg("Deleting Successfull !!");
                let successTimeout = setTimeout(async () => {
                    setSuccessMsg("");
                    setSelectedCouponIndex(-1);
                    setAllCoupons(allCoupons.filter((coupon, index) => index !== couponIndex));
                    clearTimeout(successTimeout);
                }, 1500);
            } else {
                setErrorMsg("Sorry, Someting Went Wrong, Please Repeate The Process !!");
                let errorTimeout = setTimeout(() => {
                    setErrorMsg("");
                    setSelectedCouponIndex(-1);
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
                    setSelectedCouponIndex(-1);
                    clearTimeout(errorTimeout);
                }, 1500);
            }
        }
    }

    return (
        <div className="update-and-delete-coupons admin-dashboard">
            <Head>
                <title>{process.env.storeName} Admin Dashboard - Update / Delete Coupons</title>
            </Head>
            {!isLoadingPage && !errorMsgOnLoadingThePage && <>
                <AdminPanelHeader isWebsiteOwner={adminInfo.isWebsiteOwner} isMerchant={adminInfo.isMerchant} />
                {isDisplayConfirmDeleteBox && <ConfirmDelete
                    name="Coupon"
                    setIsDisplayConfirmDeleteBox={setIsDisplayConfirmDeleteBox}
                    handleDeleteFunc={() => deleteCoupon(selectedCouponIndex)}
                    setSelectedElementIndex={setSelectedCouponIndex}
                    waitMsg={waitMsg}
                    errorMsg={errorMsg}
                    successMsg={successMsg}
                />}
                <div className="page-content d-flex justify-content-center align-items-center flex-column p-5">
                    <h1 className="fw-bold w-fit pb-2 mb-4">
                        <PiHandWavingThin className="me-2" />
                        Hi, Mr {adminInfo.firstName + " " + adminInfo.lastName} In Your Update / Delete Coupons Page
                    </h1>
                    {allCoupons.length > 0 && <section className="coupons-box w-100">
                        <table className="users-table mb-4 managment-table bg-white w-100">
                            <thead>
                                <tr>
                                    <th>Code</th>
                                    <th>Discount Percentage</th>
                                    <th>Process</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allCoupons.map((coupon, couponIndex) => (
                                    <tr key={coupon._id}>
                                        <td className="code-cell">
                                            {coupon.code}
                                        </td>
                                        <td className="discount-percentage-cell">
                                            <section className="discount-percentage mb-4">
                                                <input
                                                    type="text"
                                                    className={`form-control d-block mx-auto p-2 border-2 discount-percentage-field ${formValidationErrors["discountPercentage"] && couponIndex === selectedCouponIndex ? "border-danger mb-3" : "mb-4"}`}
                                                    defaultValue={coupon.discountPercentage}
                                                    onChange={(e) => changeCouponDiscountPercentage(couponIndex, e.target.value.trim())}
                                                />
                                                {formValidationErrors["discountPercentage"] && couponIndex === selectedCouponIndex && <FormFieldErrorBox errorMsg={formValidationErrors["discountPercentage"]} />}
                                            </section>
                                        </td>
                                        <td className="update-cell">
                                            {selectedCouponIndex !== couponIndex && <>
                                                <button
                                                    className="btn btn-success d-block mb-3 mx-auto global-button"
                                                    onClick={() => updateCoupon(couponIndex)}
                                                >Update</button>
                                                <hr />
                                                <button
                                                    className="btn btn-danger global-button"
                                                    onClick={() => handleDisplayConfirmDeleteBox(couponIndex, setSelectedCouponIndex, setIsDisplayConfirmDeleteBox)}
                                                >Delete</button>
                                            </>}
                                            {waitMsg && selectedCouponIndex === couponIndex && <button
                                                className="btn btn-info d-block mb-3 mx-auto global-button"
                                                disabled
                                            >{waitMsg}</button>}
                                            {successMsg && selectedCouponIndex === couponIndex && <button
                                                className="btn btn-success d-block mx-auto global-button"
                                                disabled
                                            >{successMsg}</button>}
                                            {errorMsg && selectedCouponIndex === couponIndex && <button
                                                className="btn btn-danger d-block mx-auto global-button"
                                                disabled
                                            >{errorMsg}</button>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>}
                    {allCoupons.length === 0 && <NotFoundError errorMsg="Sorry, Can't Find Any Coupons !!" />}
                </div>
            </>}
            {isLoadingPage && !errorMsgOnLoadingThePage && <LoaderPage />}
            {errorMsgOnLoadingThePage && <ErrorOnLoadingThePage errorMsg={errorMsgOnLoadingThePage} />}
        </div>
    );
}