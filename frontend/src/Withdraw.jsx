
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

    const selectedAccount = accounts.find(
        (account) => account.id === Number(accountId)
    );

    return (
        <div className="withdraw-page">
            <div className="withdraw-heading">
                <h2>Withdraw Money</h2>
                <p>Withdraw money securely from your bank account.</p>
            </div>

            <div className="withdraw-layout">
                {/* Left: Withdrawal form */}
                <form className="withdraw-card" onSubmit={handleSubmit}>
                    <div className="withdraw-card-heading">
                        <h3>Withdrawal Information</h3>
                        <p>Enter the account and amount you want to withdraw.</p>
                    </div>

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

                {/* Right: Account information */}
                <aside className="withdraw-summary">
                    <div className="withdraw-summary-header">
                        <span>ACCOUNT OVERVIEW</span>
                        <span className="withdraw-summary-icon">₫</span>
                    </div>

                    {selectedAccount ? (
                        <>
                            <p className="withdraw-summary-label">Selected account</p>
                            <h3>{selectedAccount.accountNumber}</h3>

                            <div className="withdraw-summary-divider" />

                            <p className="withdraw-summary-label">Available balance</p>
                            <div className="withdraw-summary-balance">
                                {Number(selectedAccount.balance).toLocaleString("vi-VN")} ₫
                            </div>

                            {amount && Number(amount) > 0 && (
                                <div className="withdraw-after">
                                    <span>Balance after withdrawal</span>
                                    <strong>
                                        {(
                                            Number(selectedAccount.balance) - Number(amount)
                                        ).toLocaleString("vi-VN")}{" "}
                                        ₫
                                    </strong>
                                </div>
                            )}

                            <span className="withdraw-status">● ACTIVE ACCOUNT</span>
                        </>
                    ) : (
                        <div className="withdraw-empty">
                            <p>Select an account to view its balance.</p>
                        </div>
                    )}

                    <div className="withdraw-summary-divider" />

                    <div className="withdraw-notice">
                        <strong>Important information</strong>
                        <ul>
                            <li>Enter an amount greater than zero.</li>
                            <li>Your withdrawal cannot exceed the available balance.</li>
                            <li>Your transaction will be recorded in transaction history.</li>
                        </ul>
                    </div>
                </aside>
            </div>
        </div>
    );
}
