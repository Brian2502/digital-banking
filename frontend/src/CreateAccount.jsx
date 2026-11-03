
import { useState } from "react";
import api from "./api";

function CreateAccount({ onSuccess, onCancel }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleCreateAccount = async () => {
        try {
            setLoading(true);
            setError("");
            setSuccess("");

            const response = await api.post("/accounts");

            await onSuccess();

            setSuccess(
                `Your bank account has been created successfully. Account number: ${
                    response.data?.accountNumber ?? "Please check My Accounts"
                }`
            );
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to create bank account. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="panel create-account-panel">
            <div className="panel-heading">
                <div>
                    <h2>Open a New Bank Account</h2>
                    <p>Create an additional account for your banking activities.</p>
                </div>
            </div>

            <div className="create-account-info">
                <p>Account type: <strong>Payment Account</strong></p>
                <p>Initial balance: <strong>0 VND</strong></p>
                <p>Account status: <strong>ACTIVE</strong></p>
            </div>

            {error && <p className="account-error">{error}</p>}
            {success && <p className="account-success">{success}</p>}

            {!success && (
                <div className="create-account-actions">
                    <button
                        className="view-all"
                        onClick={onCancel}
                        disabled={loading}
                    >
                        Cancel
                    </button>

                    <button
                        className="create-account-button"
                        onClick={handleCreateAccount}
                        disabled={loading}
                    >
                        {loading ? "Creating..." : "Create Account"}
                    </button>
                </div>
            )}
        </section>
    );
}

export default CreateAccount;
