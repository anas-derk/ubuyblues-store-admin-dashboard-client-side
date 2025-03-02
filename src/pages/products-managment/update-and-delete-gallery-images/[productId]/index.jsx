import Head from "next/head";
import { PiHandWavingThin } from "react-icons/pi";
import { useEffect, useState } from "react";
import axios from "axios";
import LoaderPage from "@/components/LoaderPage";
import ErrorOnLoadingThePage from "@/components/ErrorOnLoadingThePage";
import AdminPanelHeader from "@/components/AdminPanelHeader";
import { useRouter } from "next/router";
import { inputValuesValidation } from "../../../../../public/global_functions/validations";
import { getAdminInfo } from "../../../../../public/global_functions/popular";
import NotFoundError from "@/components/NotFoundError";

export default function UpdateAndDeleteGalleryImages({ productIdAsProperty }) {

    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const [errorMsgOnLoadingThePage, setErrorMsgOnLoadingThePage] = useState("");

    const [adminInfo, setAdminInfo] = useState({});

    const [allGalleryImages, setAllGalleryImages] = useState([]);

    const [newProductGalleryImageFiles, setNewProductGalleryImageFiles] = useState([]);

    const [selectedGalleryImageIndex, setSelectedGalleryImageIndex] = useState(-1);

    const [waitMsg, setWaitMsg] = useState("");

    const [errorMsg, setErrorMsg] = useState("");

    const [successMsg, setSuccessMsg] = useState("");

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
                            setAllGalleryImages((await getAllGalleryImages()).data);
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

    const getAllGalleryImages = async () => {
        try {
            return (await axios.get(`${process.env.BASE_API_URL}/products/all-gallery-images/${productIdAsProperty}?language=${process.env.defaultLanguage}`, {
                headers: {
                    Authorization: localStorage.getItem(process.env.adminTokenNameInLocalStorage)
                }
            })).data;
        }
        catch (err) {
            throw err;
        }
    }

    const changeGalleryImage = (imageIndex, newValue) => {
        setSelectedGalleryImageIndex(-1);
        let productsGalleryImagesTemp = newProductGalleryImageFiles;
        productsGalleryImagesTemp[imageIndex] = newValue;
        setNewProductGalleryImageFiles(productsGalleryImagesTemp);
    }

    const updateGalleryImage = async (imageIndex) => {
        try {
            setFormValidationErrors({});
            const errorsObject = inputValuesValidation([
                {
                    name: "galleryImage",
                    value: newProductGalleryImageFiles[imageIndex],
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
            setSelectedGalleryImageIndex(imageIndex);
            if (Object.keys(errorsObject).length == 0) {
                setWaitMsg("Please Wait To Updating ...");
                let formData = new FormData();
                formData.append("productGalleryImage", newProductGalleryImageFiles[imageIndex]);
                const result = (await axios.put(`${process.env.BASE_API_URL}/products/update-product-gallery-image/${productIdAsProperty}?oldGalleryImagePath=${allGalleryImages[imageIndex]}&language=${process.env.defaultLanguage}`, formData, {
                    headers: {
                        Authorization: localStorage.getItem(process.env.adminTokenNameInLocalStorage),
                    }
                })).data;
                setWaitMsg("");
                if (!result.error) {
                    setSuccessMsg("Change Image Successfull !!");
                    let successTimeout = setTimeout(async () => {
                        setSuccessMsg("");
                        setSelectedGalleryImageIndex(-1);
                        allGalleryImages[imageIndex] = result.data;
                        clearTimeout(successTimeout);
                    }, 1500);
                } else {
                    setErrorMsg("Sorry, Someting Went Wrong When Updating, Please Repeate The Process !!");
                    let errorTimeout = setTimeout(() => {
                        setErrorMsg("");
                        setSelectedGalleryImageIndex(-1);
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
                    setSelectedGalleryImageIndex(-1);
                    clearTimeout(errorTimeout);
                }, 1500);
            }
        }
    }

    const deleteImageFromGallery = async (imageIndex) => {
        try {
            setWaitMsg("Please Wait To Deleting ...");
            setSelectedGalleryImageIndex(imageIndex);
            const result = (await axios.delete(`${process.env.BASE_API_URL}/products/gallery-images/${productIdAsProperty}?galleryImagePath=${allGalleryImages[imageIndex]}&language=${process.env.defaultLanguage}`, {
                headers: {
                    Authorization: localStorage.getItem(process.env.adminTokenNameInLocalStorage),
                }
            })).data;
            setWaitMsg("");
            if (!result.error) {
                setSuccessMsg("Deleting Successfull !!");
                let successTimeout = setTimeout(async () => {
                    setSuccessMsg("");
                    setSelectedGalleryImageIndex(-1);
                    setAllGalleryImages(allGalleryImages.filter((image) => image !== allGalleryImages[imageIndex]));
                    clearTimeout(successTimeout);
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
                    setSelectedGalleryImageIndex(-1);
                    clearTimeout(errorTimeout);
                }, 1500);
            }
        }
    }

    return (
        <div className="update-and-delete-product-gallery-images admin-dashboard">
            <Head>
                <title>{process.env.storeName} Admin Dashboard - Update / Delete Product Gallery Images</title>
            </Head>
            {!isLoadingPage && !errorMsgOnLoadingThePage && <>
                <AdminPanelHeader isWebsiteOwner={adminInfo.isWebsiteOwner} isMerchant={adminInfo.isMerchant} />
                <div className="page-content d-flex justify-content-center align-items-center flex-column p-5">
                    <h1 className="fw-bold w-fit pb-2 mb-4">
                        <PiHandWavingThin className="me-2" />
                        Hi, Mr {adminInfo.firstName + " " + adminInfo.lastName} In Your Update / Delete Product Gallery Images Page
                    </h1>
                    {allGalleryImages.length > 0 && <section className="gallery-images-box admin-dashbboard-data-box w-100">
                        <table className="gallery-images-table mb-4 managment-table bg-white admin-dashbboard-data-table">
                            <thead>
                                <tr>
                                    <th>Image</th>
                                    <th>Change Image</th>
                                    <th>Delete Image</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allGalleryImages.map((imagePath, imageIndex) => (
                                    <tr key={imageIndex}>
                                        <td className="gallery-image-cell">
                                            <img
                                                src={`${process.env.BASE_API_URL}/${imagePath}`}
                                                alt="Gallery Image !!"
                                                width="100"
                                                height="100"
                                                className="d-block mx-auto mb-4"
                                            />
                                        </td>
                                        <td className="update-gallery-image-cell">
                                            <section className="gallery-image mb-4">
                                                <input
                                                    type="file"
                                                    className={`form-control d-block mx-auto p-2 border-2 brand-image-field ${formValidationErrors["galleryImage"] && imageIndex === selectedGalleryImageIndex ? "border-danger mb-3" : "mb-4"}`}
                                                    onChange={(e) => changeGalleryImage(imageIndex, e.target.files[0])}
                                                    accept=".png, .jpg, .webp"
                                                />
                                                {formValidationErrors["galleryImage"] && <FormFieldErrorBox errorMsg={formValidationErrors["galleryImage"]} />}
                                            </section>
                                            {selectedGalleryImageIndex !== imageIndex && <button
                                                className="btn btn-success d-block mb-3 mx-auto global-button"
                                                onClick={() => updateGalleryImage(imageIndex)}
                                            >Change Image</button>}
                                            {waitMsg === "Please Wait To Updating ..." && selectedGalleryImageIndex === imageIndex && <button
                                                className="btn btn-info d-block mb-3 mx-auto global-button"
                                                disabled
                                            >{waitMsg}</button>}
                                            {successMsg === "Change Image Successfull !!" && selectedGalleryImageIndex === imageIndex && <button
                                                className="btn btn-success d-block mx-auto global-button"
                                                disabled
                                            >{successMsg}</button>}
                                            {errorMsg === "Sorry, Someting Went Wrong When Updating, Please Repeate The Process !!" && selectedGalleryImageIndex === imageIndex && <button
                                                className="btn btn-danger d-block mx-auto global-button"
                                                disabled
                                            >{errorMsg}</button>}
                                        </td>
                                        <td className="delete-gallery-image-cell">
                                            {(selectedGalleryImageIndex !== imageIndex || formValidationErrors["galleryImage"]) && <button
                                                className="btn btn-danger global-button"
                                                onClick={() => deleteImageFromGallery(imageIndex)}
                                            >Delete</button>}
                                            {waitMsg === "Please Wait To Deleting ..." && selectedGalleryImageIndex === imageIndex && <button
                                                className="btn btn-info d-block mb-3 mx-auto global-button"
                                                disabled
                                            >{waitMsg}</button>}
                                            {successMsg === "Deleting Successfull !!" && selectedGalleryImageIndex === imageIndex && <button
                                                className="btn btn-success d-block mx-auto global-button"
                                                disabled
                                            >{successMsg}</button>}
                                            {errorMsg === "Sorry, Someting Went Wrong When Deleting, Please Repeate The Process !!" && selectedGalleryImageIndex === imageIndex && <button
                                                className="btn btn-danger d-block mx-auto global-button"
                                                disabled
                                            >{errorMsg}</button>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>}
                    {allGalleryImages.length === 0 && <NotFoundError errorMsg="Sorry, Can't Find Any Gallery Images For This Product !!" />}
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