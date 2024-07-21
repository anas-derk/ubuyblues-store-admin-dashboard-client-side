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

export default function UpdateAndDeleteBrands() {

    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const [isErrorMsgOnLoadingThePage, setIsErrorMsgOnLoadingThePage] = useState(false);

    const [adminInfo, setAdminInfo] = useState({});

    const [isWaitGetBrandsStatus, setIsWaitGetBrandsStatus] = useState(false);

    const [allBrandsInsideThePage, setAllBrandsInsideThePage] = useState([]);

    const [isWaitStatus, setIsWaitStatus] = useState(false);

    const [updatingBrandImageIndex, setUpdatingBrandImageIndex] = useState(-1);

    const [updatingBrandIndex, setUpdatingBrandIndex] = useState(-1);

    const [deletingBrandIndex, setDeletingBrandIndex] = useState(-1);

    const [isWaitChangeBrandImage, setIsWaitChangeBrandImage] = useState(false);

    const [errorMsg, setErrorMsg] = useState("");

    const [errorChangeBrandImageMsg, setErrorChangeBrandImageMsg] = useState(false);

    const [successMsg, setSuccessMsg] = useState("");

    const [successChangeBrandImageMsg, setSuccessChangeBrandImageMsg] = useState("");

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
                            result = await getBrandsCount(getFilteringString(tempFilters));
                            if (result.data > 0) {
                                setAllBrandsInsideThePage((await getAllBrandsInsideThePage(1, pageSize, getFilteringString(tempFilters))).data);
                                setTotalPagesCount(Math.ceil(result.data / pageSize));
                            }
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

    const getFilteringString = (filters) => {
        let filteringString = "";
        if (filters.storeId) filteringString += `storeId=${filters.storeId}&`;
        if (filteringString) filteringString = filteringString.substring(0, filteringString.length - 1);
        return filteringString;
    }

    const getBrandsCount = async (filters) => {
        try {
            const res = await axios.get(`${process.env.BASE_API_URL}/brands/brands-count?${filters ? filters : ""}`);
            return res.data;
        }
        catch (err) {
            throw Error(err);
        }
    }

    const getAllBrandsInsideThePage = async (pageNumber, pageSize, filters) => {
        try {
            const res = await axios.get(`${process.env.BASE_API_URL}/brands/all-brands-inside-the-page?pageNumber=${pageNumber}&pageSize=${pageSize}&${filters ? filters : ""}`);
            return res.data;
        }
        catch (err) {
            throw Error(err);
        }
    }

    const getPreviousPage = async () => {
        setIsWaitGetBrandsStatus(true);
        const newCurrentPage = currentPage - 1;
        setAllBrandsInsideThePage((await getAllBrandsInsideThePage(newCurrentPage, pageSize, getFilteringString(filters))).data);
        setCurrentPage(newCurrentPage);
        setIsWaitGetBrandsStatus(false);
    }

    const getNextPage = async () => {
        setIsWaitGetBrandsStatus(true);
        const newCurrentPage = currentPage + 1;
        setAllBrandsInsideThePage((await getAllBrandsInsideThePage(newCurrentPage, pageSize, getFilteringString(filters))).data);
        setCurrentPage(newCurrentPage);
        setIsWaitGetBrandsStatus(false);
    }

    const getSpecificPage = async (pageNumber) => {
        setIsWaitGetBrandsStatus(true)
        setAllBrandsInsideThePage((await getAllBrandsInsideThePage(pageNumber, pageSize, getFilteringString(filters))).data);
        setCurrentPage(pageNumber);
        setIsWaitGetBrandsStatus(false);
    }

    const changeBrandData = (brandIndex, fieldName, newValue) => {
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
            setUpdatingBrandImageIndex(brandIndex);
            setFormValidationErrors(errorsObject);
            if (Object.keys(errorsObject).length == 0) {
                setIsWaitChangeBrandImage(true);
                let formData = new FormData();
                formData.append("brandImage", allBrandsInsideThePage[brandIndex].image);
                const res = await axios.put(`${process.env.BASE_API_URL}/brands/change-brand-image/${allBrandsInsideThePage[brandIndex]._id}`, formData, {
                    headers: {
                        Authorization: localStorage.getItem(process.env.adminTokenNameInLocalStorage),
                    }
                });
                const result = res.data;
                if (!result.error) {
                    setIsWaitChangeBrandImage(false);
                    setSuccessChangeBrandImageMsg("Change Image Successfull !!");
                    let successTimeout = setTimeout(async () => {
                        setSuccessChangeBrandImageMsg("");
                        setUpdatingBrandImageIndex(-1)
                        setAllBrandsInsideThePage((await getAllBrandsInsideThePage(1, pageSize)).data);
                        clearTimeout(successTimeout);
                    }, 1500);
                }
            }
        }
        catch (err) {
            if (err?.response?.data?.msg === "Unauthorized Error") {
                localStorage.removeItem(process.env.adminTokenNameInLocalStorage);
                await router.replace("/login");
                return;
            }
            setUpdatingBrandImageIndex(-1);
            setIsWaitChangeBrandImage(false);
            setErrorChangeBrandImageMsg("Sorry, Someting Went Wrong, Please Repeate The Process !!");
            let errorTimeout = setTimeout(() => {
                setErrorChangeBrandImageMsg("");
                clearTimeout(errorTimeout);
            }, 1500);
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
            setUpdatingBrandIndex(brandIndex);
            if (Object.keys(errorsObject).length == 0) {
                setIsWaitStatus(true);
                const res = await axios.put(`${process.env.BASE_API_URL}/brands/${allBrandsInsideThePage[brandIndex]._id}`, {
                    newBrandTitle: allBrandsInsideThePage[brandIndex].title,
                }, {
                    headers: {
                        Authorization: localStorage.getItem(process.env.adminTokenNameInLocalStorage),
                    }
                });
                const result = res.data;
                setIsWaitStatus(false);
                if (!result.error) {
                    setSuccessMsg("Updating Successfull !!");
                    let successTimeout = setTimeout(() => {
                        setSuccessMsg("");
                        setUpdatingBrandIndex(-1);
                        clearTimeout(successTimeout);
                    }, 1500);
                } else {
                    setUpdatingBrandIndex(-1);
                }
            }
        }
        catch (err) {
            if (err?.response?.data?.msg === "Unauthorized Error") {
                localStorage.removeItem(process.env.adminTokenNameInLocalStorage);
                await router.replace("/login");
                return;
            }
            setUpdatingBrandIndex(-1);
            setIsWaitStatus(false);
            setErrorMsg("Sorry, Someting Went Wrong, Please Repeate The Process !!");
            let errorTimeout = setTimeout(() => {
                setErrorMsg("");
                clearTimeout(errorTimeout);
            }, 1500);
        }
    }

    const deleteBrand = async (brandIndex) => {
        try {
            setIsWaitStatus(true);
            const res = await axios.delete(`${process.env.BASE_API_URL}/brands/${allBrandsInsideThePage[brandIndex]._id}`, {
                headers: {
                    Authorization: localStorage.getItem(process.env.adminTokenNameInLocalStorage),
                }
            });
            const result = res.data;
            setIsWaitStatus(false);
            setDeletingBrandIndex(brandIndex);
            if (!result.error) {
                setSuccessMsg("Deleting Successfull !!");
                let successTimeout = setTimeout(async () => {
                    setSuccessMsg("");
                    setDeletingBrandIndex(-1);
                    setAllBrandsInsideThePage(allBrandsInsideThePage.filter((brand) => brand._id !== allBrandsInsideThePage[brandIndex]._id))
                    clearTimeout(successTimeout);
                }, 1500);
            }
        }
        catch (err) {
            if (err?.response?.data?.msg === "Unauthorized Error") {
                localStorage.removeItem(process.env.adminTokenNameInLocalStorage);
                await router.replace("/login");
                return;
            }
            setIsWaitStatus(false);
            setErrorMsg("Sorry, Someting Went Wrong, Please Repeate The Process !!");
            let errorTimeout = setTimeout(() => {
                setErrorMsg("");
                clearTimeout(errorTimeout);
            }, 1500);
        }
    }

    return (
        <div className="update-and-delete-brands admin-dashboard">
            <Head>
                <title>Ubuyblues Store Admin Dashboard - Update / Delete Brands</title>
            </Head>
            {!isLoadingPage && !isErrorMsgOnLoadingThePage && <>
                <AdminPanelHeader isWebsiteOwner={adminInfo.isWebsiteOwner} isMerchant={adminInfo.isMerchant} />
                <div className="page-content d-flex justify-content-center align-items-center flex-column p-5">
                    <h1 className="fw-bold w-fit pb-2 mb-4">
                        <PiHandWavingThin className="me-2" />
                        Hi, Mr {adminInfo.firstName + " " + adminInfo.lastName} In Your Update / Delete Brands Page
                    </h1>
                    {allBrandsInsideThePage.length > 0 && !isWaitGetBrandsStatus && <section className="brands-box admin-dashbboard-data-box w-100">
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
                                                    className={`form-control d-block mx-auto p-2 border-2 brand-title-field ${formValidationErrors["title"] && brandIndex === updatingBrandIndex ? "border-danger mb-3" : "mb-4"}`}
                                                    onChange={(e) => changeBrandData(brandIndex, "title", e.target.value.trim())}
                                                ></input>
                                                {formValidationErrors["title"] && brandIndex === updatingBrandIndex && <p className="bg-danger p-2 form-field-error-box m-0 text-white">
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
                                                    className={`form-control d-block mx-auto p-2 border-2 brand-image-field ${formValidationErrors["image"] && brandIndex === updatingBrandImageIndex ? "border-danger mb-3" : "mb-4"}`}
                                                    onChange={(e) => changeBrandData(brandIndex, "image", e.target.files[0])}
                                                    accept=".png, .jpg, .webp"
                                                />
                                                {formValidationErrors["image"] && brandIndex === updatingBrandImageIndex && <p className="bg-danger p-2 form-field-error-box m-0 text-white">
                                                    <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                                    <span>{formValidationErrors["image"]}</span>
                                                </p>}
                                            </section>
                                            {(updatingBrandImageIndex !== brandIndex && deletingBrandIndex !== brandIndex) &&
                                                <button
                                                    className="btn btn-success d-block mb-3 w-50 mx-auto global-button"
                                                    onClick={() => changeBrandImage(brandIndex)}
                                                >Change</button>
                                            }
                                            {isWaitChangeBrandImage && updatingBrandImageIndex === brandIndex && <button
                                                className="btn btn-info d-block mb-3 mx-auto global-button"
                                            >Please Waiting</button>}
                                            {successChangeBrandImageMsg && updatingBrandImageIndex === brandIndex && <button
                                                className="btn btn-success d-block mx-auto global-button"
                                                disabled
                                            >{successChangeBrandImageMsg}</button>}
                                            {errorChangeBrandImageMsg && updatingBrandImageIndex === brandIndex && <button
                                                className="btn btn-danger d-block mx-auto global-button"
                                                disabled
                                            >{errorChangeBrandImageMsg}</button>}
                                        </td>
                                        <td className="update-cell">
                                            {(updatingBrandIndex !== brandIndex && deletingBrandIndex !== brandIndex) && <>
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
                                            {isWaitStatus && (updatingBrandIndex === brandIndex || deletingBrandIndex === brandIndex) && <button
                                                className="btn btn-info d-block mb-3 mx-auto global-button"
                                            >Please Waiting</button>}
                                            {successMsg && (updatingBrandIndex === brandIndex || deletingBrandIndex === brandIndex) && <button
                                                className="btn btn-success d-block mx-auto global-button"
                                                disabled
                                            >{successMsg}</button>}
                                            {errorMsg && (updatingBrandIndex === brandIndex || deletingBrandIndex === brandIndex) && <button
                                                className="btn btn-danger d-block mx-auto global-button"
                                                disabled
                                            >{errorMsg}</button>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>}
                    {allBrandsInsideThePage.length === 0 && !isWaitGetBrandsStatus && <p className="alert alert-danger w-100">Sorry, Can't Find Any Brands !!</p>}
                    {isWaitGetBrandsStatus && <div className="loader-table-box d-flex flex-column align-items-center justify-content-center">
                        <span className="loader-table-data"></span>
                    </div>}
                    {totalPagesCount > 1 && !isWaitGetBrandsStatus &&
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
            {isLoadingPage && !isErrorMsgOnLoadingThePage && <LoaderPage />}
            {isErrorMsgOnLoadingThePage && <ErrorOnLoadingThePage />}
        </div>
    );
}