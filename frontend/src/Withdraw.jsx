
import { useState } from "react";
import api from "./api";
import "./Withdraw.css";

export default function Withdraw({ accounts, onSuccess }) {
    const [accountId, setAccountId] = useState("");
    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setMessage("");
        setError(false);

        const selectedAccount = accounts.find(
            (account) => account.id === Number(accountId)
        );

        if (!selectedAccount) {
            setError(true);
            setMessage("Please select a valid account.");
            return;
        }

        if (!amount || !Number.isFinite(Number(amount)) || Number(amount) <= 0) {
            setError(true);
            setMessage("Amount must be greater than zero.");
            return;
        }

        if (Number(amount) > Number(selectedAccount.balance)) {
            setError(true);
            setMessage("Insufficient balance.");
            return;
        }

        setLoading(true);

        try {
            const response = await api.post("/transactions/withdraw", {
                accountNumber: selectedAccount.accountNumber,
                amount: Number(amount),
            });

            setError(false);
            setMessage(
                response.data?.message || "Withdrawal completed successfully."
            );

            setAmount("");

            if (onSuccess) {
                await onSuccess();
            }
        } catch (err) {
            setError(true);
            setMessage(
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Withdrawal failed. Please check your information."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="withdraw-page">
            <div className="withdraw-heading">
                <h2>Withdraw Money</h2>
                <p>Withdraw money from your bank account.</p>
            </div>

            <form className="withdraw-card" onSubmit={handleSubmit}>
                <div className="withdraw-field">
                    <label htmlFor="withdraw-account">From account</label>
                    <select
                        id="withdraw-account"
                        value={accountId}
                        onChange={(event) => {
                            setAccountId(event.target.value);
                            setMessage("");
                            setError(false);
                        }}
                        required
                    >
                        <option value="">Select an account</option>
                        {accounts.map((account) => (
                            <option key={account.id} value={account.id}>
                                {account.accountNumber} — Balance:{" "}
                                {Number(account.balance).toLocaleString("vi-VN")} VND
                            </option>
                        ))}
                    </select>
                </div>

                <div className="withdraw-field">
                    <label htmlFor="withdraw-amount">Amount (VND)</label>
                    <input
                        id="withdraw-amount"
                        type="number"
                        min="1"
                        step="1"
                        value={amount}
                        onChange={(event) => {
                            setAmount(event.target.value);
                            setMessage("");
                            setError(false);
                        }}
                        placeholder="Enter amount"
                        required
                    />
                </div>

                {message && (
                    <div
                        className={`withdraw-message ${
                            error ? "withdraw-error" : "withdraw-success"
                        }`}
                        role="alert"
                    >
                        {message}
                    </div>
                )}

                <button
                    className="withdraw-submit"
                    type="submit"
                    disabled={loading || accounts.length === 0}
                >
                    {loading ? "Processing..." : "Confirm Withdrawal"}
                </button>
            </form>
        </div>
    );
}
