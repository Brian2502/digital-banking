
import { useState } from "react";
import api from "./api";
import "./Deposit.css";

const formatMoney = (amount) =>
    new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
    }).format(Number(amount || 0));

export default function Deposit({ accounts = [], onSuccess }) {
    const [accountId, setAccountId] = useState("");
    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState(false);

    const selectedAccount = accounts.find(
        (account) => account.id === Number(accountId)
    );

    const handleSubmit = async (event) => {
        event.preventDefault();
        setMessage("");
        setError(false);

        if (!selectedAccount) {
            setError(true);
            setMessage("Please select a valid account.");
            return;
        }

        if (
            !amount ||
            !Number.isFinite(Number(amount)) ||
            Number(amount) <= 0
        ) {
            setError(true);
            setMessage("Amount must be greater than zero.");
            return;
        }

        setLoading(true);

        try {
            const response = await api.post("/transactions/deposit", {
                accountNumber: selectedAccount.accountNumber,
                amount: Number(amount),
            });

            setMessage(
                response.data?.message || "Deposit completed successfully."
            );
            setError(false);
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
                <div>
                    <span className="deposit-eyebrow">BANKING SERVICES</span>
                    <h2>Deposit Money</h2>
                    <p>Add money to your bank account securely.</p>
                </div>
            </div>

            <div className="deposit-layout">
                <form className="deposit-card" onSubmit={handleSubmit}>
                    <div className="deposit-card-heading">
                        <div>
                            <h3>Deposit details</h3>
                            <p>Enter the information to make a deposit.</p>
                        </div>
                    </div>

                    <div className="deposit-field">
                        <label htmlFor="deposit-account">Select account</label>
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
                                    {account.accountNumber} —{" "}
                                    {formatMoney(account.balance)}
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
                            placeholder="Enter deposit amount"
                            required
                        />
                        <span className="deposit-field-hint">
                            Enter the amount you want to deposit.
                        </span>
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

                    {accounts.length === 0 && (
                        <p className="deposit-empty-hint">
                            You don't have any bank accounts yet.
                        </p>
                    )}
                </form>

                <aside className="deposit-side">
                    <section className="deposit-account-card">
                        <div className="deposit-account-card-top">
                            <span>SELECTED ACCOUNT</span>
                            <span className="deposit-card-symbol">▣</span>
                        </div>

                        <p className="deposit-account-number">
                            {selectedAccount
                                ? selectedAccount.accountNumber.replace(
                                    /(\d{4})(?=\d)/g,
                                    "$1 "
                                )
                                : "No account selected"}
                        </p>

                        <span className="deposit-balance-label">
                            Current balance
                        </span>

                        <strong className="deposit-balance">
                            {formatMoney(selectedAccount?.balance)}
                        </strong>

                        <div className="deposit-account-status">
                            <span className="deposit-status-dot" />
                            {selectedAccount?.status || "Select an account"}
                        </div>
                    </section>

                    <section className="deposit-info-card">
                        <h3>How to deposit</h3>

                        <div className="deposit-info-step">
                            <span>1</span>
                            <div>
                                <strong>Select an account</strong>
                                <p>Choose the bank account you want to fund.</p>
                            </div>
                        </div>

                        <div className="deposit-info-step">
                            <span>2</span>
                            <div>
                                <strong>Enter the amount</strong>
                                <p>Enter a positive amount in VND.</p>
                            </div>
                        </div>

                        <div className="deposit-info-step">
                            <span>3</span>
                            <div>
                                <strong>Confirm deposit</strong>
                                <p>Submit the form to complete the transaction.</p>
                            </div>
                        </div>
                    </section>

                    <div className="deposit-security-note">
                        <span className="deposit-security-icon">✓</span>
                        <div>
                            <strong>Secure banking</strong>
                            <p>
                                Always verify your selected account and
                                transaction amount before confirming.
                            </p>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
