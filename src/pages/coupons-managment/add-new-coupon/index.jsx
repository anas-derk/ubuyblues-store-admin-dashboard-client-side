import Head from "next/head";
import { PiHandWavingThin } from "react-icons/pi";
import { useState, useEffect } from "react";
import axios from "axios";
import ErrorOnLoadingThePage from "@/components/ErrorOnLoadingThePage";
import LoaderPage from "@/components/LoaderPage";
import AdminPanelHeader from "@/components/AdminPanelHeader";
import { useRouter } from "next/router";
import { inputValuesValidation } from "../../../../public/global_functions/validations";
import { getAdminInfo } from "../../../../public/global_functions/popular";
import CodeGenerator from "node-code-generator";
import FormFieldErrorBox from "@/components/FormFieldErrorBox";

export default function AddNewCoupon() {

    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const [errorMsgOnLoadingThePage, setErrorMsgOnLoadingThePage] = useState("");

    const [adminInfo, setAdminInfo] = useState({});

    const [couponDetails, setCouponDetails] = useState({
        code: "",
        discountPercentage: 0.1,
    });

    const [waitMsg, setWaitMsg] = useState("");

    const [errorMsg, setErrorMsg] = useState("");

    const [successMsg, setSuccessMsg] = useState("");

    const [formValidationErrors, setFormValidationErrors] = useState({});

    const router = useRouter();

    const generator = new CodeGenerator();

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

    const generateCode = () => {
        setCouponDetails({ ...couponDetails, code: generator.generateCodes("****")[0] });
    }

    const addNewCoupon = async (e) => {
        try {
            e.preventDefault();
            setFormValidationErrors({});
            const errorsObject = inputValuesValidation([
                {
                    name: "code",
                    value: couponDetails.code,
                    rules: {
                        isRequired: {
                            msg: "Sorry, This Field Can't Be Empty !!",
                        },
                    },
                },
                {
                    name: "discountPercentage",
                    value: couponDetails.discountPercentage,
                    rules: {
                        isRequired: {
                            msg: "Sorry, This Field Can't Be Empty !!",
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
            if (Object.keys(errorsObject).length == 0) {
                setWaitMsg("Please Waiting To Add New Coupon ...");
                const result = (await axios.post(`${process.env.BASE_API_URL}/coupons/add-new-coupon?language=${process.env.defaultLanguage}`, couponDetails, {
                    headers: {
                        Authorization: localStorage.getItem(process.env.adminTokenNameInLocalStorage),
                    }
                })).data;
                setWaitMsg("");
                if (!result.error) {
                    setSuccessMsg(result.msg);
                    let successTimeout = setTimeout(() => {
                        setSuccessMsg("");
                        setCouponDetails({ code: "", discountPercentage: 0.1 });
                        clearTimeout(successTimeout);
                    }, 1500);
                } else {
                    setErrorMsg(result.msg);
                    let errorTimeout = setTimeout(() => {
                        setErrorMsg("");
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
                    setSelectedCategoryIndex(-1);
                    clearTimeout(errorTimeout);
                }, 1500);
            }
        }
    }

    return (
        <div className="add-new-coupon admin-dashboard">
            <Head>
                <title>{process.env.storeName} Admin Dashboard - Add New Coupon</title>
            </Head>
            {!isLoadingPage && !errorMsgOnLoadingThePage && <>
                <AdminPanelHeader isWebsiteOwner={adminInfo.isWebsiteOwner} isMerchant={adminInfo.isMerchant} />
                <div className="page-content d-flex justify-content-center align-items-center flex-column p-4">
                    <h1 className="fw-bold w-fit pb-2 mb-3">
                        <PiHandWavingThin className="me-2" />
                        Hi, Mr {adminInfo.firstName + " " + adminInfo.lastName} In Your Add New Coupon Page
                    </h1>
                    <form className="add-new-coupon-form admin-dashbboard-form" onSubmit={addNewCoupon}>
                        <section className="code mb-4 row">
                            <div className="col-md-8">
                                <input
                                    type="text"
                                    className={`form-control p-2 border-2 code-field ${formValidationErrors["code"] ? "border-danger mb-3" : "mb-4"}`}
                                    placeholder="Please Enter Code"
                                    onChange={(e) => setCouponDetails({ ...couponDetails, code: e.target.value })}
                                    value={couponDetails.code}
                                    disabled
                                />
                                {formValidationErrors["code"] && <FormFieldErrorBox errorMsg={formValidationErrors["code"]} />}
                            </div>
                            <div className="col-md-4">
                                <button
                                    type="button"
                                    className="btn btn-success w-100 p-2 global-button"
                                    onClick={generateCode}
                                >
                                    Generate
                                </button>
                            </div>
                        </section>
                        <section className="discount-percentage mb-4">
                            <h6 className="mb-3 fw-bold">Please Enter Percentage Discount</h6>
                            <input
                                type="text"
                                className={`form-control p-2 border-2 discount-percentage-field ${formValidationErrors["discountPercentage"] ? "border-danger mb-3" : "mb-4"}`}
                                placeholder="Please Enter Discount Percentage"
                                onChange={(e) => setCouponDetails({ ...couponDetails, discountPercentage: Number(e.target.value.trim()) })}
                                value={couponDetails.discountPercentage}
                            />
                            {formValidationErrors["discountPercentage"] && <FormFieldErrorBox errorMsg={formValidationErrors["discountPercentage"]} />}
                        </section>
                        {!waitMsg && !successMsg && !errorMsg && <button
                            type="submit"
                            className="btn btn-success w-50 d-block mx-auto p-2 global-button"
                        >
                            Add Now
                        </button>}
                        {waitMsg && <button
                            type="button"
                            className="btn btn-danger w-50 d-block mx-auto p-2 global-button"
                            disabled
                        >
                            {waitMsg}
                        </button>}
                        {errorMsg && <button
                            type="button"
                            className="btn btn-danger w-50 d-block mx-auto p-2 global-button"
                            disabled
                        >
                            {errorMsg}
                        </button>}
                        {successMsg && <button
                            type="button"
                            className="btn btn-success w-75 d-block mx-auto p-2 global-button"
                            disabled
                        >
                            {successMsg}
                        </button>}
                    </form>
                </div>
            </>}
            {isLoadingPage && !errorMsgOnLoadingThePage && <LoaderPage />}
            {errorMsgOnLoadingThePage && <ErrorOnLoadingThePage errorMsg={errorMsgOnLoadingThePage} />}
        </div>
    );
}