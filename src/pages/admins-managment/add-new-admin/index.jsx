import Head from "next/head";
import { PiHandWavingThin } from "react-icons/pi";
import { useEffect, useState } from "react";
import axios from "axios";
import LoaderPage from "@/components/LoaderPage";
import ErrorOnLoadingThePage from "@/components/ErrorOnLoadingThePage";
import AdminPanelHeader from "@/components/AdminPanelHeader";
import { getAdminInfo } from "../../../../public/global_functions/popular";
import { inputValuesValidation } from "../../../../public/global_functions/validations";
import { useRouter } from "next/router";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import FormFieldErrorBox from "@/components/FormFieldErrorBox";

export default function AddNewAdmin() {

    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const [errorMsgOnLoadingThePage, setErrorMsgOnLoadingThePage] = useState("");

    const [adminInfo, setAdminInfo] = useState({});

    const [newAdminData, setNewAdminData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
    });

    const [isVisiblePassword, setIsVisiblePassword] = useState(false);

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
                        if (!adminDetails.isMerchant) {
                            localStorage.removeItem(process.env.adminTokenNameInLocalStorage);
                            await router.replace("/");
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

    const addNewAdmin = async (e, newAdminData) => {
        try {
            e.preventDefault();
            setFormValidationErrors({});
            const errorsObject = inputValuesValidation([
                {
                    name: "firstName",
                    value: newAdminData.firstName,
                    rules: {
                        isRequired: {
                            msg: "Sorry, This Field Can't Be Empty !!",
                        },
                        isName: {
                            msg: "Sorry, This Name Is Not Valid !!",
                        }
                    },
                },
                {
                    name: "lastName",
                    value: newAdminData.lastName,
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
                    value: newAdminData.email,
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
                    name: "password",
                    value: newAdminData.password,
                    rules: {
                        isRequired: {
                            msg: "Sorry, This Field Can't Be Empty !!",
                        },
                        isValidPassword: {
                            msg: "Sorry, The Password Must Be At Least 8 Characters Long, With At Least One Number, At Least One Lowercase Letter, And At Least One Uppercase Letter."
                        },
                    },
                },
            ]);
            setFormValidationErrors(errorsObject);
            if (Object.keys(errorsObject).length == 0) {
                setWaitMsg("Please Waiting To Add New Admin ...");
                const result = (await axios.post(`${process.env.BASE_API_URL}/admins/add-new-admin?language=${process.env.defaultLanguage}`, newAdminData, {
                    headers: {
                        Authorization: localStorage.getItem(process.env.adminTokenNameInLocalStorage),
                    }
                })).data;
                setWaitMsg("");
                if (!result.error) {
                    setSuccessMsg(result.msg);
                    let successTimeout = setTimeout(() => {
                        setSuccessMsg("");
                        setNewAdminData({
                            firstName: "",
                            lastName: "",
                            email: "",
                            password: "",
                        });
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
        <div className="add-new-admin admin-dashboard">
            <Head>
                <title>{process.env.storeName} Admin Dashboard - Add New Admin</title>
            </Head>
            {!isLoadingPage && !errorMsgOnLoadingThePage && <>
                <AdminPanelHeader isWebsiteOwner={adminInfo.isWebsiteOwner} isMerchant={adminInfo.isMerchant} />
                <div className="page-content d-flex justify-content-center align-items-center flex-column pt-5 pb-5 p-4">
                    <h1 className="fw-bold w-fit pb-2 mb-3">
                        <PiHandWavingThin className="me-2" />
                        Hi, Mr {adminInfo.firstName + " " + adminInfo.lastName} In Your Add New Admin Page
                    </h1>
                    <form className="add-new-product-form admin-dashbboard-form" onSubmit={(e) => addNewAdmin(e, newAdminData)}>
                        <section className="first-name mb-4">
                            <input
                                type="text"
                                className={`form-control p-2 border-2 product-name-field ${formValidationErrors["firstName"] ? "border-danger mb-3" : "mb-4"}`}
                                placeholder="Please Enter First Name"
                                onChange={(e) => setNewAdminData({ ...newAdminData, firstName: e.target.value })}
                                value={newAdminData.firstName}
                            />
                            {formValidationErrors["firstName"] && <FormFieldErrorBox errorMsg={formValidationErrors["firstName"]} />}
                        </section>
                        <section className="last-name mb-4">
                            <input
                                type="text"
                                className={`form-control p-2 border-2 product-name-field ${formValidationErrors["lastName"] ? "border-danger mb-3" : "mb-4"}`}
                                placeholder="Please Enter Last Name"
                                onChange={(e) => setNewAdminData({ ...newAdminData, lastName: e.target.value })}
                                value={newAdminData.lastName}
                            />
                            {formValidationErrors["lastName"] && <FormFieldErrorBox errorMsg={formValidationErrors["lastName"]} />}
                        </section>
                        <section className="email mb-4">
                            <input
                                type="text"
                                className={`form-control p-2 border-2 admin-email-field ${formValidationErrors["email"] ? "border-danger mb-3" : "mb-4"}`}
                                placeholder="Please Enter Email"
                                onChange={(e) => setNewAdminData({ ...newAdminData, email: e.target.value })}
                                value={newAdminData.email}
                            />
                            {formValidationErrors["email"] && <FormFieldErrorBox errorMsg={formValidationErrors["email"]} />}
                        </section>
                        <section className="password mb-4">
                            <div className={`current-password-field-box ${formValidationErrors["password"] ? "error-in-field" : ""}`}>
                                <input
                                    type={isVisiblePassword ? "text" : "password"}
                                    className={`p-2 form-control ${formValidationErrors["password"] ? "border-3 border-danger mb-3" : ""}`}
                                    placeholder="Please Enter Password"
                                    onChange={(e) => setNewAdminData({ ...newAdminData, password: e.target.value.trim() })}
                                    value={newAdminData.password}
                                />
                                <div className="icon-box other-languages-mode">
                                    {!isVisiblePassword && <AiOutlineEye className="eye-icon icon" onClick={() => setIsVisiblePassword(value => value = !value)} />}
                                    {isVisiblePassword && <AiOutlineEyeInvisible className="invisible-eye-icon icon" onClick={() => setIsVisiblePassword(value => value = !value)} />}
                                </div>
                            </div>
                            {formValidationErrors["password"] && <FormFieldErrorBox errorMsg={formValidationErrors["password"]} />}
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