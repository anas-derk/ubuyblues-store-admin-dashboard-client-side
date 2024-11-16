import { useState } from "react";
import { GrFormClose } from "react-icons/gr";
import axios from "axios";
import { useRouter } from "next/router";
import { HiOutlineBellAlert } from "react-icons/hi2";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { inputValuesValidation } from "../../../public/global_functions/validations";

export default function ChangeStoreStatusBox({
    setIsDisplayChangeStoreStatusBox,
    setStoreAction,
    selectedStore,
    storeAction,
    handleChangeStoreStatus,
}) {

    const [changeStatusReason, setChangeStatusReason] = useState("");

    const [adminPassword, setAdminPassword] = useState("");

    const [isVisiblePassword, setIsVisiblePassword] = useState("");

    const [waitMsg, setWaitMsg] = useState("");

    const [successMsg, setSuccessMsg] = useState("");

    const [errorMsg, setErrorMsg] = useState("");

    const [formValidationErrors, setFormValidationErrors] = useState({});

    const router = useRouter();

    const handleClosePopupBox = () => {
        setIsDisplayChangeStoreStatusBox(false);
        setStoreAction("");
    }

    const approveStoreCreate = async (storeId) => {
        try {
            setFormValidationErrors({});
            const errorsObject = inputValuesValidation([
                {
                    name: "adminPassword",
                    value: adminPassword,
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
                setWaitMsg("Please Waiting ...");
                const result = (await axios.post(`${process.env.BASE_API_URL}/stores/approve-store/${storeId}?password=${adminPassword}&language=${process.env.defaultLanguage}`, undefined,
                    {
                        headers: {
                            Authorization: localStorage.getItem(process.env.adminTokenNameInLocalStorage),
                        }
                    }
                )).data;
                setWaitMsg("");
                if (!result.error) {
                    setSuccessMsg(result.msg);
                    let successTimeout = setTimeout(async () => {
                        setSuccessMsg("");
                        handleClosePopupBox();
                        handleChangeStoreStatus("approving");
                        clearTimeout(successTimeout);
                    }, 3000);
                }
                else {
                    setErrorMsg("Sorry, Someting Went Wrong, Please Repeate The Process !!");
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

    const rejectStoreCreate = async (storeId) => {
        try {
            setWaitMsg("Please Waiting ...");
            const result = (await axios.delete(`${process.env.BASE_API_URL}/stores/reject-store/${storeId}?language=${process.env.defaultLanguage}`,
                {
                    headers: {
                        Authorization: localStorage.getItem(process.env.adminTokenNameInLocalStorage),
                    }
                }
            )).data;
            setWaitMsg("");
            if (!result.error) {
                setSuccessMsg(result.msg);
                let successTimeout = setTimeout(async () => {
                    setSuccessMsg("");
                    handleClosePopupBox();
                    handleChangeStoreStatus("rejecting");
                    clearTimeout(successTimeout);
                }, 3000);
            }
            else {
                setErrorMsg("Sorry, Someting Went Wrong, Please Repeate The Process !!");
                let errorTimeout = setTimeout(() => {
                    setErrorMsg("");
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
                    clearTimeout(errorTimeout);
                }, 1500);
            }
        }
    }

    const blockingStore = async (storeId, changeStatusReason) => {
        try {
            setFormValidationErrors({});
            const errorsObject = inputValuesValidation([
                {
                    name: "changeStatusReason",
                    value: changeStatusReason,
                    rules: {
                        isRequired: {
                            msg: "Sorry, This Field Can't Be Empty !!",
                        },
                    },
                },
            ]);
            setFormValidationErrors(errorsObject);
            if (Object.keys(errorsObject).length == 0) {
                setWaitMsg("Please Waiting ...");
                const result = (await axios.put(`${process.env.BASE_API_URL}/stores/blocking-store/${storeId}?blockingReason=${changeStatusReason}&language=${process.env.defaultLanguage}`, undefined,
                    {
                        headers: {
                            Authorization: localStorage.getItem(process.env.adminTokenNameInLocalStorage),
                        }
                    }
                )).data;
                setWaitMsg("");
                if (!result.error) {
                    setSuccessMsg(result.msg);
                    let successTimeout = setTimeout(async () => {
                        setSuccessMsg("");
                        handleClosePopupBox();
                        handleChangeStoreStatus("blocking");
                        clearTimeout(successTimeout);
                    }, 3000);
                }
                else {
                    setErrorMsg("Sorry, Someting Went Wrong, Please Repeate The Process !!");
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

    const cancelBlockingStore = async (storeId) => {
        try {
            setWaitMsg("Please Waiting ...");
            const result = (await axios.put(`${process.env.BASE_API_URL}/stores/cancel-blocking/${storeId}?language=${process.env.defaultLanguage}`, undefined,
                {
                    headers: {
                        Authorization: localStorage.getItem(process.env.adminTokenNameInLocalStorage),
                    }
                }
            )).data;
            setWaitMsg("");
            if (!result.error) {
                setSuccessMsg(result.msg);
                let successTimeout = setTimeout(async () => {
                    setSuccessMsg("");
                    handleClosePopupBox();
                    handleChangeStoreStatus("approving");
                    clearTimeout(successTimeout);
                }, 3000);
            }
            else {
                setErrorMsg("Sorry, Someting Went Wrong, Please Repeate The Process !!");
                let errorTimeout = setTimeout(() => {
                    setErrorMsg("");
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
                    clearTimeout(errorTimeout);
                }, 1500);
            }
        }
    }

    return (
        <div className="change-store-status-box popup-box">
            <div className="content-box d-flex align-items-center justify-content-center text-white flex-column p-4 text-center">
                {!waitMsg && !errorMsg && !successMsg && <GrFormClose className="close-popup-box-icon" onClick={handleClosePopupBox} />}
                <h2 className="mb-5 pb-3 border-bottom border-white">Change Store Status</h2>
                <h4 className="mb-4">Are You Sure From: {storeAction} Store: ( {selectedStore.name} ) ?</h4>
                <form className="change-store-status-form w-50" onSubmit={(e) => e.preventDefault()}>
                    {storeAction === "blocking" && <section className="change-store-status mb-4">
                        <input
                            type="text"
                            className={`form-control p-3 border-2 change-status-reason-field ${formValidationErrors["changeStatusReason"] ? "border-danger mb-3" : "mb-4"}`}
                            placeholder={`Please Enter ${storeAction} Reason`}
                            onChange={(e) => setChangeStatusReason(e.target.value)}
                            value={changeStatusReason}
                        />
                        {formValidationErrors["changeStatusReason"] && <p className="bg-danger p-2 form-field-error-box m-0 text-white">
                            <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                            <span>{formValidationErrors["changeStatusReason"]}</span>
                        </p>}
                    </section>}
                    {
                        !waitMsg &&
                        !errorMsg &&
                        !successMsg &&
                        storeAction === "approving" && <section className="change-store-status mb-4">
                            <div className="password-field-box">
                                <input
                                    type={isVisiblePassword ? "text" : "password"}
                                    placeholder="Please Enter Merchant Account Password"
                                    className={`form-control p-3 border-2 ${formValidationErrors["isVisiblePassword"] ? "border-danger mb-3" : "mb-5"}`}
                                    onChange={(e) => setAdminPassword(e.target.value.trim())}
                                />
                                <div className="icon-box text-dark other-languages-mode">
                                    {!isVisiblePassword && <AiOutlineEye className='eye-icon icon' onClick={() => setIsVisiblePassword(value => value = !value)} />}
                                    {isVisiblePassword && <AiOutlineEyeInvisible className='invisible-eye-icon icon' onClick={() => setIsVisiblePassword(value => value = !value)} />}
                                </div>
                            </div>
                            {formValidationErrors["adminPassword"] && <p className="bg-danger p-2 form-field-error-box m-0 text-white">
                                <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                <span>{formValidationErrors["adminPassword"]}</span>
                            </p>}
                        </section>
                    }
                    {
                        !waitMsg &&
                        !errorMsg &&
                        !successMsg &&
                        storeAction === "approving" &&
                        <button
                            className="btn btn-success d-block mx-auto mb-4 global-button"
                            onClick={() => approveStoreCreate(selectedStore._id)}
                        >
                            Approve
                        </button>
                    }
                    {
                        !waitMsg &&
                        !errorMsg &&
                        !successMsg &&
                        storeAction === "rejecting" &&
                        <button
                            className="btn btn-success d-block mx-auto mb-4 global-button"
                            onClick={() => rejectStoreCreate(selectedStore._id)}
                        >
                            Reject
                        </button>
                    }
                    {
                        !waitMsg &&
                        !errorMsg &&
                        !successMsg &&
                        storeAction === "blocking" &&
                        <button
                            className="btn btn-success d-block mx-auto mb-4 global-button"
                            onClick={() => blockingStore(selectedStore._id, changeStatusReason)}
                        >
                            Block
                        </button>
                    }
                    {
                        !waitMsg &&
                        !errorMsg &&
                        !successMsg &&
                        storeAction === "cancel-blocking" &&
                        <button
                            className="btn btn-success d-block mx-auto mb-4 global-button"
                            onClick={() => cancelBlockingStore(selectedStore._id)}
                        >
                            Cancel Blocking
                        </button>
                    }
                    {waitMsg &&
                        <button
                            className="btn btn-info d-block mx-auto mb-3 global-button"
                            disabled
                        >
                            {waitMsg}
                        </button>
                    }
                    {errorMsg &&
                        <button
                            className="btn btn-danger d-block mx-auto mb-3 global-button"
                            disabled
                        >
                            {errorMsg}
                        </button>
                    }
                    {successMsg &&
                        <button
                            className="btn btn-success d-block mx-auto mb-3 global-button"
                            disabled
                        >
                            {successMsg}
                        </button>
                    }
                    <button
                        className="btn btn-danger d-block mx-auto global-button"
                        disabled={waitMsg || errorMsg || successMsg}
                        onClick={handleClosePopupBox}
                    >
                        Close
                    </button>
                </form>
            </div>
        </div>
    );
}