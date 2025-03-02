import Head from "next/head";
import { PiHandWavingThin } from "react-icons/pi";
import { useState, useEffect } from "react";
import axios from "axios";
import ErrorOnLoadingThePage from "@/components/ErrorOnLoadingThePage";
import LoaderPage from "@/components/LoaderPage";
import AdminPanelHeader from "@/components/AdminPanelHeader";
import { inputValuesValidation } from "../../../../public/global_functions/validations";
import { getAdminInfo } from "../../../../public/global_functions/popular";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { useRouter } from "next/router";

export default function ChangeBussinessEmailPassword() {

    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const [errorMsgOnLoadingThePage, setErrorMsgOnLoadingThePage] = useState("");

    const [adminInfo, setAdminInfo] = useState({});

    const [email, setEmail] = useState("");

    const [currentPassword, setCurrentPassword] = useState("");

    const [newPassword, setNewPassword] = useState("");

    const [confirmNewPassword, setConfirmNewPassword] = useState("");

    const [isVisibleCurrentPassword, setIsVisibleCurrentPassword] = useState(false);

    const [isVisibleNewPassword, setIsVisibleNewPassword] = useState(false);

    const [isVisibleConfirmNewPassword, setIsVisibleConfirmNewPassword] = useState(false);

    const [waitMsg, setWaitMsg] = useState("");

    const [errorMsg, setErrorMsg] = useState("");

    const [successMsg, setSuccessMsg] = useState("");

    const [formValidationErrors, setFormValidationErrors] = useState({});

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
                        if (adminDetails.isWebsiteOwner) {
                            setAdminInfo(adminDetails);
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

    const changeBussinessEmailPassword = async (e) => {
        try {
            e.preventDefault();
            const errorsObject = inputValuesValidation([
                {
                    name: "email",
                    value: email,
                    rules: {
                        isRequired: {
                            msg: "Sorry, This Field Can't Be Empty !!",
                        },
                        isEmail: {
                            msg: "Sorry, Invalid Email !!",
                        },
                    },
                },
                {
                    name: "currentPassword",
                    value: currentPassword,
                    rules: {
                        isRequired: {
                            msg: "Sorry, This Field Can't Be Empty !!",
                        },
                    }
                },
                {
                    name: "newPassword",
                    value: newPassword,
                    rules: {
                        isRequired: {
                            msg: "Sorry, This Field Can't Be Empty !!",
                        },
                        isMatch: {
                            value: confirmNewPassword,
                            msg: "Sorry, There Is No Match Between New Password And Confirm It !!",
                        },
                    }
                },
                {
                    name: "confirmNewPassword",
                    value: confirmNewPassword,
                    rules: {
                        isRequired: {
                            msg: "Sorry, This Field Can't Be Empty !!",
                        },
                        isMatch: {
                            value: newPassword,
                            msg: "Sorry, There Is No Match Between New Password And Confirm It !!",
                        },
                    }
                },
            ]);
            setFormValidationErrors(errorsObject);
            if (Object.keys(errorsObject).length == 0) {
                setWaitMsg("Please Wait To Change ...");
                const result = (await axios.put(`${process.env.BASE_API_URL}/global-passwords/change-bussiness-email-password?email=${email}&password=${currentPassword}&newPassword=${newPassword}&language=${process.env.defaultLanguage}`, undefined, {
                    headers: {
                        Authorization: localStorage.getItem(process.env.adminTokenNameInLocalStorage),
                    },
                })).data;
                setWaitMsg("");
                if (!result.error) {
                    setSuccessMsg(result.msg);
                    let successTimeout = setTimeout(() => {
                        setSuccessMsg("");
                        setEmail("");
                        setCurrentPassword("");
                        setNewPassword("");
                        setConfirmNewPassword("");
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
                    clearTimeout(errorTimeout);
                }, 1500);
            }
        }
    }

    return (
        <div className="change-bussiness-email-password admin-dashboard">
            <Head>
                <title>{process.env.storeName} Admin Dashboard - Change Bussiness Email Password</title>
            </Head>
            {!isLoadingPage && !errorMsgOnLoadingThePage && <>
                <AdminPanelHeader isWebsiteOwner={adminInfo.isWebsiteOwner} isMerchant={adminInfo.isMerchant} />
                <div className="page-content d-flex justify-content-center align-items-center flex-column p-4">
                    <h1 className="fw-bold w-fit pb-2 mb-3">
                        <PiHandWavingThin className="me-2" />
                        Hi, Mr {adminInfo.firstName + " " + adminInfo.lastName} In  Change Bussiness Email Password Page
                    </h1>
                    <form className="change-bussiness-email-password-form admin-dashbboard-form" onSubmit={changeBussinessEmailPassword}>
                        <section className="email mb-4">
                            <input
                                type="text"
                                className={`p-2 form-control ${formValidationErrors.email ? "border-3 border-danger mb-3" : ""}`}
                                placeholder="Please Enter Bussiness Email Here"
                                onChange={(e) => setEmail(e.target.value.trim())}
                                value={email}
                            />
                            {formValidationErrors["email"] && <FormFieldErrorBox errorMsg={formValidationErrors["email"]} />}
                        </section>
                        <section className="current-password mb-3">
                            <div className={`current-password-field-box ${formValidationErrors.currentPassword ? "error-in-field" : ""}`}>
                                <input
                                    type={isVisibleCurrentPassword ? "text" : "password"}
                                    className={`p-2 form-control ${formValidationErrors.currentPassword ? "border-3 border-danger mb-3" : ""}`}
                                    placeholder="Please Enter Current Password"
                                    onChange={(e) => setCurrentPassword(e.target.value.trim())}
                                    value={currentPassword}
                                />
                                <div className="icon-box other-languages-mode">
                                    {!isVisibleCurrentPassword && <AiOutlineEye className='eye-icon icon' onClick={() => setIsVisibleCurrentPassword(value => value = !value)} />}
                                    {isVisibleCurrentPassword && <AiOutlineEyeInvisible className='invisible-eye-icon icon' onClick={() => setIsVisibleCurrentPassword(value => value = !value)} />}
                                </div>
                            </div>
                            {formValidationErrors["currentPassword"] && <FormFieldErrorBox errorMsg={formValidationErrors["currentPassword"]} />}
                        </section>
                        <section className="new-password mb-3">
                            <div className={`new-password-field-box ${formValidationErrors.newPassword ? "error-in-field" : ""}`}>
                                <input
                                    type={isVisibleNewPassword ? "text" : "password"}
                                    className={`p-2 form-control ${formValidationErrors.newPassword ? "border-3 border-danger mb-3" : ""}`}
                                    placeholder="Please Enter New Password"
                                    onChange={(e) => setNewPassword(e.target.value.trim())}
                                    value={newPassword}
                                />
                                <div className="icon-box other-languages-mode">
                                    {!isVisibleNewPassword && <AiOutlineEye className='eye-icon icon' onClick={() => setIsVisibleNewPassword(value => value = !value)} />}
                                    {isVisibleNewPassword && <AiOutlineEyeInvisible className='invisible-eye-icon icon' onClick={() => setIsVisibleNewPassword(value => value = !value)} />}
                                </div>
                            </div>
                            {formValidationErrors["newPassword"] && <FormFieldErrorBox errorMsg={formValidationErrors["newPassword"]} />}
                        </section>
                        <section className="confirm-new-password mb-3">
                            <div className={`confirm-new-password-field-box ${formValidationErrors.confirmNewPassword ? "error-in-field" : ""}`}>
                                <input
                                    type={isVisibleConfirmNewPassword ? "text" : "password"}
                                    className={`p-2 form-control ${formValidationErrors.confirmNewPassword ? "border-3 border-danger mb-3" : ""}`}
                                    placeholder="Please Enter Confirm New Password"
                                    onChange={(e) => setConfirmNewPassword(e.target.value.trim())}
                                    value={confirmNewPassword}
                                />
                                <div className="icon-box other-languages-mode">
                                    {!isVisibleConfirmNewPassword && <AiOutlineEye className='eye-icon icon' onClick={() => setIsVisibleConfirmNewPassword(value => value = !value)} />}
                                    {isVisibleConfirmNewPassword && <AiOutlineEyeInvisible className='invisible-eye-icon icon' onClick={() => setIsVisibleConfirmNewPassword(value => value = !value)} />}
                                </div>
                            </div>
                            {formValidationErrors["confirmNewPassword"] && <FormFieldErrorBox errorMsg={formValidationErrors["confirmNewPassword"]} />}
                        </section>
                        {!waitMsg && !successMsg && !errorMsg && <button
                            type="submit"
                            className="btn btn-success w-50 d-block mx-auto p-2 global-button"
                        >
                            Change Now
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