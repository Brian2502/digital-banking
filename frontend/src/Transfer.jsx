
import { useState } from "react";
import api from "./api";
import "./Transfer.css";

export default function Transfer({ accounts, onSuccess }) {
    const [form, setForm] = useState({
        fromAccountId: "",
        toAccountNumber: "",
        amount: "",
        description: "",
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState(false);

    const handleChange = (event) => {
        setForm({
            ...form,
            [event.target.name]: event.target.value,
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setMessage("");
        setError(false);

        if (!form.fromAccountId) {
            setMessage("Please select a source account.");
            setError(true);
            return;
        }

        if (!form.toAccountNumber.trim()) {
            setMessage("Please enter the recipient account number.");
            setError(true);
            return;
        }

        if (!form.amount || Number(form.amount) <= 0) {
            setMessage("Transfer amount must be greater than zero.");
            setError(true);
            return;
        }

        setLoading(true);

        try {
            const selectedAccount = accounts.find(
                (account) => account.id === Number(form.fromAccountId)
            );

            if (!selectedAccount) {
                setError(true);
                setMessage("Please select a valid source account.");
                return;
            }

            const response = await api.post("/transactions/transfer", {
                sourceAccountNumber: selectedAccount.accountNumber,
                destinationAccountNumber: form.toAccountNumber.trim(),
                amount: Number(form.amount),
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
                <div>
                    <h2>Transfer Money</h2>
                    <p>Send money securely to another account.</p>
                </div>
            </div>

            <form className="transfer-card" onSubmit={handleSubmit}>
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
                                {account.accountNumber} — Balance:{" "}
                                {Number(account.balance).toLocaleString("vi-VN")} VND
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
        </div>
    );
}
