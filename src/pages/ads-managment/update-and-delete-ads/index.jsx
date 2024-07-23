import Head from "next/head";
import { PiHandWavingThin } from "react-icons/pi";
import { useEffect, useState } from "react";
import axios from "axios";
import LoaderPage from "@/components/LoaderPage";
import ErrorOnLoadingThePage from "@/components/ErrorOnLoadingThePage";
import AdminPanelHeader from "@/components/AdminPanelHeader";
import { useRouter } from "next/router";
import { inputValuesValidation } from "../../../../public/global_functions/validations";
import { getAdminInfo, getCategoriesCount, getAllCategoriesInsideThePage } from "../../../../public/global_functions/popular";
import { HiOutlineBellAlert } from "react-icons/hi2";

export default function UpdateAndDeleteCategories() {

    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const [isErrorMsgOnLoadingThePage, setIsErrorMsgOnLoadingThePage] = useState(false);

    const [adminInfo, setAdminInfo] = useState({});

    const [advertisementType, setAdvertisementType] = useState("text");

    const [allTextAds, setAllTextAds] = useState([]);

    const [allImageAds, setAllImageAds] = useState([]);

    const [selectedAdIndex, setSelectedAdIndex] = useState(-1);

    const [waitMsg, setWaitMsg] = useState(false);

    const [errorMsg, setErrorMsg] = useState(false);

    const [successMsg, setSuccessMsg] = useState(false);

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
                        if (adminDetails.isBlocked) {
                            localStorage.removeItem(process.env.adminTokenNameInLocalStorage);
                            await router.replace("/login");
                        }
                        else {
                            setAdminInfo(adminDetails);
                            const allAds = (await getAllAds()).data;
                            allAds.forEach((ad) => {
                                if (ad.type === "text") allTextAds.push(ad);
                                else allImageAds.push(ad);
                            });
                            setIsLoadingPage(false);
                        }
                    }
                })
                .catch(async (err) => {
                    if (err?.response?.data?.msg === "Unauthorized Error") {
                        localStorage.removeItem(process.env.adminTokenNameInLocalStorage);
                        await router.replace("/login");
                    }
                    else {
                        setIsLoadingPage(false);
                        setIsErrorMsgOnLoadingThePage(true);
                    }
                });
        } else router.replace("/login");
    }, []);

    const getAllAds = async () => {
        return (await axios.get(`${process.env.BASE_API_URL}/ads/all-ads`)).data;
    }

    const changeAdContent = (adIndex, newValue) => {
        let adsTemp = allAds;
        adsTemp[adIndex].name = newValue;
        setAllAds(adsTemp);
    }

    const updateAd = async (adIndex) => {
        try {
            setFormValidationErrors({});
            const errorsObject = inputValuesValidation([
                {
                    name: "adContent",
                    value: allAds[adIndex].content,
                    rules: {
                        isRequired: {
                            msg: "Sorry, This Field Can't Be Empty !!",
                        },
                    },
                },
            ]);
            setFormValidationErrors(errorsObject);
            setSelectedAdIndex(adIndex);
            if (Object.keys(errorsObject).length == 0) {
                setWaitMsg("Please Waiting Updating ...");
                const res = await axios.put(`${process.env.BASE_API_URL}/ads/${allAds[adIndex]._id}`, {
                    newCategoryName: allAds[adIndex].name,
                }, {
                    headers: {
                        Authorization: localStorage.getItem(process.env.adminTokenNameInLocalStorage),
                    }
                });
                const result = res.data;
                if (!result.error) {
                    setSuccessMsg("Change Image Successfull !!");
                    let successTimeout = setTimeout(() => {
                        setSuccessMsg("");
                        setSelectedAdIndex(-1);
                        clearTimeout(successTimeout);
                    }, 1500);
                } else {
                    setSelectedAdIndex(-1);
                }
            }
        }
        catch (err) {
            if (err?.response?.data?.msg === "Unauthorized Error") {
                localStorage.removeItem(process.env.adminTokenNameInLocalStorage);
                await router.push("/login");
                return;
            }
            setWaitMsg("");
            setErrorMsg("Sorry, Someting Went Wrong, Please Repeate The Process !!");
            let errorTimeout = setTimeout(() => {
                setErrorMsg("");
                setSelectedAdIndex(-1);
                clearTimeout(errorTimeout);
            }, 1500);
        }
    }

    const deleteAd = async (adIndex) => {
        try {
            setWaitMsg("Please Waiting Deleting ...");
            setSelectedAdIndex(adIndex);
            const res = await axios.delete(`${process.env.BASE_API_URL}/ads/${adId}`, {
                headers: {
                    Authorization: localStorage.getItem(process.env.adminTokenNameInLocalStorage),
                }
            });
            const result = res.data;
            setWaitMsg("");
            if (!result.error) {
                setSuccessMsg(result.msg);
                let successTimeout = setTimeout(async () => {
                    setSuccessMsg("");
                    setSelectedAdIndex(-1);
                    clearTimeout(successTimeout);
                }, 1500);
            } else {
                setSelectedAdIndex(-1);
            }
        }
        catch (err) {
            if (err?.response?.data?.msg === "Unauthorized Error") {
                localStorage.removeItem(process.env.adminTokenNameInLocalStorage);
                await router.push("/login");
                return;
            }
            setWaitMsg("");
            setErrorMsg("Sorry, Someting Went Wrong, Please Repeate The Process !!");
            let errorTimeout = setTimeout(() => {
                setErrorMsg("");
                setSelectedAdIndex(-1);
                clearTimeout(errorTimeout);
            }, 1500);
        }
    }

    return (
        <div className="update-and-delete-ads admin-dashboard">
            <Head>
                <title>Ubuyblues Store Admin Dashboard - Update / Delete Ads</title>
            </Head>
            {!isLoadingPage && !isErrorMsgOnLoadingThePage && <>
                <AdminPanelHeader isWebsiteOwner={adminInfo.isWebsiteOwner} isMerchant={adminInfo.isMerchant} />
                <div className="page-content d-flex justify-content-center align-items-center flex-column p-5">
                    <h1 className="fw-bold w-fit pb-2 mb-4">
                        <PiHandWavingThin className="me-2" />
                        Hi, Mr {adminInfo.firstName + " " + adminInfo.lastName} In Your Update / Delete Ads Page
                    </h1>
                    <section className="filters mb-3 bg-white border-3 border-info p-3 text-start w-100">
                        <h5 className="section-name fw-bold text-center">Select Advertisement Type:</h5>
                        <hr />
                        <div className="row mb-4">
                            <div className="col-md-12">
                                <h6 className="me-2 fw-bold text-center">Advertisement Type</h6>
                                <select
                                    className="select-advertisement-type form-select"
                                    onChange={(e) => setAdvertisementType(e.target.value)}
                                    defaultValue="text"
                                >
                                    <option value="" hidden>Pleae Select Advertisement Type</option>
                                    <option value="text">Text</option>
                                    <option value="image">Image</option>
                                </select>
                            </div>
                        </div>
                    </section>
                    {allTextAds.length > 0 && advertisementType === "text" && <section className="text-ads-box w-100">
                        <table className="ads-table mb-4 managment-table bg-white w-100">
                            <thead>
                                <tr>
                                    <th>Content</th>
                                    <th>Process</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allTextAds.map((ad, adIndex) => (
                                    <tr key={ad._id}>
                                        <td className="ad-content-cell">
                                            <section className="ad-content mb-4">
                                                <input
                                                    type="text"
                                                    className={`form-control d-block mx-auto p-2 border-2 ad-content-field ${formValidationErrors["adContent"] && adIndex === selectedAdIndex ? "border-danger mb-3" : "mb-4"}`}
                                                    defaultValue={ad.content}
                                                    onChange={(e) => changeAdContent(adIndex, e.target.value.trim())}
                                                ></input>
                                                {formValidationErrors["adContent"] && adIndex === selectedAdIndex && <p className="bg-danger p-2 form-field-error-box m-0 text-white">
                                                    <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                                    <span>{formValidationErrors["adContent"]}</span>
                                                </p>}
                                            </section>
                                        </td>
                                        <td className="update-cell">
                                            {selectedAdIndex !== adIndex && <>
                                                <button
                                                    className="btn btn-success d-block mb-3 mx-auto global-button"
                                                    onClick={() => updateAd(adIndex)}
                                                >Update</button>
                                                <hr />
                                                <button
                                                    className="btn btn-danger global-button"
                                                    onClick={() => deleteAd(adIndex)}
                                                >Delete</button>
                                            </>}
                                            {waitMsg && <button
                                                className="btn btn-info d-block mb-3 mx-auto global-button"
                                            >{waitMsg}</button>}
                                            {successMsg && <button
                                                className="btn btn-success d-block mx-auto global-button"
                                                disabled
                                            >{successMsg}</button>}
                                            {errorMsg && <button
                                                className="btn btn-danger d-block mx-auto global-button"
                                                disabled
                                            >{errorMsg}</button>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>}
                    {allImageAds.length > 0 && advertisementType === "image" && <section className="image-ads-box w-100">
                        <table className="ads-table mb-4 managment-table bg-white w-100">
                            <thead>
                                <tr>
                                    <th>Image</th>
                                    <th>Change Ad Image</th>
                                    <th>Delete Ad</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allImageAds.map((ad, adIndex) => (
                                    <tr key={ad._id}>
                                        <td className="ad-image-cell">
                                            <img
                                                src={`${process.env.BASE_API_URL}/${ad.imagePath}`}
                                                alt="Ad Image !!"
                                                width="100"
                                                height="100"
                                                className="d-block mx-auto mb-4"
                                            />
                                            <section className="ad-image mb-4">
                                                <input
                                                    type="file"
                                                    className={`form-control d-block mx-auto p-2 border-2 ad-image-field ${formValidationErrors["adImage"] && adIndex === selectedAdIndex ? "border-danger mb-3" : "mb-4"}`}
                                                    onChange={(e) => changeAdImage(adIndex, "adImage", e.target.files[0])}
                                                    accept=".png, .jpg, .webp"
                                                />
                                                {formValidationErrors["adImage"] && adIndex === selectedAdIndex && <p className="bg-danger p-2 form-field-error-box m-0 text-white">
                                                    <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                                    <span>{formValidationErrors["adImage"]}</span>
                                                </p>}
                                            </section>
                                        </td>
                                        <td className="update-ad-image-cell">
                                            <section className="ad-image mb-4">
                                                <input
                                                    type="file"
                                                    className={`form-control d-block mx-auto p-2 border-2 ad-image-field ${formValidationErrors["adImage"] && adIndex === selectedAdIndex ? "border-danger mb-3" : "mb-4"}`}
                                                    onChange={(e) => changeGalleryImage(adIndex, e.target.files[0])}
                                                    accept=".png, .jpg, .webp"
                                                />
                                                {formValidationErrors["adImage"] && adIndex === selectedAdIndex && <p className="bg-danger p-2 form-field-error-box m-0 text-white">
                                                    <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                                    <span>{formValidationErrors["adImage"]}</span>
                                                </p>}
                                            </section>
                                            {selectedAdIndex !== adIndex && <button
                                                className="btn btn-success d-block mb-3 mx-auto global-button"
                                                onClick={() => updateGalleryImage(adIndex)}
                                            >Change Image</button>}
                                            {waitMsg === "Please Waiting Updating ..." && selectedAdIndex === adIndex && <button
                                                className="btn btn-info d-block mb-3 mx-auto global-button"
                                                disabled
                                            >{waitMsg}</button>}
                                            {successMsg === "Change Image Successfull !!" && selectedAdIndex === adIndex && <button
                                                className="btn btn-success d-block mx-auto global-button"
                                                disabled
                                            >{successMsg}</button>}
                                            {errorMsg === "Sorry, Someting Went Wrong When Updating, Please Repeate The Process !!" && selectedAdIndex === adIndex && <button
                                                className="btn btn-danger d-block mx-auto global-button"
                                                disabled
                                            >{errorMsg}</button>}
                                        </td>
                                        <td className="delete-gallery-image-cell">
                                            {(selectedAdIndex !== adIndex || formValidationErrors["galleryImage"]) && <button
                                                className="btn btn-danger global-button"
                                                onClick={() => deleteImageFromGallery(adIndex)}
                                            >Delete</button>}
                                            {waitMsg === "Please Waiting Deleting ..." && selectedAdIndex === adIndex && <button
                                                className="btn btn-info d-block mb-3 mx-auto global-button"
                                                disabled
                                            >{waitMsg}</button>}
                                            {successMsg === "Deleting Successfull !!" && selectedAdIndex === adIndex && <button
                                                className="btn btn-success d-block mx-auto global-button"
                                                disabled
                                            >{successMsg}</button>}
                                            {errorMsg === "Sorry, Someting Went Wrong When Deleting, Please Repeate The Process !!" && selectedAdIndex === adIndex && <button
                                                className="btn btn-danger d-block mx-auto global-button"
                                                disabled
                                            >{errorMsg}</button>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>}
                    {allTextAds.length === 0 && advertisementType === "text" && <p className="alert alert-danger w-100">Sorry, Can't Find Any Text Ads !!</p>}
                    {allImageAds.length === 0 && advertisementType === "image" && <p className="alert alert-danger w-100">Sorry, Can't Find Any Image Ads !!</p>}
                </div>
            </>}
            {isLoadingPage && !isErrorMsgOnLoadingThePage && <LoaderPage />}
            {isErrorMsgOnLoadingThePage && <ErrorOnLoadingThePage />}
        </div>
    );
}