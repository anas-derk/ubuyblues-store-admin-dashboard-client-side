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
import { HiOutlineBellAlert } from "react-icons/hi2";
import {
    getAdminInfo,
    getProductsCount,
    getAllProductsInsideThePage,
    getTimeAndDateByLocalTime,
    getDateInUTCFormat,
    getAllCategoriesWithHierarechy
} from "../../../../public/global_functions/popular";
import Link from "next/link";
import NotFoundError from "@/components/NotFoundError";
import TableLoader from "@/components/TableLoader";

export default function UpdateAndDeleteProducts() {

    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const [errorMsgOnLoadingThePage, setErrorMsgOnLoadingThePage] = useState("");

    const [adminInfo, setAdminInfo] = useState({});

    const [allProductsInsideThePage, setAllProductsInsideThePage] = useState([]);

    const [isGetProducts, setIsGetProducts] = useState(false);

    const [allCategories, setAllCategories] = useState([]);

    const [waitMsg, setWaitMsg] = useState("");

    const [selectedProducImageIndex, setSelectedProducImageIndex] = useState(-1);

    const [selectedProductIndex, setSelectedProductIndex] = useState(-1);

    const [waitChangeProductImageMsg, setWaitChangeProductImageMsg] = useState(false);

    const [errorMsg, setErrorMsg] = useState("");

    const [errorChangeProductImageMsg, setErrorChangeProductImageMsg] = useState("");

    const [errorMsgOnGetProductsData, setErrorMsgOnGetProductsData] = useState("");

    const [successMsg, setSuccessMsg] = useState("");

    const [successChangeProductImageMsg, setSuccessChangeProductImageMsg] = useState("");

    const [currentPage, setCurrentPage] = useState(1);

    const [totalPagesCount, setTotalPagesCount] = useState(0);

    const [filters, setFilters] = useState({
        storeId: "",
        categoryId: "",
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
                            setAllCategories((await getAllCategoriesWithHierarechy(getFilteringString(tempFilters))).data);
                            result = await getProductsCount(getFilteringString(tempFilters));
                            if (result.data > 0) {
                                setAllProductsInsideThePage((await getAllProductsInsideThePage(1, pageSize, getFilteringString(tempFilters))).data.products);
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

    const getPreviousPage = async () => {
        try {
            setIsGetProducts(true);
            setErrorMsgOnGetProductsData("");
            const newCurrentPage = currentPage - 1;
            setAllProductsInsideThePage((await getAllProductsInsideThePage(newCurrentPage, pageSize, getFilteringString(filters))).data.products);
            setCurrentPage(newCurrentPage);
            setIsGetProducts(false);
        }
        catch (err) {
            if (err?.response?.status === 401) {
                localStorage.removeItem(process.env.adminTokenNameInLocalStorage);
                await router.replace("/login");
            }
            else {
                setErrorMsgOnGetProductsData(err?.message === "Network Error" ? "Network Error When Get Brands Data" : "Sorry, Someting Went Wrong When Get Brands Data, Please Repeate The Process !!");
            }
        }
    }

    const getNextPage = async () => {
        try {
            setIsGetProducts(true);
            setErrorMsgOnGetProductsData("");
            const newCurrentPage = currentPage + 1;
            setAllProductsInsideThePage((await getAllProductsInsideThePage(newCurrentPage, pageSize, getFilteringString(filters))).data.products);
            setCurrentPage(newCurrentPage);
            setIsGetProducts(false);
        }
        catch (err) {
            if (err?.response?.status === 401) {
                localStorage.removeItem(process.env.adminTokenNameInLocalStorage);
                await router.replace("/login");
            }
            else {
                setErrorMsgOnGetProductsData(err?.message === "Network Error" ? "Network Error When Get Brands Data" : "Sorry, Someting Went Wrong When Get Brands Data, Please Repeate The Process !!");
            }
        }
    }

    const getSpecificPage = async (pageNumber) => {
        try {
            setIsGetProducts(true);
            setErrorMsgOnGetProductsData("");
            setAllProductsInsideThePage((await getAllProductsInsideThePage(pageNumber, pageSize, getFilteringString(filters))).data.products);
            setCurrentPage(pageNumber);
            setIsGetProducts(false);
        }
        catch (err) {
            if (err?.response?.status === 401) {
                localStorage.removeItem(process.env.adminTokenNameInLocalStorage);
                await router.replace("/login");
            }
            else {
                setErrorMsgOnGetProductsData(err?.message === "Network Error" ? "Network Error When Get Brands Data" : "Sorry, Someting Went Wrong When Get Brands Data, Please Repeate The Process !!");
            }
        }
    }

    const getFilteringString = (filters) => {
        let filteringString = "";
        if (filters.categoryId) filteringString += `categoryId=${filters.categoryId}&`;
        if (filters.storeId) filteringString += `storeId=${filters.storeId}&`;
        if (filteringString) filteringString = filteringString.substring(0, filteringString.length - 1);
        return filteringString;
    }

    const filterProductsByCategory = async () => {
        try {
            setIsGetProducts(true);
            setCurrentPage(1);
            let filteringString = getFilteringString(filters);
            const result = await getProductsCount(filteringString);
            if (result.data > 0) {
                setAllProductsInsideThePage((await getAllProductsInsideThePage(1, pageSize, filteringString)).data.products);
                setTotalPagesCount(Math.ceil(result.data / pageSize));
                setIsGetProducts(false);
            } else {
                setAllProductsInsideThePage([]);
                setTotalPagesCount(0);
                setIsGetProducts(false);
            }
        }
        catch (err) {
            if (err?.response?.status === 401) {
                localStorage.removeItem(process.env.adminTokenNameInLocalStorage);
                await router.replace("/login");
            }
            else {
                setIsGetProducts(false);
                setCurrentPage(-1);
                setWaitMsg("");
                setErrorMsg(err?.message === "Network Error" ? "Network Error" : "Sorry, Someting Went Wrong, Please Repeate The Process !!");
                let errorTimeout = setTimeout(() => {
                    setErrorMsg("");
                    clearTimeout(errorTimeout);
                }, 1500);
            }
        }
    }

    const changeProductData = (productIndex, fieldName, newValue) => {
        setSelectedProductIndex(-1);
        let tempNewValue = newValue;
        if (fieldName === "startDiscountPeriod" || fieldName === "endDiscountPeriod") {
            tempNewValue = getDateInUTCFormat(newValue);
        }
        let productsDataTemp = allProductsInsideThePage.map(product => product);
        productsDataTemp[productIndex][fieldName] = tempNewValue;
        setAllProductsInsideThePage(productsDataTemp);
    }

    const updateProductImage = async (productIndex) => {
        try {
            setFormValidationErrors({});
            const errorsObject = inputValuesValidation([
                {
                    name: "image",
                    value: allProductsInsideThePage[productIndex].image,
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
            setSelectedProducImageIndex(productIndex);
            if (Object.keys(errorsObject).length == 0) {
                setWaitChangeProductImageMsg("Please Waiting Change Image ...");
                let formData = new FormData();
                formData.append("productImage", allProductsInsideThePage[productIndex].image);
                const result = (await axios.put(`${process.env.BASE_API_URL}/products/update-product-image/${allProductsInsideThePage[productIndex]._id}?language=${process.env.defaultLanguage}`, formData, {
                    headers: {
                        Authorization: localStorage.getItem(process.env.adminTokenNameInLocalStorage),
                    }
                })).data;
                setWaitChangeProductImageMsg("");
                if (!result.error) {
                    setSuccessChangeProductImageMsg("Change Image Successfull !!");
                    let successTimeout = setTimeout(async () => {
                        setSuccessChangeProductImageMsg("");
                        setAllProductsInsideThePage((await getAllProductsInsideThePage(currentPage, pageSize, getFilteringString(filters))).data.products);
                        setSelectedProducImageIndex(-1);
                        clearTimeout(successTimeout);
                    }, 1500);
                } else {
                    setErrorChangeProductImageMsg("Sorry, Someting Went Wrong, Please Repeate The Process !!");
                    let errorTimeout = setTimeout(() => {
                        setErrorChangeProductImageMsg("");
                        setSelectedProducImageIndex(-1);
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
                setWaitChangeProductImageMsg("");
                setErrorChangeProductImageMsg(err?.message === "Network Error" ? "Network Error" : "Sorry, Someting Went Wrong, Please Repeate The Process !!");
                let errorTimeout = setTimeout(() => {
                    setErrorChangeProductImageMsg("");
                    setSelectedProducImageIndex(-1);
                    clearTimeout(errorTimeout);
                }, 1500);
            }
        }
    }

    const updateProductData = async (productIndex) => {
        try {
            setFormValidationErrors({});
            const errorsObject = inputValuesValidation([
                {
                    name: "name",
                    value: allProductsInsideThePage[productIndex].name,
                    rules: {
                        isRequired: {
                            msg: "Sorry, This Field Can't Be Empty !!",
                        },
                    },
                },
                {
                    name: "price",
                    value: allProductsInsideThePage[productIndex].price,
                    rules: {
                        isRequired: {
                            msg: "Sorry, This Field Can't Be Empty !!",
                        },
                    },
                },
                {
                    name: "quantity",
                    value: allProductsInsideThePage[productIndex].quantity,
                    rules: {
                        isRequired: {
                            msg: "Sorry, This Field Can't Be Empty !!",
                        },
                        minNumber: {
                            value: 0,
                            msg: "Sorry, Min Number Is: 0 !!",
                        },
                    },
                },
                {
                    name: "description",
                    value: allProductsInsideThePage[productIndex].description,
                    rules: {
                        isRequired: {
                            msg: "Sorry, This Field Can't Be Empty !!",
                        },
                    },
                },
                {
                    name: "discount",
                    value: allProductsInsideThePage[productIndex].discount,
                    rules: {
                        isRequired: {
                            msg: "Sorry, This Field Can't Be Empty !!",
                        },
                        minNumber: {
                            value: 0,
                            msg: "Sorry, Min Number Is: 0 !!",
                        },
                        maxNumber: {
                            value: allProductsInsideThePage[productIndex].price * 0.99,
                            msg: `Sorry, Max Number Is: ${allProductsInsideThePage[productIndex].price * 0.99} !!`,
                        },
                    },
                },
                {
                    name: "discountInOfferPeriod",
                    value: allProductsInsideThePage[productIndex].discountInOfferPeriod,
                    rules: {
                        isRequired: {
                            msg: "Sorry, This Field Can't Be Empty !!",
                        },
                        minNumber: {
                            value: 0,
                            msg: "Sorry, Min Number Is: 0 !!",
                        },
                        maxNumber: {
                            value: allProductsInsideThePage[productIndex].price * 0.99,
                            msg: `Sorry, Max Number Is: ${allProductsInsideThePage[productIndex].price * 0.99} !!`,
                        },
                    },
                },
            ]);
            setFormValidationErrors(errorsObject);
            setSelectedProductIndex(productIndex);
            if (Object.keys(errorsObject).length == 0) {
                setWaitMsg("Please Wait To Updating ...");
                const result = (await axios.put(`${process.env.BASE_API_URL}/products/${allProductsInsideThePage[productIndex]._id}?language=${process.env.defaultLanguage}`, {
                    name: allProductsInsideThePage[productIndex].name,
                    price: allProductsInsideThePage[productIndex].price,
                    quantity: allProductsInsideThePage[productIndex].quantity,
                    description: allProductsInsideThePage[productIndex].description,
                    discount: allProductsInsideThePage[productIndex].discount,
                    startDiscountPeriod: allProductsInsideThePage[productIndex].startDiscountPeriod,
                    endDiscountPeriod: allProductsInsideThePage[productIndex].endDiscountPeriod,
                    discountInOfferPeriod: allProductsInsideThePage[productIndex].discountInOfferPeriod,
                    offerDescription: allProductsInsideThePage[productIndex].offerDescription,
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
                        setSelectedProductIndex(-1);
                        clearTimeout(successTimeout);
                    }, 1500);
                } else {
                    setErrorMsg("Sorry, Someting Went Wrong, Please Repeate The Process !!");
                    let errorTimeout = setTimeout(() => {
                        setErrorMsg("");
                        setSelectedProductIndex(-1);
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
                    setSelectedProductIndex(-1);
                    clearTimeout(errorTimeout);
                }, 1500);
            }
        }
    }

    const deleteProduct = async (productIndex) => {
        try {
            setWaitMsg("Please Wait To Deleting ...");
            setSelectedProductIndex(productIndex);
            const result = (await axios.delete(`${process.env.BASE_API_URL}/products/${allProductsInsideThePage[productIndex]._id}?language=${process.env.defaultLanguage}`, {
                headers: {
                    Authorization: localStorage.getItem(process.env.adminTokenNameInLocalStorage),
                }
            })).data;
            setWaitMsg("");
            if (!result.error) {
                setSuccessMsg("Deleting Successfull !!");
                let successTimeout = setTimeout(async () => {
                    setSuccessMsg("");
                    setSelectedProductIndex(-1);
                    setIsGetProducts(true);
                    const result = await getProductsCount(getFilteringString(filters));
                    if (result.data > 0) {
                        setAllProductsInsideThePage((await getAllProductsInsideThePage(currentPage, pageSize, getFilteringString(filters))).data);
                        setTotalPagesCount(Math.ceil(result.data / pageSize));
                    } else {
                        setAllProductsInsideThePage([]);
                        setTotalPagesCount(0);
                    }
                    setIsGetProducts(false);
                    clearTimeout(successTimeout);
                }, 1500);
            } else {
                setErrorMsg("Sorry, Someting Went Wrong, Please Repeate The Process !!");
                let errorTimeout = setTimeout(() => {
                    setErrorMsg("");
                    setSelectedProductIndex(-1);
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
                    setSelectedProductIndex(-1);
                    clearTimeout(errorTimeout);
                }, 1500);
            }
        }
    }

    return (
        <div className="update-and-delete-products admin-dashboard">
            <Head>
                <title>{process.env.storeName} Admin Dashboard - Update / Delete Products</title>
            </Head>
            {!isLoadingPage && !errorMsgOnLoadingThePage && <>
                <AdminPanelHeader isWebsiteOwner={adminInfo.isWebsiteOwner} isMerchant={adminInfo.isMerchant} />
                <div className="page-content d-flex justify-content-center align-items-center flex-column p-4">
                    <h1 className="fw-bold w-fit pb-2 mb-4">
                        <PiHandWavingThin className="me-2" />
                        Hi, Mr {adminInfo.firstName + " " + adminInfo.lastName} In Your Update / Delete Products Page
                    </h1>
                    <section className="filters mb-3 bg-white border-3 border-info p-3 text-start w-100">
                        <h5 className="section-name fw-bold text-center">Filters: </h5>
                        <hr />
                        <div className="row mb-4">
                            <div className="col-md-12">
                                <h6 className="me-2 fw-bold text-center">Category</h6>
                                <select
                                    className="select-product-category form-select"
                                    onChange={(e) => setFilters({ ...filters, categoryId: e.target.value })}
                                >
                                    <option value="" hidden>Pleae Select Category</option>
                                    <option value="">All</option>
                                    {allCategories.map((category) => (
                                        <option value={category._id} key={category._id}>{category.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        {!isGetProducts && <button
                            className="btn btn-success d-block w-25 mx-auto mt-2 global-button"
                            onClick={async () => await filterProductsByCategory()}
                        >
                            Filter
                        </button>}
                        {isGetProducts && <button
                            className="btn btn-success d-block w-25 mx-auto mt-2 global-button"
                            disabled
                        >
                            Filtering ...
                        </button>}
                    </section>
                    {allProductsInsideThePage.length > 0 && !isGetProducts && <div className="products-box admin-dashbboard-data-box w-100 pe-4">
                        <table className="products-table mb-4 managment-table admin-dashbboard-data-table bg-white">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Price</th>
                                    <th>Quantity</th>
                                    <th>Description</th>
                                    <th>Discount</th>
                                    <th>Image</th>
                                    <th>Processes</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allProductsInsideThePage.map((product, productIndex) => (
                                    <tr key={product._id}>
                                        <td className="product-name-cell">
                                            <section className="product-name mb-4">
                                                <input
                                                    type="text"
                                                    placeholder="Enter New Product Name"
                                                    defaultValue={product.name}
                                                    className={`form-control d-block mx-auto p-2 border-2 product-name-field ${formValidationErrors["name"] && productIndex === selectedProductIndex ? "border-danger mb-3" : "mb-4"}`}
                                                    onChange={(e) => changeProductData(productIndex, "name", e.target.value.trim())}
                                                ></input>
                                                {formValidationErrors["name"] && productIndex === selectedProductIndex && <p className="bg-danger p-2 form-field-error-box m-0 text-white">
                                                    <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                                    <span>{formValidationErrors["name"]}</span>
                                                </p>}
                                            </section>
                                        </td>
                                        <td className="product-price-cell">
                                            <section className="product-price mb-4">
                                                <input
                                                    type="text"
                                                    placeholder="Enter New Product Price"
                                                    defaultValue={product.price}
                                                    className={`form-control d-block mx-auto p-2 border-2 product-price-field ${formValidationErrors["price"] && productIndex === selectedProductIndex ? "border-danger mb-3" : "mb-4"}`}
                                                    onChange={(e) => changeProductData(productIndex, "price", e.target.value)}
                                                ></input>
                                                {formValidationErrors["price"] && productIndex === selectedProductIndex && <p className="bg-danger p-2 form-field-error-box m-0 text-white">
                                                    <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                                    <span>{formValidationErrors["price"]}</span>
                                                </p>}
                                            </section>
                                        </td>
                                        <td className="product-quantity-cell">
                                            <section className="product-quantity mb-4">
                                                <h6 className="bg-info p-2 fw-bold">{product.quantity}</h6>
                                                <hr />
                                                <input
                                                    type="text"
                                                    placeholder="Enter New Product Quantity"
                                                    defaultValue={product.quantity}
                                                    className={`form-control d-block mx-auto p-2 border-2 product-quantity-field ${formValidationErrors["quantity"] && productIndex === selectedProductIndex ? "border-danger mb-3" : "mb-4"}`}
                                                    onChange={(e) => changeProductData(productIndex, "quantity", e.target.value)}
                                                ></input>
                                                {formValidationErrors["quantity"] && productIndex === selectedProductIndex && <p className="bg-danger p-2 form-field-error-box m-0 text-white">
                                                    <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                                    <span>{formValidationErrors["quantity"]}</span>
                                                </p>}
                                            </section>
                                        </td>
                                        <td className="product-description-cell" width="400">
                                            <section className="product-description mb-4">
                                                <textarea
                                                    placeholder="Enter New Product Description"
                                                    defaultValue={product.description}
                                                    className={`form-control d-block mx-auto p-2 border-2 product-description-field ${formValidationErrors["description"] && productIndex === selectedProductIndex ? "border-danger mb-3" : "mb-4"}`}
                                                    onChange={(e) => changeProductData(productIndex, "description", e.target.value.trim())}
                                                ></textarea>
                                                {formValidationErrors["description"] && productIndex === selectedProductIndex && <p className="bg-danger p-2 form-field-error-box m-0 text-white">
                                                    <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                                    <span>{formValidationErrors["description"]}</span>
                                                </p>}
                                            </section>
                                        </td>
                                        <td className="product-price-discount-cell">
                                            <section className="product-price-discount mb-4">
                                                <input
                                                    type="text"
                                                    placeholder="Enter New Discount Price"
                                                    defaultValue={product.discount}
                                                    className={`form-control d-block mx-auto p-2 border-2 product-price-discount ${formValidationErrors["discount"] && productIndex === selectedProductIndex ? "border-danger mb-3" : "mb-4"}`}
                                                    onChange={(e) => changeProductData(productIndex, "discount", e.target.value)}
                                                ></input>
                                                {formValidationErrors["discount"] && productIndex === selectedProductIndex && <p className="bg-danger p-2 form-field-error-box m-0 text-white">
                                                    <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                                    <span>{formValidationErrors["discount"]}</span>
                                                </p>}
                                            </section>
                                            <div className="limited-period-box border border-2 p-3 border-dark">
                                                <div className="period-box">
                                                    <h6 className="fw-bold">Start Period</h6>
                                                    <input
                                                        type="datetime-local"
                                                        className="form-control mb-4 border border-dark"
                                                        onChange={(e) => changeProductData(productIndex, "startDiscountPeriod", e.target.value)}
                                                        defaultValue={product.startDiscountPeriod ? getTimeAndDateByLocalTime(product.startDiscountPeriod) : null}
                                                    />
                                                    <h6 className="fw-bold">End Period</h6>
                                                    <input
                                                        type="datetime-local"
                                                        className="form-control mb-4 border border-dark"
                                                        onChange={(e) => changeProductData(productIndex, "endDiscountPeriod", e.target.value)}
                                                        defaultValue={product.endDiscountPeriod ? getTimeAndDateByLocalTime(product.endDiscountPeriod) : null}
                                                    />
                                                    <section className="product-price-discount-in-offer-period mb-4">
                                                        <input
                                                            type="text"
                                                            placeholder="Enter New Discount Price"
                                                            defaultValue={product.discountInOfferPeriod}
                                                            className={`form-control d-block mx-auto p-2 border-2 product-price-discount-in-offer-period-field ${formValidationErrors["discount"] && productIndex === selectedProductIndex ? "border-danger mb-3" : "mb-2"}`}
                                                            onChange={(e) => changeProductData(productIndex, "discountInOfferPeriod", e.target.value)}
                                                        ></input>
                                                        {formValidationErrors["discountInOfferPeriod"] && productIndex === selectedProductIndex && <p className="bg-danger p-2 form-field-error-box m-0 text-white">
                                                            <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                                            <span>{formValidationErrors["discountInOfferPeriod"]}</span>
                                                        </p>}
                                                    </section>
                                                    <section className="offer-description">
                                                        <input
                                                            type="text"
                                                            placeholder="Enter New Offer Description"
                                                            defaultValue={product.offerDescription}
                                                            className={`form-control d-block mx-auto p-2 border-2 offer-description-field ${formValidationErrors["name"] && productIndex === selectedProductIndex ? "border-danger mb-3" : "mb-2"}`}
                                                            onChange={(e) => changeProductData(productIndex, "offerDescription", e.target.value.trim())}
                                                        ></input>
                                                        {formValidationErrors["offerDescription"] && productIndex === selectedProductIndex && <p className="bg-danger p-2 form-field-error-box m-0 text-white">
                                                            <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                                            <span>{formValidationErrors["offerDescription"]}</span>
                                                        </p>}
                                                    </section>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="product-image-cell">
                                            <img
                                                src={`${process.env.BASE_API_URL}/${product.imagePath}`}
                                                alt="Product Image !!"
                                                width="100"
                                                height="100"
                                                className="d-block mx-auto mb-4"
                                            />
                                            <section className="product-image mb-4">
                                                <input
                                                    type="file"
                                                    className={`form-control d-block mx-auto p-2 border-2 brand-image-field ${formValidationErrors["image"] && productIndex === selectedProducImageIndex ? "border-danger mb-3" : "mb-4"}`}
                                                    onChange={(e) => changeProductData(productIndex, "image", e.target.files[0])}
                                                    accept=".png, .jpg, .webp"
                                                />
                                                {formValidationErrors["image"] && productIndex === selectedProducImageIndex && <p className="bg-danger p-2 form-field-error-box m-0 text-white">
                                                    <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                                    <span>{formValidationErrors["image"]}</span>
                                                </p>}
                                            </section>
                                            {(selectedProducImageIndex !== productIndex && selectedProductIndex !== productIndex) &&
                                                <button
                                                    className="btn btn-success d-block mb-3 w-50 mx-auto global-button"
                                                    onClick={() => updateProductImage(productIndex)}
                                                >Change</button>
                                            }
                                            {waitChangeProductImageMsg && selectedProducImageIndex === productIndex && <button
                                                className="btn btn-info d-block mb-3 mx-auto global-button"
                                            >{waitChangeProductImageMsg}</button>}
                                            {successChangeProductImageMsg && selectedProducImageIndex === productIndex && <button
                                                className="btn btn-success d-block mx-auto global-button"
                                                disabled
                                            >{successChangeProductImageMsg}</button>}
                                            {errorChangeProductImageMsg && selectedProducImageIndex === productIndex && <button
                                                className="btn btn-danger d-block mx-auto global-button"
                                                disabled
                                            >{errorChangeProductImageMsg}</button>}
                                        </td>
                                        <td className="update-cell">
                                            {selectedProductIndex !== productIndex && <>
                                                <Link href={`/products-managment/update-and-delete-gallery-images/${product._id}`}
                                                    className="btn btn-success d-block mb-3 mx-auto global-button"
                                                >Show Gallery</Link>
                                                <Link href={`/products-managment/add-new-gallery-images/${product._id}`}
                                                    className="btn btn-success d-block mb-3 mx-auto global-button"
                                                >Add New Image To Gallery</Link>
                                                <Link href={`/products-managment/update-and-delete-product-categories/${product._id}`}
                                                    className="btn btn-success d-block mb-3 mx-auto global-button"
                                                >Show Categories</Link>
                                                <Link href={`/products-managment/update-and-delete-product-countries/${product._id}`}
                                                    className="btn btn-success d-block mb-3 mx-auto global-button"
                                                >Show Countries</Link>
                                                <hr />
                                                <button
                                                    className="btn btn-success d-block mb-3 mx-auto global-button"
                                                    onClick={() => updateProductData(productIndex)}
                                                >Update</button>
                                                <hr />
                                                <button
                                                    className="btn btn-danger global-button"
                                                    onClick={() => deleteProduct(productIndex)}
                                                >Delete</button>
                                            </>}
                                            {waitMsg && selectedProductIndex === productIndex && <button
                                                className="btn btn-info d-block mb-3 mx-auto global-button"
                                                disabled
                                            >{waitMsg}</button>}
                                            {successMsg && selectedProductIndex === productIndex && <button
                                                className="btn btn-success d-block mx-auto global-button"
                                                disabled
                                            >{successMsg}</button>}
                                            {errorMsg && selectedProductIndex === productIndex && <button
                                                className="btn btn-danger d-block mx-auto global-button"
                                                disabled
                                            >{errorMsg}</button>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>}
                    {allProductsInsideThePage.length === 0 && !isGetProducts && <NotFoundError errorMsg="Sorry, Can't Find Any Products !!" />}
                    {isGetProducts && <TableLoader />}
                    {errorMsgOnGetProductsData && <NotFoundError errorMsg={errorMsgOnGetProductsData} />}
                    {totalPagesCount > 1 && !isGetProducts &&
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