import { useState } from "react";
import api from "./api";
import {
    ArrowLeftRight,
    ShieldCheck,
    Clock,
    Wallet,
    Receipt,
} from "lucide-react";
import "./Transfer.css";

const formatMoney = (amount) =>
    new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
    }).format(amount);

export default function Transfer({ accounts = [], onSuccess }) {
    const [form, setForm] = useState({
        fromAccountId: "",
        toAccountNumber: "",
        amount: "",
        description: "",
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState(false);

    const selectedAccount = accounts.find(
        (account) => account.id === Number(form.fromAccountId)
    );

    const amount = Number(form.amount) || 0;

    const handleChange = (event) => {
        setForm((previous) => ({
            ...previous,
            [event.target.name]: event.target.value,
        }));
        setMessage("");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setMessage("");
        setError(false);

        if (!selectedAccount) {
            setError(true);
            setMessage("Please select a valid source account.");
            return;
        }

        if (!form.toAccountNumber.trim()) {
            setError(true);
            setMessage("Please enter the recipient account number.");
            return;
        }

        if (!Number.isFinite(amount) || amount <= 0) {
            setError(true);
            setMessage("Transfer amount must be greater than zero.");
            return;
        }

        if (form.toAccountNumber.trim() === selectedAccount.accountNumber) {
            setError(true);
            setMessage("Source and recipient accounts must be different.");
            return;
        }

        setLoading(true);

        try {
            const response = await api.post("/transactions/transfer", {
                sourceAccountNumber: selectedAccount.accountNumber,
                destinationAccountNumber: form.toAccountNumber.trim(),
                amount,
                description: form.description.trim(),
            });

            setMessage(
                response.data?.message || "Transfer completed successfully."
            );

            setForm({
                fromAccountId: "",
                toAccountNumber: "",
                amount: "",
                description: "",
            });

            if (onSuccess) {
                await onSuccess();
            }
        } catch (err) {
            setError(true);
            setMessage(
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Transfer failed. Please check your information."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="transfer-page">
            <div className="transfer-heading">
                <div className="transfer-heading-icon">
                    <ArrowLeftRight size={25} />
                </div>
                <div>
                    <h2>Transfer Money</h2>
                    <p>Send money securely to another account.</p>
                </div>
            </div>

            <div className="transfer-layout">
                <form className="transfer-card" onSubmit={handleSubmit}>
                    <div className="transfer-card-heading">
                        <h3>Transfer Details</h3>
                        <p>Enter the information below to make a transfer.</p>
                    </div>

                    <div className="transfer-field">
                        <label htmlFor="fromAccountId">From account</label>
                        <select
                            id="fromAccountId"
                            name="fromAccountId"
                            value={form.fromAccountId}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select an account</option>
                            {accounts.map((account) => (
                                <option key={account.id} value={account.id}>
                                    {account.accountNumber} —{" "}
                                    {formatMoney(Number(account.balance))}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="transfer-field">
                        <label htmlFor="toAccountNumber">
                            Recipient account number
                        </label>
                        <input
                            id="toAccountNumber"
                            name="toAccountNumber"
                            value={form.toAccountNumber}
                            onChange={handleChange}
                            placeholder="Enter recipient account number"
                            required
                        />
                    </div>

                    <div className="transfer-field">
                        <label htmlFor="amount">Amount (VND)</label>
                        <input
                            id="amount"
                            name="amount"
                            type="number"
                            min="1"
                            step="1"
                            value={form.amount}
                            onChange={handleChange}
                            placeholder="Enter amount"
                            required
                        />
                    </div>

                    <div className="transfer-field">
                        <label htmlFor="description">Transfer description</label>
                        <input
                            id="description"
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            placeholder="e.g. Monthly expenses"
                        />
                    </div>

                    {message && (
                        <div
                            className={`transfer-message ${
                                error ? "transfer-error" : "transfer-success"
                            }`}
                            role="alert"
                        >
                            {message}
                        </div>
                    )}

                    <button
                        className="transfer-submit"
                        type="submit"
                        disabled={loading || accounts.length === 0}
                    >
                        {loading ? "Processing..." : "Confirm Transfer"}
                    </button>
                </form>

                <aside className="transfer-sidebar">
                    <section className="transfer-summary-card">
                        <div className="summary-title">
                            <Receipt size={19} />
                            <h3>Transfer Summary</h3>
                        </div>

                        <div className="summary-account">
                            <span>Source account</span>
                            <strong>
                                {selectedAccount?.accountNumber || "Not selected"}
                            </strong>

                            <span>Available balance</span>
                            <strong className="summary-balance">
                                {formatMoney(Number(selectedAccount?.balance ?? 0))}
                            </strong>
                        </div>

                        <div className="summary-divider" />

                        <div className="summary-row">
                            <span>Transfer amount</span>
                            <strong>{formatMoney(amount)}</strong>
                        </div>

                        <div className="summary-row">
                            <span>Transfer fee</span>
                            <strong>0 ₫</strong>
                        </div>

                        <div className="summary-row summary-total">
                            <span>Total amount</span>
                            <strong>{formatMoney(amount)}</strong>
                        </div>

                        <p className="summary-note">
                            The transfer amount is a preview. Final processing is subject
                            to server-side validation.
                        </p>
                    </section>

                    <section className="transfer-security-card">
                        <div className="security-heading">
                            <ShieldCheck size={22} />
                            <h3>Secure Banking</h3>
                        </div>
                        <p>
                            Always verify the recipient account number and transfer amount
                            before confirming your transaction.
                        </p>

                        <div className="security-feature">
                            <Clock size={17} />
                            <span>Transaction processing</span>
                            <strong>Instant*</strong>
                        </div>

                        <div className="security-feature">
                            <Wallet size={17} />
                            <span>Account protection</span>
                            <strong>Enabled</strong>
                        </div>

                        <small>*Subject to server and banking system availability.</small>
                    </section>
                </aside>
            </div>
        </div>
    );
}