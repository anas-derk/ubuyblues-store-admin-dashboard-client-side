import Head from "next/head";
import { PiHandWavingThin } from "react-icons/pi";
import { useEffect, useState } from "react";
import axios from "axios";
import LoaderPage from "@/components/LoaderPage";
import ErrorOnLoadingThePage from "@/components/ErrorOnLoadingThePage";
import AdminPanelHeader from "@/components/AdminPanelHeader";
import { getAdminInfo, getProductInfo } from "../../../../../public/global_functions/popular";
import { useRouter } from "next/router";
import { HiOutlineBellAlert } from "react-icons/hi2";
import { inputValuesValidation } from "../../../../../public/global_functions/validations";
import { countries } from "countries-list";
import { IoIosCloseCircleOutline } from "react-icons/io";

export default function UpdateProductCountries({ productIdAsProperty }) {

    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const [errorMsgOnLoadingThePage, setErrorMsgOnLoadingThePage] = useState("");

    const [adminInfo, setAdminInfo] = useState({});

    const [productData, setProductData] = useState({});

    const [waitMsg, setWaitMsg] = useState("");

    const [errorMsg, setErrorMsg] = useState("");

    const [successMsg, setSuccessMsg] = useState("");

    const [filters, setFilters] = useState({
        storeId: "",
    });

    const [formValidationErrors, setFormValidationErrors] = useState({});

    const allCountries = Object.keys(countries)

    const [countryList, setCountryList] = useState(allCountries);

    const [filteredCountryList, setFilteredCountryList] = useState(allCountries);

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
                            setProductData((await getProductInfo(productIdAsProperty)).data.productDetails);
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

    const updateProductCountries = async (e) => {
        try {
            e.preventDefault();
            setFormValidationErrors({});
            const errorsObject = inputValuesValidation([
                {
                    name: "countries",
                    value: productData.countries,
                    rules: {
                        isRequired: {
                            msg: "Sorry, Can't Find Any Countries Added To The Selected Countries List !!",
                        },
                    },
                },
            ]);
            setFormValidationErrors(errorsObject);
            if (Object.keys(errorsObject).length == 0) {
                setWaitMsg("Please Wait To Updating ...");
                const result = (await axios.put(`${process.env.BASE_API_URL}/products/${productData._id}?language=${process.env.defaultLanguage}`, {
                    countries: productData.countries,
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

    const handleSearchOfCountry = (e) => {
        const searchedCountry = e.target.value;
        if (searchedCountry) {
            setFilteredCountryList(filteredCountryList.filter((country) => countries[country].name.toLowerCase().startsWith(searchedCountry.toLowerCase())));
        } else {
            setFilteredCountryList(countryList);
        }
    }

    const handleSelectCountry = (countryCode) => {
        setCountryList(countryList.filter((country) => country !== countryCode));
        setFilteredCountryList(filteredCountryList.filter((country) => country !== countryCode));
        setProductData((data) => {
            return { ...data, countries: [...productData.countries, countryCode] };
        });
    }

    const handleRemoveCountryFromCountryList = (countryCode) => {
        setCountryList([...countryList, countryCode]);
        setFilteredCountryList([...filteredCountryList, countryCode]);
        setProductData((data) => {
            return { ...data, countries: productData.countries.filter((country) => country !== countryCode) };
        });
    }

    return (
        <div className="update-product-countries admin-dashboard">
            <Head>
                <title>{process.env.storeName} Admin Dashboard - Update Product Countries</title>
            </Head>
            {!isLoadingPage && !errorMsgOnLoadingThePage && <>
                <AdminPanelHeader isWebsiteOwner={adminInfo.isWebsiteOwner} isMerchant={adminInfo.isMerchant} />
                <div className="page-content d-flex justify-content-center align-items-center flex-column pt-5 pb-5 p-4">
                    <h1 className="fw-bold w-fit pb-2 mb-3">
                        <PiHandWavingThin className="me-2" />
                        Hi, Mr {adminInfo.firstName + " " + adminInfo.lastName} In Your Update Product Countries Page
                    </h1>
                    <form className="update-product-categories-form admin-dashbboard-form" onSubmit={updateProductCountries}>
                        <h6 className="mb-3 fw-bold">Please Select Countries</h6>
                        <div className="select-country-box select-box mb-4">
                            <input
                                type="text"
                                className="search-box form-control p-2 border-2 mb-4"
                                placeholder="Please Enter Your Country Name Or Part Of This"
                                onChange={handleSearchOfCountry}
                            />
                            <ul className="countries-list options-list bg-white border border-dark">
                                {filteredCountryList.length > 0 ? filteredCountryList.map((countryCode) => (
                                    <li key={countryCode} onClick={() => handleSelectCountry(countryCode)}>{countries[countryCode].name}</li>
                                )) : <li>Sorry, Can't Find Any Counties Match This Name !!</li>}
                            </ul>
                        </div>
                        {productData.countries.length > 0 && <div className="selected-countries row mb-4">
                            {productData.countries.map((countryCode) => <div className="col-md-4 mb-3" key={countryCode}>
                                <div className="selected-country-box bg-white p-2 border border-2 border-dark text-center">
                                    <span className="me-2 country-name">{countries[countryCode].name}</span>
                                    <IoIosCloseCircleOutline className="remove-icon" onClick={() => handleRemoveCountryFromCountryList(countryCode)} />
                                </div>
                            </div>)}
                        </div>}
                        {formValidationErrors["countries"] && <p className="bg-danger p-2 form-field-error-box mb-4 text-white">
                            <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                            <span>{formValidationErrors["countries"]}</span>
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