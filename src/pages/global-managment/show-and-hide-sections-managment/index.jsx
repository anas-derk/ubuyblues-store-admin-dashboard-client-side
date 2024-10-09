import Head from "next/head";
import { PiHandWavingThin } from "react-icons/pi";
import { useState, useEffect } from "react";
import ErrorOnLoadingThePage from "@/components/ErrorOnLoadingThePage";
import LoaderPage from "@/components/LoaderPage";
import axios from "axios";
import AdminPanelHeader from "@/components/AdminPanelHeader";
import { useRouter } from "next/router";
import { getAdminInfo } from "../../../../public/global_functions/popular";

export default function ShowAndHideSections() {

    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const [errorMsgOnLoadingThePage, setErrorMsgOnLoadingThePage] = useState("");

    const [adminInfo, setAdminInfo] = useState({});

    const [allSections, setAllSections] = useState();

    const [waitMsg, setWaitMsg] = useState("");

    const [errorMsg, setErrorMsg] = useState("");

    const [successMsg, setSuccessMsg] = useState("");

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
                        setAdminInfo(adminDetails);
                        if (adminDetails.isWebsiteOwner) {
                            const res = await axios.get(`${process.env.BASE_API_URL}/appeared-sections/all-sections`);
                            result = res.data;
                            if(!result.error) {
                                setAllSections(result.data);
                            }
                            setIsLoadingPage(false);
                        } else {
                            await router.replace("/");
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

    const handleSelectAppearedSectionStatus = (sectionIndex, sectionStatus) => {
        allSections[sectionIndex].isAppeared = sectionStatus;
    }

    const changeSectionsStatus = async () => {
        try {
            setWaitMsg("Please Wait To Change Sections Status ...");
            const result = (await axios.put(`${process.env.BASE_API_URL}/appeared-sections/update-sections-status?language=${process.env.defaultLanguage}`, {
                sectionsStatus: allSections.map((section) => ({ _id: section._id, isAppeared: section.isAppeared })),
            }, {
                headers: {
                    Authorization: localStorage.getItem(process.env.adminTokenNameInLocalStorage),
                }
            })).data;
            setWaitMsg("");
            if (!result.error) {
                setSuccessMsg(result.msg);
                let successTimeout = setTimeout(() => {
                    setSuccessMsg("");
                    clearTimeout(successTimeout);
                }, 1500);
            }
            else {
                setErrorMsg(result.msg);
                let errorTimeout = setTimeout(() => {
                    setErrorMsg("");
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
                    clearTimeout(errorTimeout);
                }, 1500);
            }
        }
    }

    return (
        <div className="show-and-hide-sections admin-dashboard">
            <Head>
                <title>{process.env.storeName} Admin Dashboard - Show And Hide Sections</title>
            </Head>
            {!isLoadingPage && !errorMsgOnLoadingThePage && <>
                <AdminPanelHeader isWebsiteOwner={adminInfo.isWebsiteOwner} isMerchant={adminInfo.isMerchant} />
                <div className="page-content d-flex justify-content-center align-items-center flex-column p-5">
                    <h1 className="fw-bold w-fit pb-2 mb-3">
                        <PiHandWavingThin className="me-2" />
                        Hi, Mr {  adminInfo.firstName + " " + adminInfo.lastName } In Your Add Show And Hide Sections Page
                    </h1>
                    <div className="sections-box w-100">
                        {allSections.length > 0 ? <table className="sections-table mb-4 managment-table bg-white w-100">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Show Or Hide</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allSections.map((section, index) => (
                                    <tr key={section._id}>
                                        <td className="section-name-cell">
                                            {section.sectionName}
                                        </td>
                                        <td className="select-section-status-cell">
                                            <div className="form-check pb-2">
                                                <input
                                                    type="checkbox"
                                                    defaultChecked={section.isAppeared}
                                                    className="checkbox-input"
                                                    id={`checkbox${index + 1}`}
                                                    onChange={(e) => handleSelectAppearedSectionStatus(index, e.target.checked)}
                                                />
                                                <label className="form-check-label fw-bold" htmlFor={`checkbox${index + 1}`}>
                                                    Show / Hide
                                                </label>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                <tr>
                                    <td colSpan={2}>
                                        {!waitMsg && !errorMsg && !successMsg &&
                                            <button
                                                className="btn btn-success d-block mx-auto global-button"
                                                onClick={() => changeSectionsStatus()}
                                            >Change Sections Status</button>
                                        }
                                        {waitMsg && <button
                                            className="btn btn-warning d-block mx-auto global-button"
                                            disabled
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
                            </tbody>
                        </table> : <p className="alert alert-danger">Sorry, Can't Find Any Sections For Display Or Hide !!</p>}
                    </div>
                </div>
            </>}
            {isLoadingPage && !errorMsgOnLoadingThePage && <LoaderPage />}
            {errorMsgOnLoadingThePage && <ErrorOnLoadingThePage errorMsg={errorMsgOnLoadingThePage} />}
        </div>
    );
}