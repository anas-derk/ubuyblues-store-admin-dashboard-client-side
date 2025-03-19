import Head from "next/head";
import { PiHandWavingThin } from "react-icons/pi";
import { useEffect, useState } from "react";
import axios from "axios";
import LoaderPage from "@/components/LoaderPage";
import ErrorOnLoadingThePage from "@/components/ErrorOnLoadingThePage";
import AdminPanelHeader from "@/components/AdminPanelHeader";
import { getAdminInfo, getAllCategoriesInsideThePage, getProductInfo } from "../../../../../public/global_functions/popular";
import { useRouter } from "next/router";
import { HiOutlineBellAlert } from "react-icons/hi2";
import { inputValuesValidation } from "../../../../../public/global_functions/validations";
import { IoIosCloseCircleOutline } from "react-icons/io";
import FormFieldErrorBox from "@/components/FormFieldErrorBox";

export default function UpdateProductCategories({ productIdAsProperty }) {

    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const [errorMsgOnLoadingThePage, setErrorMsgOnLoadingThePage] = useState("");

    const [adminInfo, setAdminInfo] = useState({});

    const [searchedCategoryName, setSearchedCategoryName] = useState("");

    const [searchedCategories, setSearchedCategories] = useState([]);

    const [productData, setProductData] = useState({});

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
                        } else {
                            setAdminInfo(adminDetails);
                            const tempFilters = { ...filters, storeId: adminDetails.storeId };
                            setFilters(tempFilters);
                            result = (await getProductInfo(productIdAsProperty)).data.productDetails;
                            setProductData(result);
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

    const updateProductCategories = async (e) => {
        try {
            e.preventDefault();
            setFormValidationErrors({});
            const errorsObject = inputValuesValidation([
                {
                    name: "categories",
                    value: productData.categories,
                    rules: {
                        isRequired: {
                            msg: "Sorry, This Field Can't Be Empty !!",
                        },
                    },
                },
            ]);
            setFormValidationErrors(errorsObject);
            if (Object.keys(errorsObject).length == 0) {
                setWaitMsg("Please Wait To Updating ...");
                const result = (await axios.put(`${process.env.BASE_API_URL}/products/${productData._id}?language=${process.env.defaultLanguage}`, {
                    categories: productData.categories.map(category => category._id),
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
                        clearTimeout(successTimeout);
                    }, 1500);
                } else {
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

    const handleGetCategoriesByName = async (e) => {
        try {
            setWaitMsg("Please Waiting To Get Categories ...");
            const searchedCategoryName = e.target.value;
            setSearchedCategoryName(searchedCategoryName);
            if (searchedCategoryName) {
                setSearchedCategories((await getAllCategoriesInsideThePage(1, 1000, `storeId=${adminInfo.storeId}&name=${searchedCategoryName}`)).data.categories);
            } else {
                setSearchedCategories([]);
            }
            setWaitMsg("");
        }
        catch (err) {
            setWaitMsg("");
            setErrorMsg(err?.message === "Network Error" ? "Network Error On Search !!" : "Sorry, Someting Went Wrong, Please Repeate The Search !!");
            let errorTimeout = setTimeout(() => {
                setErrorMsg("");
                clearTimeout(errorTimeout);
            }, 1500);
        }
    }

    const handleSelectCategory = (selectedCategory) => {
        if ((productData.categories.filter((category) => category._id !== selectedCategory._id)).length === productData.categories.length) {
            setSearchedCategories(searchedCategories.filter((category) => category._id !== selectedCategory._id));
            setProductData({ ...productData, categories: [...productData.categories, selectedCategory] })
        }
    }

    const handleRemoveCategoryFromSelectedCategoriesList = (category) => {
        setProductData({ ...productData, categories: productData.categories.filter((selectedCategory) => category._id !== selectedCategory._id) });
        if (searchedCategoryName) setSearchedCategories([...searchedCategories, category]);
    }

    return (
        <div className="update-product-categories admin-dashboard">
            <Head>
                <title>{process.env.storeName} Admin Dashboard - Update Product Categories</title>
            </Head>
            {!isLoadingPage && !errorMsgOnLoadingThePage && <>
                <AdminPanelHeader isWebsiteOwner={adminInfo.isWebsiteOwner} isMerchant={adminInfo.isMerchant} />
                <div className="page-content d-flex justify-content-center align-items-center flex-column pt-5 pb-5 p-4">
                    <h1 className="fw-bold w-fit pb-2 mb-3">
                        <PiHandWavingThin className="me-2" />
                        Hi, Mr {adminInfo.firstName + " " + adminInfo.lastName} In Your Update Product Categories Page
                    </h1>
                    <form className="update-product-categories-form admin-dashbboard-form" onSubmit={updateProductCategories}>
                        <section className="category mb-4 overflow-auto">
                            <h6 className="mb-3 fw-bold">Please Select Categories</h6>
                            <div className="select-categories-box select-box">
                                <input
                                    type="text"
                                    className="search-box form-control p-2 border-2 mb-4"
                                    placeholder="Please Enter Category Name Or Part Of This"
                                    onChange={handleGetCategoriesByName}
                                />
                                <ul className={`categories-list options-list bg-white border ${formValidationErrors["categories"] ? "border-danger mb-4" : "border-dark"}`}>
                                    <li className="text-center fw-bold border-bottom border-2 border-dark">Seached Categories List</li>
                                    {searchedCategories.length > 0 && searchedCategories.map((category) => (
                                        <li key={category._id} onClick={() => handleSelectCategory(category)}>{category.name["en"]}</li>
                                    ))}
                                </ul>
                                {searchedCategories.length === 0 && searchedCategoryName && <p className="alert alert-danger mt-4">Sorry, Can't Find Any Related Categories Match This Name !!</p>}
                                {formValidationErrors["categories"] && <FormFieldErrorBox errorMsg={formValidationErrors["categories"]} />}
                            </div>
                        </section>
                        {productData.categories.length > 0 ? <div className="selected-categories row mb-4">
                            {productData.categories.map((category) => <div className="col-md-4 mb-3" key={category._id}>
                                <div className="selected-category-box bg-white p-2 border border-2 border-dark text-center">
                                    <span className="me-2 category-name">{category.name["en"]}</span>
                                    <IoIosCloseCircleOutline className="remove-icon" onClick={() => handleRemoveCategoryFromSelectedCategoriesList(category)} />
                                </div>
                            </div>)}
                        </div> : <p className="bg-danger p-2 m-0 text-white mb-4">
                            <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                            <span>Sorry, Can't Find Any Categories Added To The Selected Categories List !!</span>
                        </p>}
                        {!waitMsg && !successMsg && !errorMsg && <button
                            type="submit"
                            className="btn btn-success w-50 d-block mx-auto p-2 global-button"
                        >
                            Update Now
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

export async function getServerSideProps({ params }) {
    const { productId } = params;
    if (!productId) {
        return {
            redirect: {
                permanent: false,
                destination: "/products-managment/update-and-delete-products",
            },
        }
    } else {
        return {
            props: {
                productIdAsProperty: productId,
            },
        }
    }
}