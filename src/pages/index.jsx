import Head from "next/head";
import { PiHandWavingThin } from "react-icons/pi";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import LoaderPage from "@/components/LoaderPage";
import ErrorOnLoadingThePage from "@/components/ErrorOnLoadingThePage";
import AdminPanelHeader from "@/components/AdminPanelHeader";
import { getAdminInfo } from "../../public/global_functions/popular";

export default function Home() {

    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const [isErrorMsgOnLoadingThePage, setIsErrorMsgOnLoadingThePage] = useState(false);

    const [adminInfo, setAdminInfo] = useState({});

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
                        setAdminInfo(result.data);
                        setIsLoadingPage(false);
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

    return (
        <div className="main admin-dashboard">
            <Head>
                <title>Ubuyblues Store - Admin Dashboard</title>
            </Head>
            {!isLoadingPage && !isErrorMsgOnLoadingThePage && <>
                <AdminPanelHeader isWebsiteOwner={adminInfo.isWebsiteOwner} isMerchant={adminInfo.isMerchant} />
                <div className="page-content d-flex justify-content-center align-items-center">
                    <h1 className="fw-bold w-fit pb-2 text-center">
                        <PiHandWavingThin className="me-2" />
                        Welcome { `${adminInfo.firstName} ${adminInfo.lastName}` } In Your Admin Dashboard Page
                    </h1>
                </div>
            </>}
            {isLoadingPage && !isErrorMsgOnLoadingThePage && <LoaderPage />}
            {isErrorMsgOnLoadingThePage && <ErrorOnLoadingThePage />}
        </div>
    );
}