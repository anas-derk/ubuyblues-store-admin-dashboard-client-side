import Head from "next/head";
import { PiHandWavingThin } from "react-icons/pi";
import { useEffect, useState } from "react";
import axios from "axios";
import LoaderPage from "@/components/LoaderPage";
import ErrorOnLoadingThePage from "@/components/ErrorOnLoadingThePage";
import AdminPanelHeader from "@/components/AdminPanelHeader";
import { useRouter } from "next/router";
import { inputValuesValidation } from "../../../../public/global_functions/validations";
import { getAdminInfo } from "../../../../public/global_functions/popular";
import { HiOutlineBellAlert } from "react-icons/hi2";

export default function UpdateAndDeleteAds() {

    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const [errorMsgOnLoadingThePage, setErrorMsgOnLoadingThePage] = useState("");

    const [adminInfo, setAdminInfo] = useState({});

    const [advertisementType, setAdvertisementType] = useState("text");

    const [allTextAds, setAllTextAds] = useState([]);

    const [allImageAds, setAllImageAds] = useState([]);

    const [newAdImageFiles, setNewAdImageFiles] = useState([]);

    const [selectedAdIndex, setSelectedAdIndex] = useState(-1);

    const [waitMsg, setWaitMsg] = useState("");

    const [errorMsg, setErrorMsg] = useState("");

    const [successMsg, setSuccessMsg] = useState("");

    const [filters, setFilters] = useState({
        storeId: "",
    });

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
                            const tempFilters = { storeId: adminDetails.storeId };
                            setFilters(tempFilters);
                            const filtersAsQuery = getFiltersAsQuery(tempFilters);
                            const allAds = (await getAllAds(filtersAsQuery)).data;
                            allAds.forEach((ad) => {
                                if (ad.type === "text") allTextAds.push(ad);
                                else allImageAds.push(ad);
                            });
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

    const getFiltersAsQuery = (filters) => {
        let filteringString = "";
        if (filters.storeId) filteringString += `storeId=${filters.storeId}&`;
        if (filteringString) filteringString = filteringString.substring(0, filteringString.length - 1);
        return filteringString;
    }

    const getAllAds = async (filters) => {
        try{
            return (await axios.get(`${process.env.BASE_API_URL}/ads/all-ads?language=${process.env.defaultLanguage}&${filters ? filters : ""}`)).data;
        }
        catch(err){
            throw err;
        }
    }

    const changeAdContent = (adIndex, newValue) => {
        setSelectedAdIndex(-1);
        let adsTemp = allTextAds;
        adsTemp[adIndex].content = newValue;
        setAllTextAds(adsTemp);
    }

    const changeAdImage = (imageIndex, newValue) => {
        setSelectedAdIndex(-1);
        let adImagesTemp = newAdImageFiles;
        adImagesTemp[imageIndex] = newValue;
        setNewAdImageFiles(adImagesTemp);
    }

    const updateAd = async (adIndex) => {
        try {
            setFormValidationErrors({});
            const errorsObject = inputValuesValidation(advertisementType === "text" ? [
                {
                    name: "adContent",
                    value: allTextAds[adIndex].content,
                    rules: {
                        isRequired: {
                            msg: "Sorry, This Field Can't Be Empty !!",
                        },
                    },
                },
            ] : [
                {
                    name: "adImage",
                    value: newAdImageFiles[adIndex],
                    rules: {
                        isRequired: {
                            msg: "Sorry, This Field Can't Be Empty !!",
                        },
                        isImage: {
                            msg: "Sorry, Invalid Image Type, Please Upload JPG Or PNG Or Webp Image File !!",
                        },
                    },
                },
            ]);
            setFormValidationErrors(errorsObject);
            setSelectedAdIndex(adIndex);
            if (Object.keys(errorsObject).length == 0) {
                setWaitMsg("Please Wait To Updating ...");
                let result;
                if (advertisementType === "text") {
                    result = (await axios.put(`${process.env.BASE_API_URL}/ads/update-ad-content/${allTextAds[adIndex]._id}?language=${process.env.defaultLanguage}`, {
                        content: allTextAds[adIndex].content,
                    }, {
                        headers: {
                            Authorization: localStorage.getItem(process.env.adminTokenNameInLocalStorage),
                        }
                    })).data;
                }
                else {
                    let formData = new FormData();
                    formData.append("adImage", newAdImageFiles[adIndex]);
                    result = (await axios.put(`${process.env.BASE_API_URL}/ads/update-ad-image/${allImageAds[adIndex]._id}?language=${process.env.defaultLanguage}`, formData, {
                        headers: {
                            Authorization: localStorage.getItem(process.env.adminTokenNameInLocalStorage),
                        }
                    })).data;
                }
                setWaitMsg("");
                if (!result.error) {
                    setSuccessMsg(advertisementType === "text" ? "Updating Successfull !!" : "Change Image Successfull !!");
                    let successTimeout = setTimeout(() => {
                        setSuccessMsg("");
                        setSelectedAdIndex(-1);
                        if (advertisementType === "image") {
                            allImageAds[adIndex].imagePath = result.data.newAdImagePath;
                        }
                        clearTimeout(successTimeout);
                    }, 1500);
                } else {
                    setErrorMsg("Sorry, Someting Went Wrong, Please Repeate The Process !!");
                    let errorTimeout = setTimeout(() => {
                        setErrorMsg("");
                        setSelectedAdIndex(-1);
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
                    setSelectedAdIndex(-1);
                    clearTimeout(errorTimeout);
                }, 1500);
            }
        }
    }

    const deleteAd = async (adIndex) => {
        try {
            setWaitMsg("Please Wait To Deleting ...");
            setSelectedAdIndex(adIndex);
            const result = (await axios.delete(`${process.env.BASE_API_URL}/ads/${advertisementType === "text" ? allTextAds[adIndex]._id : allImageAds[adIndex]._id}?language=${process.env.defaultLanguage}`, {
                headers: {
                    Authorization: localStorage.getItem(process.env.adminTokenNameInLocalStorage),
                }
            })).data;
            setWaitMsg("");
            if (!result.error) {
                setSuccessMsg("Deleting Successfull !!");
                let successTimeout = setTimeout(async () => {
                    setSuccessMsg("");
                    setSelectedAdIndex(-1);
                    if (advertisementType === "text") {
                        setAllTextAds(allTextAds.filter((ad, index) => index !== adIndex));
                    } else {
                        setAllImageAds(allImageAds.filter((ad, index) => index !== adIndex));
                    }
                    clearTimeout(successTimeout);
                }, 1500);
            } else {
                setErrorMsg("Sorry, Someting Went Wrong, Please Repeate The Process !!");
                let errorTimeout = setTimeout(() => {
                    setErrorMsg("");
                    setSelectedAdIndex(-1);
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
                    setSelectedAdIndex(-1);
                    clearTimeout(errorTimeout);
                }, 1500);
            }
        }
    }

    return (
        <div className="update-and-delete-ads admin-dashboard">
            <Head>
                <title>{process.env.storeName} Admin Dashboard - Update / Delete Ads</title>
            </Head>
            {!isLoadingPage && !errorMsgOnLoadingThePage && <>
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
                                            {waitMsg && selectedAdIndex === adIndex && <button
                                                className="btn btn-info d-block mb-3 mx-auto global-button"
                                                disabled
                                            >{waitMsg}</button>}
                                            {successMsg && selectedAdIndex === adIndex && <button
                                                className="btn btn-success d-block mx-auto global-button"
                                                disabled
                                            >{successMsg}</button>}
                                            {errorMsg && selectedAdIndex === adIndex && <button
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
                                        </td>
                                        <td className="update-ad-image-cell">
                                            <section className="ad-image mb-4">
                                                <input
                                                    type="file"
                                                    className={`form-control d-block mx-auto p-2 border-2 ad-image-field ${formValidationErrors["adImage"] && adIndex === selectedAdIndex ? "border-danger mb-3" : "mb-4"}`}
                                                    onChange={(e) => changeAdImage(adIndex, e.target.files[0])}
                                                    accept=".png, .jpg, .webp"
                                                />
                                                {formValidationErrors["adImage"] && adIndex === selectedAdIndex && <p className="bg-danger p-2 form-field-error-box m-0 text-white">
                                                    <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                                    <span>{formValidationErrors["adImage"]}</span>
                                                </p>}
                                            </section>
                                            {selectedAdIndex !== adIndex && <button
                                                className="btn btn-success d-block mb-3 mx-auto global-button"
                                                onClick={() => updateAd(adIndex)}
                                            >Change Image</button>}
                                            {waitMsg === "Please Wait To Updating ..." && selectedAdIndex === adIndex && <button
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
                                        <td className="delete-ad-image-cell">
                                            {(selectedAdIndex !== adIndex || formValidationErrors["adImage"]) && <button
                                                className="btn btn-danger global-button"
                                                onClick={() => deleteAd(adIndex)}
                                            >Delete</button>}
                                            {waitMsg === "Please Wait To Deleting ..." && selectedAdIndex === adIndex && <button
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
            {isLoadingPage && !errorMsgOnLoadingThePage && <LoaderPage />}
            {errorMsgOnLoadingThePage && <ErrorOnLoadingThePage errorMsg={errorMsgOnLoadingThePage} />}
        </div>
    );
}