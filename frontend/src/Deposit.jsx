
import { useState } from "react";
import api from "./api";
import "./Deposit.css";

export default function Deposit({ accounts, onSuccess }) {
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

        setLoading(true);

        try {
            // Endpoint và tên trường cần khớp với API backend.
            const response = await api.post("/transactions/deposit", {
                accountNumber: selectedAccount.accountNumber,
                amount: Number(amount),
            });


            setError(false);
            setMessage(
                response.data?.message || "Deposit completed successfully."
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
                "Deposit failed. Please check your information."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="deposit-page">
            <div className="deposit-heading">
                <h2>Deposit Money</h2>
                <p>Add money to your bank account.</p>
            </div>

            <form className="deposit-card" onSubmit={handleSubmit}>
                <div className="deposit-field">
                    <label htmlFor="deposit-account">Account</label>
                    <select
                        id="deposit-account"
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

                <div className="deposit-field">
                    <label htmlFor="deposit-amount">Amount (VND)</label>
                    <input
                        id="deposit-amount"
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
                        className={`deposit-message ${
                            error ? "deposit-error" : "deposit-success"
                        }`}
                        role="alert"
                    >
                        {message}
                    </div>
                )}

                <button
                    className="deposit-submit"
                    type="submit"
                    disabled={loading || accounts.length === 0}
                >
                    {loading ? "Processing..." : "Confirm Deposit"}
                </button>
            </form>
        </div>
    );
}
