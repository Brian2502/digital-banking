
import { useEffect, useState } from "react";
import api from "./api";
import "./TransactionHistory.css";

const formatMoney = (value) =>
    Number(value ?? 0).toLocaleString("vi-VN", {
        maximumFractionDigits: 2,
    }) + " VND";

export default function TransactionHistory() {
    const [transactions, setTransactions] = useState([]);
    const [type, setType] = useState("");
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const pageSize = 10;

    useEffect(() => {
        const loadTransactions = async () => {
            setLoading(true);
            setError("");

            try {
                const response = await api.get("/transactions/me", {
                    params: {
                        page,
                        size: pageSize,
                        ...(type ? { type } : {}),
                        ...(from ? { from } : {}),
                        ...(to ? { to } : {}),
                    },
                });

                const data = response.data;
                setTransactions(data.content ?? []);
                setTotalPages(data.totalPages ?? 0);
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    "Unable to load transaction history."
                );
            } finally {
                setLoading(false);
            }
        };

        loadTransactions();
    }, [type, from, to, page]);

    const applyFilters = (event) => {
        event.preventDefault();

        if (from && to && from > to) {
            setError("Start date cannot be later than end date.");
            return;
        }

        setPage(0);
    };

    const clearFilters = () => {
        setType("");
        setFrom("");
        setTo("");
        setPage(0);
        setError("");
    };

    return (
        <div className="history-page">
            <div className="history-heading">
                <h2>Transaction History</h2>
                <p>Review and filter your account activity.</p>
            </div>

            <div className="history-layout">
                {/* Left column: Filters */}
                <aside className="history-sidebar">
                    <form className="history-filters" onSubmit={applyFilters}>
                        <div className="history-filter-heading">
                            <h3>Filter transactions</h3>
                            <p>Find a specific transaction</p>
                        </div>

                        <div className="history-field">
                            <label htmlFor="history-type">Transaction type</label>
                            <select
                                id="history-type"
                                value={type}
                                onChange={(event) => {
                                    setType(event.target.value);
                                    setPage(0);
                                }}
                            >
                                <option value="">All transactions</option>
                                <option value="DEPOSIT">Deposit</option>
                                <option value="WITHDRAWAL">Withdrawal</option>
                                <option value="TRANSFER_IN">Transfer received</option>
                                <option value="TRANSFER_OUT">Transfer sent</option>
                            </select>
                        </div>

                        <div className="history-field">
                            <label htmlFor="history-from">From date</label>
                            <input
                                id="history-from"
                                type="date"
                                value={from}
                                onChange={(event) => setFrom(event.target.value)}
                            />
                        </div>

                        <div className="history-field">
                            <label htmlFor="history-to">To date</label>
                            <input
                                id="history-to"
                                type="date"
                                value={to}
                                onChange={(event) => setTo(event.target.value)}
                            />
                        </div>

                        <div className="history-filter-actions">
                            <button type="submit" className="history-apply">
                                Apply filters
                            </button>

                            <button
                                type="button"
                                className="history-clear"
                                onClick={clearFilters}
                            >
                                Clear filters
                            </button>
                        </div>
                    </form>
                </aside>

                {/* Right column: Transaction table */}
                <section className="history-table-card">
                    <div className="history-table-heading">
                        <div>
                            <h3>Transactions</h3>
                            <p>Account activity and transaction details</p>
                        </div>

                        <span>
                        {loading
                            ? "Loading..."
                            : `${transactions.length} on this page`}
                    </span>
                    </div>

                    {error && (
                        <div className="history-error" role="alert">
                            {error}
                        </div>
                    )}

                    <div className="history-table-scroll">
                        <table className="history-table">
                            <thead>
                            <tr>
                                <th>Date &amp; Time</th>
                                <th>Type</th>
                                <th>Description</th>
                                <th className="history-right">Amount</th>
                                <th className="history-right">Balance after</th>
                            </tr>
                            </thead>

                            <tbody>
                            {!loading &&
                                transactions.map((transaction) => {
                                    const outgoing = [
                                        "WITHDRAWAL",
                                        "TRANSFER_OUT",
                                    ].includes(transaction.type);

                                    return (
                                        <tr key={transaction.id}>
                                            <td>
                                                {transaction.createdAt
                                                    ? new Date(
                                                        transaction.createdAt
                                                    ).toLocaleString("vi-VN")
                                                    : "—"}
                                            </td>

                                            <td>
                                                <span
                                                    className={`history-badge ${
                                                        outgoing
                                                            ? "history-outgoing"
                                                            : "history-incoming"
                                                    }`}
                                                >
                                                    {transaction.type?.replaceAll(
                                                        "_",
                                                        " "
                                                    ) ?? "—"}
                                                </span>
                                            </td>

                                            <td>
                                                {transaction.description || "—"}
                                            </td>

                                            <td
                                                className={`history-right ${
                                                    outgoing
                                                        ? "history-negative"
                                                        : "history-positive"
                                                }`}
                                            >
                                                {outgoing ? "−" : "+"}
                                                {formatMoney(transaction.amount)}
                                            </td>

                                            <td className="history-right">
                                                {formatMoney(
                                                    transaction.balanceAfter
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}

                            {!loading && transactions.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="history-empty">
                                        No transactions found.
                                    </td>
                                </tr>
                            )}

                            {loading && (
                                <tr>
                                    <td colSpan={5} className="history-empty">
                                        Loading transactions...
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>

                    <div className="history-pagination">
                        <button
                            type="button"
                            disabled={loading || page <= 0}
                            onClick={() =>
                                setPage((current) => current - 1)
                            }
                        >
                            Previous
                        </button>

                        <span>
                        Page {totalPages === 0 ? 0 : page + 1} of {totalPages}
                    </span>

                        <button
                            type="button"
                            disabled={loading || page + 1 >= totalPages}
                            onClick={() =>
                                setPage((current) => current + 1)
                            }
                        >
                            Next
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
}
