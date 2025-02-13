import Head from "next/head";
import { PiHandWavingThin } from "react-icons/pi";
import { useEffect, useState } from "react";
import axios from "axios";
import LoaderPage from "@/components/LoaderPage";
import ErrorOnLoadingThePage from "@/components/ErrorOnLoadingThePage";
import AdminPanelHeader from "@/components/AdminPanelHeader";
import { useRouter } from "next/router";
import PaginationBar from "@/components/PaginationBar";
import { HiOutlineBellAlert } from "react-icons/hi2";
import { inputValuesValidation } from "../../../../public/global_functions/validations";
import { getAdminInfo } from "../../../../public/global_functions/popular";
import TableLoader from "@/components/TableLoader";
import NotFoundError from "@/components/NotFoundError";

export default function UpdateAndDeleteBrands() {

    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const [errorMsgOnLoadingThePage, setErrorMsgOnLoadingThePage] = useState("");

    const [adminInfo, setAdminInfo] = useState({});

    const [isGetBrands, setIsGetBrands] = useState(false);

    const [allBrandsInsideThePage, setAllBrandsInsideThePage] = useState([]);

    const [selectedBrandImageIndex, setSelectedBrandImageIndex] = useState(-1);

    const [selectedBrandIndex, setSelectedBrandIndex] = useState(-1);

    const [waitChangeBrandImageMsg, setWaitChangeBrandImageMsg] = useState(false);

    const [errorChangeBrandImageMsg, setErrorChangeBrandImageMsg] = useState("");

    const [successChangeBrandImageMsg, setSuccessChangeBrandImageMsg] = useState("");

    const [waitMsg, setWaitMsg] = useState("");

    const [successMsg, setSuccessMsg] = useState("");

    const [errorMsg, setErrorMsg] = useState("");

    const [errorMsgOnGetBrandsData, setErrorMsgOnGetBrandsData] = useState("");

    const [currentPage, setCurrentPage] = useState(1);

    const [totalPagesCount, setTotalPagesCount] = useState(0);

    const [filters, setFilters] = useState({
        storeId: "",
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
                        }
                        else {
                            setAdminInfo(adminDetails);
                            const tempFilters = { ...filters, storeId: adminDetails.storeId };
                            setFilters(tempFilters);
                            result = (await getAllBrandsInsideThePage(1, pageSize, getFilteringString(tempFilters))).data;
                            setAllBrandsInsideThePage(result.brands);
                            setTotalPagesCount(Math.ceil(result.brandsCount / pageSize));
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
        let filteringString = "";
        if (filters.storeId) filteringString += `storeId=${filters.storeId}&`;
        if (filteringString) filteringString = filteringString.substring(0, filteringString.length - 1);
        return filteringString;
    }

    const getAllBrandsInsideThePage = async (pageNumber, pageSize, filters) => {
        try {
            return (await axios.get(`${process.env.BASE_API_URL}/brands/all-brands-inside-the-page?pageNumber=${pageNumber}&pageSize=${pageSize}&language=${process.env.defaultLanguage}&${filters ? filters : ""}`)).data;
        }
        catch (err) {
            throw err;
        }
    }

    const getPreviousPage = async () => {
        try {
            setIsGetBrands(true);
            setErrorMsgOnGetBrandsData("");
            const newCurrentPage = currentPage - 1;
            setAllBrandsInsideThePage((await getAllBrandsInsideThePage(newCurrentPage, pageSize, getFilteringString(filters))).data.brands);
            setCurrentPage(newCurrentPage);
            setIsGetBrands(false);
        }
        catch (err) {
            if (err?.response?.status === 401) {
                localStorage.removeItem(process.env.adminTokenNameInLocalStorage);
                await router.replace("/login");
            }
            else {
                setErrorMsgOnGetBrandsData(err?.message === "Network Error" ? "Network Error When Get Brands Data" : "Sorry, Someting Went Wrong When Get Brands Data, Please Repeate The Process !!");
            }
        }
    }

    const getNextPage = async () => {
        try {
            setIsGetBrands(true);
            setErrorMsgOnGetBrandsData("");
            const newCurrentPage = currentPage + 1;
            setAllBrandsInsideThePage((await getAllBrandsInsideThePage(newCurrentPage, pageSize, getFilteringString(filters))).data.brands);
            setCurrentPage(newCurrentPage);
            setIsGetBrands(false);
        }
        catch (err) {
            if (err?.response?.status === 401) {
                localStorage.removeItem(process.env.adminTokenNameInLocalStorage);
                await router.replace("/login");
            }
            else {
                setErrorMsgOnGetBrandsData(err?.message === "Network Error" ? "Network Error When Get Brands Data" : "Sorry, Someting Went Wrong When Get Brands Data, Please Repeate The Process !!");
            }
        }
    }

    const getSpecificPage = async (pageNumber) => {
        try {
            setIsGetBrands(true);
            setErrorMsgOnGetBrandsData("");
            setAllBrandsInsideThePage((await getAllBrandsInsideThePage(pageNumber, pageSize, getFilteringString(filters))).data.brands);
            setCurrentPage(pageNumber);
            setIsGetBrands(false);
        }
        catch (err) {
            if (err?.response?.status === 401) {
                localStorage.removeItem(process.env.adminTokenNameInLocalStorage);
                await router.replace("/login");
            }
            else {
                setErrorMsgOnGetBrandsData(err?.message === "Network Error" ? "Network Error When Get Brands Data" : "Sorry, Someting Went Wrong When Get Brands Data, Please Repeate The Process !!");
            }
        }
    }

    const changeBrandData = (brandIndex, fieldName, newValue) => {
        setSelectedBrandImageIndex(-1);
        setSelectedBrandIndex(-1);
        let brandsDataTemp = allBrandsInsideThePage;
        brandsDataTemp[brandIndex][fieldName] = newValue;
        setAllBrandsInsideThePage(brandsDataTemp);
    }

    const changeBrandImage = async (brandIndex) => {
        try {
            setFormValidationErrors({});
            const errorsObject = inputValuesValidation([
                {
                    name: "image",
                    value: allBrandsInsideThePage[brandIndex].image,
                    rules: {
                        isRequired: {
                            msg: "Sorry, This Field Can't Be Empty !!",
                        },
                        isImage: {
                            msg: "Sorry, Invalid Image Type, Please Upload JPG Or PNG Image File !!",
                        },
                    },
                },
            ]);
            setSelectedBrandImageIndex(brandIndex);
            setFormValidationErrors(errorsObject);
            if (Object.keys(errorsObject).length == 0) {
                setWaitChangeBrandImageMsg("Please Wait To Change Image ...");
                let formData = new FormData();
                formData.append("brandImage", allBrandsInsideThePage[brandIndex].image);
                const result = (await axios.put(`${process.env.BASE_API_URL}/brands/change-brand-image/${allBrandsInsideThePage[brandIndex]._id}?language=${process.env.defaultLanguage}`, formData, {
                    headers: {
                        Authorization: localStorage.getItem(process.env.adminTokenNameInLocalStorage),
                    }
                })).data;
                if (!result.error) {
                    setWaitChangeBrandImageMsg("");
                    setSuccessChangeBrandImageMsg("Change Image Successfull !!");
                    let successTimeout = setTimeout(async () => {
                        setSuccessChangeBrandImageMsg("");
                        setSelectedBrandImageIndex(-1);
                        setAllBrandsInsideThePage((await getAllBrandsInsideThePage(currentPage, pageSize, getFilteringString(filters))).data);
                        clearTimeout(successTimeout);
                    }, 1500);
                } else {
                    setWaitChangeBrandImageMsg(false);
                    setErrorChangeBrandImageMsg("Sorry, Someting Went Wrong, Please Repeate The Process !!");
                    let errorTimeout = setTimeout(() => {
                        setErrorChangeBrandImageMsg("");
                        setSelectedBrandImageIndex(-1);
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
                setWaitChangeBrandImageMsg(false);
                setErrorChangeBrandImageMsg(err?.message === "Network Error" ? "Network Error" : "Sorry, Someting Went Wrong, Please Repeate The Process !!");
                let errorTimeout = setTimeout(() => {
                    setErrorChangeBrandImageMsg("");
                    setSelectedBrandImageIndex(-1);
                    clearTimeout(errorTimeout);
                }, 1500);
            }
        }
    }

    const updateBrandInfo = async (brandIndex) => {
        try {
            setFormValidationErrors({});
            const errorsObject = inputValuesValidation([
                {
                    name: "title",
                    value: allBrandsInsideThePage[brandIndex].title,
                    rules: {
                        isRequired: {
                            msg: "Sorry, This Field Can't Be Empty !!",
                        },
                    },
                },
            ]);
            setFormValidationErrors(errorsObject);
            setSelectedBrandIndex(brandIndex);
            if (Object.keys(errorsObject).length == 0) {
                setWaitMsg("Please Wait To Updating ...");
                const result = (await axios.put(`${process.env.BASE_API_URL}/brands/${allBrandsInsideThePage[brandIndex]._id}?language=${process.env.defaultLanguage}`, {
                    newBrandTitle: allBrandsInsideThePage[brandIndex].title,
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
                        setSelectedBrandIndex(-1);
                        clearTimeout(successTimeout);
                    }, 1500);
                } else {
                    setErrorMsg("Sorry, Someting Went Wrong, Please Repeate The Process !!");
                    let errorTimeout = setTimeout(() => {
                        setErrorMsg("");
                        setSelectedBrandIndex(-1);
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
                    setSelectedBrandIndex(-1);
                    clearTimeout(errorTimeout);
                }, 1500);
            }
        }
    }

    const deleteBrand = async (brandIndex) => {
        try {
            setWaitMsg("Please Wait To Deleting ...");
            setSelectedBrandIndex(brandIndex);
            const result = (await axios.delete(`${process.env.BASE_API_URL}/brands/${allBrandsInsideThePage[brandIndex]._id}?language=${process.env.defaultLanguage}`, {
                headers: {
                    Authorization: localStorage.getItem(process.env.adminTokenNameInLocalStorage),
                }
            })).data;
            setWaitMsg("");
            if (!result.error) {
                setSuccessMsg("Deleting Successfull !!");
                let successTimeout = setTimeout(async () => {
                    setSuccessMsg("");
                    setSelectedBrandIndex(-1);
                    setAllBrandsInsideThePage(allBrandsInsideThePage.filter((brand, index) => index !== brandIndex));
                    clearTimeout(successTimeout);
                }, 1500);
            } else {
                setErrorMsg("Sorry, Someting Went Wrong, Please Repeate The Process !!");
                let errorTimeout = setTimeout(() => {
                    setErrorMsg("");
                    setSelectedBrandIndex(-1);
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
                    setSelectedBrandIndex(-1);
                    clearTimeout(errorTimeout);
                }, 1500);
            }
        }
    }

    return (
        <div className="update-and-delete-brands admin-dashboard">
            <Head>
                <title>{process.env.storeName} Admin Dashboard - Update / Delete Brands</title>
            </Head>
            {!isLoadingPage && !errorMsgOnLoadingThePage && <>
                <AdminPanelHeader isWebsiteOwner={adminInfo.isWebsiteOwner} isMerchant={adminInfo.isMerchant} />
                <div className="page-content d-flex justify-content-center align-items-center flex-column p-5">
                    <h1 className="fw-bold w-fit pb-2 mb-4">
                        <PiHandWavingThin className="me-2" />
                        Hi, Mr {adminInfo.firstName + " " + adminInfo.lastName} In Your Update / Delete Brands Page
                    </h1>
                    {allBrandsInsideThePage.length > 0 && !isGetBrands && <section className="brands-box admin-dashbboard-data-box w-100">
                        <table className="brands-table mb-4 managment-table bg-white admin-dashbboard-data-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Image</th>
                                    <th>Processes</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allBrandsInsideThePage.map((brand, brandIndex) => (
                                    <tr key={brand._id}>
                                        <td className="brand-title-cell">
                                            <section className="brand-title mb-4">
                                                <input
                                                    type="text"
                                                    placeholder="Enter New Brand Title"
                                                    defaultValue={brand.title}
                                                    className={`form-control d-block mx-auto p-2 border-2 brand-title-field ${formValidationErrors["title"] && brandIndex === selectedBrandIndex ? "border-danger mb-3" : "mb-4"}`}
                                                    onChange={(e) => changeBrandData(brandIndex, "title", e.target.value.trim())}
                                                ></input>
                                                {formValidationErrors["title"] && brandIndex === selectedBrandIndex && <p className="bg-danger p-2 form-field-error-box m-0 text-white">
                                                    <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                                    <span>{formValidationErrors["title"]}</span>
                                                </p>}
                                            </section>
                                        </td>
                                        <td className="brand-image-cell">
                                            <img
                                                src={`${process.env.BASE_API_URL}/${brand.imagePath}`}
                                                alt={`${brand.title} Brand Image !!`}
                                                width="100"
                                                height="100"
                                                className="d-block mx-auto mb-4"
                                            />
                                            <section className="brand-image mb-4">
                                                <input
                                                    type="file"
                                                    className={`form-control d-block mx-auto p-2 border-2 brand-image-field ${formValidationErrors["image"] && brandIndex === selectedBrandImageIndex ? "border-danger mb-3" : "mb-4"}`}
                                                    onChange={(e) => changeBrandData(brandIndex, "image", e.target.files[0])}
                                                    accept=".png, .jpg, .webp"
                                                />
                                                {formValidationErrors["image"] && brandIndex === selectedBrandImageIndex && <p className="bg-danger p-2 form-field-error-box m-0 text-white">
                                                    <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                                    <span>{formValidationErrors["image"]}</span>
                                                </p>}
                                            </section>
                                            {(selectedBrandImageIndex !== brandIndex && selectedBrandIndex !== brandIndex) &&
                                                <button
                                                    className="btn btn-success d-block mb-3 w-50 mx-auto global-button"
                                                    onClick={() => changeBrandImage(brandIndex)}
                                                >Change</button>
                                            }
                                            {waitChangeBrandImageMsg && selectedBrandImageIndex === brandIndex && <button
                                                className="btn btn-info d-block mb-3 mx-auto global-button"
                                                disabled
                                            >{waitChangeBrandImageMsg}</button>}
                                            {successChangeBrandImageMsg && selectedBrandImageIndex === brandIndex && <button
                                                className="btn btn-success d-block mx-auto global-button"
                                                disabled
                                            >{successChangeBrandImageMsg}</button>}
                                            {errorChangeBrandImageMsg && selectedBrandImageIndex === brandIndex && <button
                                                className="btn btn-danger d-block mx-auto global-button"
                                                disabled
                                            >{errorChangeBrandImageMsg}</button>}
                                        </td>
                                        <td className="update-cell">
                                            {selectedBrandIndex !== brandIndex && <>
                                                <button
                                                    className="btn btn-success d-block mb-3 mx-auto global-button"
                                                    onClick={() => updateBrandInfo(brandIndex)}
                                                >Update</button>
                                                <hr />
                                                <button
                                                    className="btn btn-danger global-button"
                                                    onClick={() => deleteBrand(brandIndex)}
                                                >Delete</button>
                                            </>}
                                            {waitMsg && selectedBrandIndex === brandIndex && <button
                                                className="btn btn-info d-block mb-3 mx-auto global-button"
                                                disabled
                                            >{waitMsg}</button>}
                                            {successMsg && selectedBrandIndex === brandIndex && <button
                                                className="btn btn-success d-block mx-auto global-button"
                                                disabled
                                            >{successMsg}</button>}
                                            {errorMsg && selectedBrandIndex === brandIndex && <button
                                                className="btn btn-danger d-block mx-auto global-button"
                                                disabled
                                            >{errorMsg}</button>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>}
                    {allBrandsInsideThePage.length === 0 && !isGetBrands && <NotFoundError errorMsg="Sorry, Can't Find Any Brands !!" />}
                    {isGetBrands && <TableLoader />}
                    {errorMsgOnGetBrandsData && <NotFoundError errorMsg={errorMsgOnGetBrandsData} />}
                    {totalPagesCount > 1 && !isGetBrands &&
                        <PaginationBar
                            totalPagesCount={totalPagesCount}
                            currentPage={currentPage}
                            getPreviousPage={getPreviousPage}
                            getNextPage={getNextPage}
                            getSpecificPage={getSpecificPage}
                        />
                    }
                </div>
            </>}
            {isLoadingPage && !errorMsgOnLoadingThePage && <LoaderPage />}
            {errorMsgOnLoadingThePage && <ErrorOnLoadingThePage errorMsg={errorMsgOnLoadingThePage} />}
        </div>
    );
}