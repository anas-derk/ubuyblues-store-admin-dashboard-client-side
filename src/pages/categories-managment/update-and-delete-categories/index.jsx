import Head from "next/head";
import { PiHandWavingThin } from "react-icons/pi";
import { useEffect, useState } from "react";
import axios from "axios";
import LoaderPage from "@/components/LoaderPage";
import ErrorOnLoadingThePage from "@/components/ErrorOnLoadingThePage";
import AdminPanelHeader from "@/components/AdminPanelHeader";
import { useRouter } from "next/router";
import PaginationBar from "@/components/PaginationBar";
import { inputValuesValidation } from "../../../../public/global_functions/validations";
import { getAdminInfo, getCategoriesCount, getAllCategoriesInsideThePage } from "../../../../public/global_functions/popular";
import { HiOutlineBellAlert } from "react-icons/hi2";
import NotFoundError from "@/components/NotFoundError";
import TableLoader from "@/components/TableLoader";

export default function UpdateAndDeleteCategories() {

    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const [errorMsgOnLoadingThePage, setErrorMsgOnLoadingThePage] = useState("");

    const [adminInfo, setAdminInfo] = useState({});

    const [isGetCategories, setIsGetCategories] = useState(false);

    const [allCategoriesInsideThePage, setAllCategoriesInsideThePage] = useState([]);

    const [waitMsg, setWaitMsg] = useState("");

    const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(-1);

    const [errorMsg, setErrorMsg] = useState("");

    const [successMsg, setSuccessMsg] = useState("");

    const [errorMsgOnGetCategoriesData, setErrorMsgOnGetCategoriesData] = useState("");

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
                            const filtersAsQuery = getFiltersAsQuery(tempFilters);
                            result = await getCategoriesCount(filtersAsQuery);
                            if (result.data > 0) {
                                setAllCategoriesInsideThePage((await getAllCategoriesInsideThePage(1, pageSize, filtersAsQuery)).data);
                                setTotalPagesCount(Math.ceil(result.data / pageSize));
                            }
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

    const getPreviousPage = async () => {
        try {
            setIsGetCategories(true);
            setErrorMsgOnGetCategoriesData("");
            const newCurrentPage = currentPage - 1;
            setAllCategoriesInsideThePage((await getAllCategoriesInsideThePage(newCurrentPage, pageSize)).data);
            setCurrentPage(newCurrentPage);
            setIsGetCategories(false);
        }
        catch (err) {
            if (err?.response?.status === 401) {
                localStorage.removeItem(process.env.adminTokenNameInLocalStorage);
                await router.replace("/login");
            }
            else {
                setErrorMsgOnGetCategoriesData(err?.message === "Network Error" ? "Network Error When Get Brands Data" : "Sorry, Someting Went Wrong When Get Brands Data, Please Repeate The Process !!");
            }
        }
    }

    const getNextPage = async () => {
        try {
            setIsGetCategories(true);
            setErrorMsgOnGetCategoriesData("");
            const newCurrentPage = currentPage + 1;
            setAllCategoriesInsideThePage((await getAllCategoriesInsideThePage(newCurrentPage, pageSize)).data);
            setCurrentPage(newCurrentPage);
            setIsGetCategories(false);
        }
        catch (err) {
            if (err?.response?.status === 401) {
                localStorage.removeItem(process.env.adminTokenNameInLocalStorage);
                await router.replace("/login");
            }
            else {
                setErrorMsgOnGetCategoriesData(err?.message === "Network Error" ? "Network Error When Get Brands Data" : "Sorry, Someting Went Wrong When Get Brands Data, Please Repeate The Process !!");
            }
        }
    }

    const getSpecificPage = async (pageNumber) => {
        try {
            setIsGetCategories(true);
            setErrorMsgOnGetCategoriesData("");
            setAllCategoriesInsideThePage((await getAllCategoriesInsideThePage(pageNumber, pageSize)).data);
            setCurrentPage(pageNumber);
            setIsGetCategories(false);
        }
        catch (err) {
            if (err?.response?.status === 401) {
                localStorage.removeItem(process.env.adminTokenNameInLocalStorage);
                await router.replace("/login");
            }
            else {
                setErrorMsgOnGetCategoriesData(err?.message === "Network Error" ? "Network Error When Get Brands Data" : "Sorry, Someting Went Wrong When Get Brands Data, Please Repeate The Process !!");
            }
        }
    }

    const changeCategoryName = (categoryIndex, newValue) => {
        setSelectedCategoryIndex(-1);
        let categoriesTemp = allCategoriesInsideThePage;
        categoriesTemp[categoryIndex].name = newValue;
        setAllCategoriesInsideThePage(categoriesTemp);
    }

    const updateCategory = async (categoryIndex) => {
        try {
            setFormValidationErrors({});
            const errorsObject = inputValuesValidation([
                {
                    name: "categoryName",
                    value: allCategoriesInsideThePage[categoryIndex].name,
                    rules: {
                        isRequired: {
                            msg: "Sorry, This Field Can't Be Empty !!",
                        },
                    },
                },
            ]);
            setFormValidationErrors(errorsObject);
            setSelectedCategoryIndex(categoryIndex);
            if (Object.keys(errorsObject).length == 0) {
                setWaitMsg("Please Wait To Updating ...");
                const result = (await axios.put(`${process.env.BASE_API_URL}/categories/${allCategoriesInsideThePage[categoryIndex]._id}`, {
                    newCategoryName: allCategoriesInsideThePage[categoryIndex].name,
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
                        setSelectedCategoryIndex(-1);
                        clearTimeout(successTimeout);
                    }, 1500);
                } else {
                    setErrorMsg("Sorry, Someting Went Wrong, Please Repeate The Process !!");
                    let errorTimeout = setTimeout(() => {
                        setErrorMsg("");
                        setSelectedCategoryIndex(-1);
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

    const deleteCategory = async (categoryIndex) => {
        try {
            setWaitMsg("Please Wait To Deleting ...");
            setSelectedCategoryIndex(categoryIndex);
            const result = (await axios.delete(`${process.env.BASE_API_URL}/categories/${allCategoriesInsideThePage[categoryIndex]._id}`, {
                headers: {
                    Authorization: localStorage.getItem(process.env.adminTokenNameInLocalStorage),
                }
            })).data;
            setWaitMsg("");
            if (!result.error) {
                setSuccessMsg("Deleting Successfull !!");
                let successTimeout = setTimeout(async () => {
                    setSuccessMsg("");
                    setSelectedCategoryIndex(-1);
                    setAllCategoriesInsideThePage(allCategoriesInsideThePage.filter((category, index) => index !== categoryIndex));
                    clearTimeout(successTimeout);
                }, 1500);
            } else {
                setErrorMsg("Sorry, Someting Went Wrong, Please Repeate The Process !!");
                let errorTimeout = setTimeout(() => {
                    setErrorMsg("");
                    setSelectedCategoryIndex(-1);
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
                    setSelectedCategoryIndex(-1);
                    clearTimeout(errorTimeout);
                }, 1500);
            }
        }
    }

    return (
        <div className="update-and-delete-categories admin-dashboard">
            <Head>
                <title>{process.env.storeName} Admin Dashboard - Update / Delete Categories</title>
            </Head>
            {!isLoadingPage && !errorMsgOnLoadingThePage && <>
                <AdminPanelHeader isWebsiteOwner={adminInfo.isWebsiteOwner} isMerchant={adminInfo.isMerchant} />
                <div className="page-content d-flex justify-content-center align-items-center flex-column p-5">
                    <h1 className="fw-bold w-fit pb-2 mb-4">
                        <PiHandWavingThin className="me-2" />
                        Hi, Mr {adminInfo.firstName + " " + adminInfo.lastName} In Your Update / Delete Categories Page
                    </h1>
                    {allCategoriesInsideThePage.length > 0 && !isGetCategories && <section className="categories-box w-100">
                        <table className="users-table mb-4 managment-table bg-white w-100">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Process</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allCategoriesInsideThePage.map((category, categoryIndex) => (
                                    <tr key={category._id}>
                                        <td className="category-name-cell">
                                            <section className="category-name mb-4">
                                                <input
                                                    type="text"
                                                    className={`form-control d-block mx-auto p-2 border-2 brand-title-field ${formValidationErrors["categoryName"] && categoryIndex === selectedCategoryIndex ? "border-danger mb-3" : "mb-4"}`}
                                                    defaultValue={category.name}
                                                    onChange={(e) => changeCategoryName(categoryIndex, e.target.value.trim())}
                                                ></input>
                                                {formValidationErrors["categoryName"] && categoryIndex === selectedCategoryIndex && <p className="bg-danger p-2 form-field-error-box m-0 text-white">
                                                    <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                                    <span>{formValidationErrors["categoryName"]}</span>
                                                </p>}
                                            </section>
                                        </td>
                                        <td className="update-cell">
                                            {selectedCategoryIndex !== categoryIndex && <>
                                                <button
                                                    className="btn btn-success d-block mb-3 mx-auto global-button"
                                                    onClick={() => updateCategory(categoryIndex)}
                                                >Update</button>
                                                <hr />
                                                <button
                                                    className="btn btn-danger global-button"
                                                    onClick={() => deleteCategory(categoryIndex)}
                                                >Delete</button>
                                            </>}
                                            {waitMsg && selectedCategoryIndex === categoryIndex && <button
                                                className="btn btn-info d-block mb-3 mx-auto global-button"
                                                disabled
                                            >{waitMsg}</button>}
                                            {successMsg && selectedCategoryIndex === categoryIndex && <button
                                                className="btn btn-success d-block mx-auto global-button"
                                                disabled
                                            >{successMsg}</button>}
                                            {errorMsg && selectedCategoryIndex === categoryIndex && <button
                                                className="btn btn-danger d-block mx-auto global-button"
                                                disabled
                                            >{errorMsg}</button>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>}
                    {allCategoriesInsideThePage.length === 0 && !isGetCategories && <NotFoundError errorMsg="Sorry, Can't Find Any Categories !!" />}
                    {isGetCategories && <TableLoader />}
                    {errorMsgOnGetCategoriesData && <NotFoundError errorMsg={errorMsgOnGetCategoriesData} />}
                    {totalPagesCount > 1 && !isGetCategories &&
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