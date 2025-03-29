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
import {
    getAdminInfo,
    getAllProductsInsideThePage,
    getTimeAndDateByLocalTime,
    getDateInUTCFormat,
    getLanguagesInfoList,
    handleDisplayConfirmDeleteBox,
} from "../../../../public/global_functions/popular";
import Link from "next/link";
import NotFoundError from "@/components/NotFoundError";
import TableLoader from "@/components/TableLoader";
import FormFieldErrorBox from "@/components/FormFieldErrorBox";
import ConfirmDelete from "@/components/ConfirmDelete";

export default function UpdateAndDeleteProducts() {

    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const [errorMsgOnLoadingThePage, setErrorMsgOnLoadingThePage] = useState("");

    const [adminInfo, setAdminInfo] = useState({});

    const [allProductsInsideThePage, setAllProductsInsideThePage] = useState([]);

    const [isGetProducts, setIsGetProducts] = useState(false);

    const [waitMsg, setWaitMsg] = useState("");

    const [selectedProducImageIndex, setSelectedProducImageIndex] = useState(-1);

    const [selectedThreeDegreeProducImageIndex, setSelectedThreeDegreeProducImageIndex] = useState(-1);

    const [productImageType, setProductImageType] = useState("");

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
        category: "",
        name: ""
    });

    const [formValidationErrors, setFormValidationErrors] = useState({});

    const [isDisplayConfirmDeleteBox, setIsDisplayConfirmDeleteBox] = useState(false);

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
                            result = (await getAllProductsInsideThePage(1, pageSize, getFilteringString(tempFilters))).data;
                            setAllProductsInsideThePage(result.products);
                            setTotalPagesCount(Math.ceil(result.productsCount / pageSize));
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
                setIsGetProducts(false);
                setErrorMsgOnGetProductsData(err?.message === "Network Error" ? "Network Error When Get Products Data" : "Sorry, Someting Went Wrong When Get Products Data, Please Repeate The Process !!");
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
                setIsGetProducts(false);
                setErrorMsgOnGetProductsData(err?.message === "Network Error" ? "Network Error When Get Products Data" : "Sorry, Someting Went Wrong When Get Products Data, Please Repeate The Process !!");
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
                setIsGetProducts(false);
                setErrorMsgOnGetProductsData(err?.message === "Network Error" ? "Network Error When Get Products Data" : "Sorry, Someting Went Wrong When Get Products Data, Please Repeate The Process !!");
            }
        }
    }

    const getFilteringString = (filters) => {
        let filteringString = "";
        if (filters.category) filteringString += `category=${filters.category}&`;
        if (filters.storeId) filteringString += `storeId=${filters.storeId}&`;
        if (filters.name) filteringString += `name=${filters.name}&`;
        if (filteringString) filteringString = filteringString.substring(0, filteringString.length - 1);
        return filteringString;
    }

    const filterProducts = async (filters) => {
        try {
            setIsGetProducts(true);
            setCurrentPage(1);
            const result = (await getAllProductsInsideThePage(1, pageSize, getFilteringString(filters))).data;
            setAllProductsInsideThePage(result.products);
            setTotalPagesCount(Math.ceil(result.productsCount / pageSize));
            setIsGetProducts(false);
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

    const changeProductData = (productIndex, fieldName, newValue, language) => {
        setSelectedProductIndex(-1);
        setSelectedProducImageIndex(-1);
        setSelectedThreeDegreeProducImageIndex(-1);
        setProductImageType("");
        let tempNewValue = newValue;
        if (fieldName === "startDiscountPeriod" || fieldName === "endDiscountPeriod") {
            tempNewValue = getDateInUTCFormat(newValue);
        }
        let productsDataTemp = allProductsInsideThePage.map(product => product);
        if (language) {
            productsDataTemp[productIndex][fieldName][language] = tempNewValue;
        } else {
            productsDataTemp[productIndex][fieldName] = tempNewValue;
        }
        setAllProductsInsideThePage(productsDataTemp);
    }

    const getProductImage = (type, imagePath, productIndex, fieldName) => {
        return <>
            <h6 className="fw-bold border border-3 border-dark p-2 mb-3">{type.toUpperCase()} :</h6>
            {type === "primary" ? <img
                src={`${process.env.BASE_API_URL}/${imagePath}`}
                alt="Product Image !!"
                width="100"
                height="100"
                className="d-block mx-auto mb-4"
            /> : (imagePath ? <img
                src={`${process.env.BASE_API_URL}/${imagePath}`}
                alt="Product Image !!"
                width="100"
                height="100"
                className="d-block mx-auto mb-4"
            /> : <h6 className="fw-bold mb-3 bg-danger text-white p-2">Sorry Can't Find 3D Image</h6>)}
            <section className="product-image mb-4">
                <input
                    type="file"
                    className={`form-control d-block mx-auto p-2 border-2 product-image-field ${formValidationErrors[fieldName] && ((selectedProducImageIndex === productIndex) || (selectedThreeDegreeProducImageIndex === productIndex)) ? "border-danger mb-3" : "mb-4"}`}
                    onChange={(e) => changeProductData(productIndex, fieldName, e.target.files[0])}
                    accept=".png, .jpg, .webp"
                />
                {formValidationErrors[fieldName] && ((selectedProducImageIndex === productIndex) || (selectedThreeDegreeProducImageIndex === productIndex)) && <FormFieldErrorBox errorMsg={formValidationErrors[fieldName]} />}
            </section>
            {((selectedProducImageIndex !== productIndex && type === "primary") || (selectedThreeDegreeProducImageIndex !== productIndex && type === "three-degree")) && <button
                className="btn btn-success d-block mb-3 w-50 mx-auto global-button"
                onClick={() => updateProductImage(productIndex, type)}
            >Change</button>}
            {waitChangeProductImageMsg && ((selectedProducImageIndex === productIndex) || (selectedThreeDegreeProducImageIndex === productIndex)) && type === productImageType && <button
                className="btn btn-info d-block mb-3 mx-auto global-button"
            >{waitChangeProductImageMsg}</button>}
            {successChangeProductImageMsg && ((selectedProducImageIndex === productIndex) || (selectedThreeDegreeProducImageIndex === productIndex)) && type === productImageType && <button
                className="btn btn-success d-block mx-auto global-button"
                disabled
            >{successChangeProductImageMsg}</button>}
            {errorChangeProductImageMsg && ((selectedProducImageIndex === productIndex) || (selectedThreeDegreeProducImageIndex === productIndex)) && type === productImageType && <button
                className="btn btn-danger d-block mx-auto global-button"
                disabled
            >{errorChangeProductImageMsg}</button>}
        </>
    }

    const updateProductImage = async (productIndex, type) => {
        try {
            setFormValidationErrors({});
            const errorsObject = inputValuesValidation([
                type === "primary" ? {
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
                } : {
                    name: "threeDImage",
                    value: allProductsInsideThePage[productIndex].threeDImage,
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
            if (type === "primary") {
                setSelectedProducImageIndex(productIndex);
                setSelectedThreeDegreeProducImageIndex(-1);
            } else {
                setSelectedProducImageIndex(-1);
                setSelectedThreeDegreeProducImageIndex(productIndex);
            }
            setProductImageType(type);
            setFormValidationErrors(errorsObject);
            if (Object.keys(errorsObject).length == 0) {
                setWaitChangeProductImageMsg(`Please Waiting Change ${type === "primary" ? "" : "3D"} Image ...`);
                let formData = new FormData();
                formData.append("productImage", type === "primary" ? allProductsInsideThePage[productIndex].image : allProductsInsideThePage[productIndex].threeDImage);
                const result = (await axios.put(`${process.env.BASE_API_URL}/products/update-product-image/${allProductsInsideThePage[productIndex]._id}?type=${type}&language=${process.env.defaultLanguage}`, formData, {
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
                        if (type === "primary") {
                            setSelectedProducImageIndex(-1);
                            setSelectedThreeDegreeProducImageIndex(-1);
                        } else {
                            setSelectedProducImageIndex(-1);
                            setSelectedThreeDegreeProducImageIndex(-1);
                        }
                        setProductImageType("");
                        clearTimeout(successTimeout);
                    }, 1500);
                } else {
                    setErrorChangeProductImageMsg("Sorry, Someting Went Wrong, Please Repeate The Process !!");
                    let errorTimeout = setTimeout(() => {
                        setErrorChangeProductImageMsg("");
                        if (type === "primary") {
                            setSelectedProducImageIndex(-1);
                            setSelectedThreeDegreeProducImageIndex(-1);
                        } else {
                            setSelectedProducImageIndex(-1);
                            setSelectedThreeDegreeProducImageIndex(-1);
                        }
                        setProductImageType("");
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
                    if (type === "primary") {
                        setSelectedProducImageIndex(-1);
                        setSelectedThreeDegreeProducImageIndex(-1);
                    } else {
                        setSelectedProducImageIndex(-1);
                        setSelectedThreeDegreeProducImageIndex(-1);
                    }
                    setProductImageType("");
                    clearTimeout(errorTimeout);
                }, 1500);
            }
        }
    }

    const updateProductData = async (productIndex) => {
        try {
            setFormValidationErrors({});
            const errorsObject = inputValuesValidation([
                ...["ar", "en", "de", "tr"].map((language) => ({
                    name: `nameIn${language.toUpperCase()}`,
                    value: allProductsInsideThePage[productIndex].name[language],
                    rules: {
                        isRequired: {
                            msg: "Sorry, This Field Can't Be Empty !!",
                        },
                    },
                })),
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
                ...["ar", "en", "de", "tr"].map((language) => ({
                    name: `descriptionIn${language.toUpperCase()}`,
                    value: allProductsInsideThePage[productIndex].description[language],
                    rules: {
                        isRequired: {
                            msg: "Sorry, This Field Can't Be Empty !!",
                        },
                    },
                })),
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
                    quantity: Number(allProductsInsideThePage[productIndex].quantity),
                    description: allProductsInsideThePage[productIndex].description,
                    discount: Number(allProductsInsideThePage[productIndex].discount),
                    startDiscountPeriod: allProductsInsideThePage[productIndex].startDiscountPeriod,
                    endDiscountPeriod: allProductsInsideThePage[productIndex].endDiscountPeriod,
                    discountInOfferPeriod: Number(allProductsInsideThePage[productIndex].discountInOfferPeriod),
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
                    setAllProductsInsideThePage(allProductsInsideThePage.filter((product, index) => index !== productIndex));
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
                {isDisplayConfirmDeleteBox && <ConfirmDelete
                    name="Product"
                    setIsDisplayConfirmDeleteBox={setIsDisplayConfirmDeleteBox}
                    handleDeleteFunc={() => deleteProduct(selectedProductIndex)}
                    setSelectedElementIndex={setSelectedProductIndex}
                    waitMsg={waitMsg}
                    errorMsg={errorMsg}
                    successMsg={successMsg}
                />}
                <div className="page-content d-flex justify-content-center align-items-center flex-column p-4">
                    <h1 className="fw-bold w-fit pb-2 mb-4">
                        <PiHandWavingThin className="me-2" />
                        Hi, Mr {adminInfo.firstName + " " + adminInfo.lastName} In Your Update / Delete Products Page
                    </h1>
                    <section className="filters mb-3 bg-white border-3 border-info p-3 text-start w-100">
                        <h5 className="section-name fw-bold text-center">Filters: </h5>
                        <hr />
                        <div className="row mb-4">
                            <div className="col-md-6">
                                <h6 className="me-2 fw-bold text-center">Category</h6>
                                <input
                                    type="text"
                                    className={`form-control p-2 border-2 category-name-field ${formValidationErrors["categoryName"] ? "border-danger mb-3" : ""}`}
                                    placeholder="Please Enter Category Name"
                                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                                />
                                {formValidationErrors["categoryName"] && <FormFieldErrorBox errorMsg={formValidationErrors["categoryName"]} />}
                            </div>
                            <div className="col-md-6">
                                <h6 className="me-2 fw-bold text-center">Name</h6>
                                <input
                                    type="text"
                                    className={`form-control p-2 border-2 product-name-field ${formValidationErrors["productName"] ? "border-danger mb-3" : ""}`}
                                    placeholder="Please Enter Product Name"
                                    onChange={(e) => setFilters({ ...filters, name: e.target.value })}
                                />
                                {formValidationErrors["productName"] && <FormFieldErrorBox errorMsg={formValidationErrors["productName"]} />}
                            </div>
                        </div>
                        {!isGetProducts && <button
                            className="btn btn-success d-block w-25 mx-auto mt-2 global-button"
                            onClick={async () => await filterProducts(filters)}
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
                                                {getLanguagesInfoList("name").map((el) => (
                                                    <div key={el.fullLanguageName}>
                                                        <h6 className="fw-bold">In {el.fullLanguageName} :</h6>
                                                        <input
                                                            type="text"
                                                            placeholder={`Enter New Product Name In ${el.fullLanguageName}`}
                                                            className={`form-control d-block mx-auto p-2 border-2 product-name-field ${formValidationErrors[el.formField] && productIndex === selectedProductIndex ? "border-danger mb-3" : "mb-4"}`}
                                                            defaultValue={product.name[el.internationalLanguageCode]}
                                                            onChange={(e) => changeProductData(productIndex, "name", e.target.value.trim(), el.internationalLanguageCode)}
                                                        />
                                                        {formValidationErrors[el.formField] && productIndex === selectedProductIndex && <FormFieldErrorBox errorMsg={formValidationErrors[el.formField]} />}
                                                    </div>
                                                ))}
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
                                                />
                                                {formValidationErrors["price"] && productIndex === selectedProductIndex && <FormFieldErrorBox errorMsg={formValidationErrors["price"]} />}
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
                                                />
                                                {formValidationErrors["quantity"] && productIndex === selectedProductIndex && <FormFieldErrorBox errorMsg={formValidationErrors["quantity"]} />}
                                            </section>
                                        </td>
                                        <td className="product-description-cell" width="400">
                                            <section className="product-description mb-4">
                                                {getLanguagesInfoList("description").map((el) => (
                                                    <div key={el.fullLanguageName}>
                                                        <h6 className="fw-bold">In {el.fullLanguageName} :</h6>
                                                        <textarea
                                                            type="text"
                                                            placeholder={`Enter New Product Description In ${el.fullLanguageName}`}
                                                            className={`form-control d-block mx-auto p-2 border-2 product-description-field ${formValidationErrors[el.formField] && productIndex === selectedProductIndex ? "border-danger mb-3" : "mb-4"}`}
                                                            defaultValue={product.description[el.internationalLanguageCode]}
                                                            onChange={(e) => changeProductData(productIndex, "description", e.target.value.trim(), el.internationalLanguageCode)}
                                                        />
                                                        {formValidationErrors[el.formField] && productIndex === selectedProductIndex && <FormFieldErrorBox errorMsg={formValidationErrors[el.formField]} />}
                                                    </div>
                                                ))}
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
                                                />
                                                {formValidationErrors["discount"] && productIndex === selectedProductIndex && <FormFieldErrorBox errorMsg={formValidationErrors["discount"]} />}
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
                                                        />
                                                        {formValidationErrors["discountInOfferPeriod"] && productIndex === selectedProductIndex && <FormFieldErrorBox errorMsg={formValidationErrors["discountInOfferPeriod"]} />}
                                                    </section>
                                                    <section className="offer-description">
                                                        <input
                                                            type="text"
                                                            placeholder="Enter New Offer Description"
                                                            defaultValue={product.offerDescription}
                                                            className={`form-control d-block mx-auto p-2 border-2 offer-description-field ${formValidationErrors["name"] && productIndex === selectedProductIndex ? "border-danger mb-3" : "mb-2"}`}
                                                            onChange={(e) => changeProductData(productIndex, "offerDescription", e.target.value.trim())}
                                                        />
                                                        {formValidationErrors["offerDescription"] && productIndex === selectedProductIndex && <FormFieldErrorBox errorMsg={formValidationErrors["offerDescription"]} />}
                                                    </section>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="product-images-cell">
                                            {getProductImage("primary", product.imagePath, productIndex, "image")}
                                            <hr />
                                            {getProductImage("three-degree", product.threeDImagePath, productIndex, "threeDImage")}
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
                                                    onClick={() => handleDisplayConfirmDeleteBox(productIndex, setSelectedProductIndex, setIsDisplayConfirmDeleteBox)}
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