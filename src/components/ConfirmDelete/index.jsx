import { GrFormClose } from "react-icons/gr";

export default function ConfirmDelete({
    name,
    setIsDisplayConfirmDeleteBox,
    handleDeleteFunc,
    setSelectedElementIndex,
    waitMsg,
    errorMsg,
    successMsg
}) {

    const handleClosePopupBox = () => {
        setIsDisplayConfirmDeleteBox(false);
        setSelectedElementIndex(-1);
    }

    const callDeleteFunc = async () => {
        await handleDeleteFunc();
        handleClosePopupBox();
    }

    return (
        <div className="confirm-delete-box popup-box">
            <div className="content-box d-flex align-items-center justify-content-center text-white flex-column p-4 text-center">
                {!waitMsg && !errorMsg && !successMsg && <GrFormClose className="close-popup-box-icon" onClick={handleClosePopupBox} />}
                <h2 className="mb-5 pb-3 border-bottom border-white">Confirm Delete</h2>
                <h4 className="mb-4">Are You Sure From Delete ( {name} ) ?</h4>
                {
                    !waitMsg &&
                    !errorMsg &&
                    !successMsg &&
                    <button
                        className="btn btn-success d-block mx-auto mb-4 global-button"
                        onClick={callDeleteFunc}
                    >
                        Delete
                    </button>
                }
                {waitMsg &&
                    <button
                        className="btn btn-info d-block mx-auto mb-3 global-button"
                        disabled
                    >
                        {waitMsg}
                    </button>
                }
                {errorMsg &&
                    <button
                        className="btn btn-danger d-block mx-auto mb-3 global-button"
                        disabled
                    >
                        {errorMsg}
                    </button>
                }
                {successMsg &&
                    <button
                        className="btn btn-success d-block mx-auto mb-3 global-button"
                        disabled
                    >
                        {successMsg}
                    </button>
                }
                <button
                    className="btn btn-danger d-block mx-auto global-button"
                    disabled={waitMsg || errorMsg || successMsg}
                    onClick={handleClosePopupBox}
                >
                    Close
                </button>
            </div>
        </div>
    );
}