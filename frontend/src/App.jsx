
import { useEffect, useState } from "react";
import api from "./api";
import Register from "./Register";
import Login from "./Login";
import CreateAccount from "./CreateAccount";
import Transfer from "./Transfer";
import Deposit from "./Deposit";
import Withdraw from "./Withdraw";
import TransactionHistory from "./TransactionHistory";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

import {
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  CirclePlus,
  CircleMinus,
  History,
  LogOut,
  Bell,
  Search,
  ChevronDown,
  ChevronRight,
  Landmark,
  CreditCard,
  ShieldCheck,
  Plus,
  Minus,
  ArrowRightLeft,
  List,
  Menu,
  X,
} from "lucide-react";

import "./App.css";






const formatMoney = (amount) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(amount);

const formatMonth = (month) => {
  const [year, monthNumber] = month.split("-");
  return `${monthNumber}/${year.slice(2)}`;
};

const cashFlowData = (dashboardData) =>
    (dashboardData?.monthlyCashFlow ?? []).map((item) => ({
      month: formatMonth(item.month),
      income: Number(item.income ?? 0),
      expense: Number(item.expense ?? 0),
    }));

const navigation = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "My Accounts", icon: Wallet },
  { label: "Transfer", icon: ArrowLeftRight },
  { label: "Deposit", icon: CirclePlus },
  { label: "Withdraw", icon: CircleMinus },
  { label: "Transaction History", icon: History },
];

function App() {
  const [activePage, setActivePage] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [authPage, setAuthPage] = useState("login");
  const [showCreateAccount, setShowCreateAccount] = useState(false);


  const [loggedIn, setLoggedIn] = useState(
      Boolean(sessionStorage.getItem("token"))
  );
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  });


  const [dashboardData, setDashboardData] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const totalAccountBalance = accounts.reduce(
      (total, account) => total + Number(account.balance ?? 0),
      0
  );

  const transactions = (
      dashboardData?.recentTransactions ?? []
  ).map((item) => ({
    id: item.id,
    date: item.createdAt
        ? new Date(item.createdAt).toLocaleString("vi-VN")
        : "",
    type: item.type,
    description: item.description ?? "",
    amount: ["WITHDRAWAL", "TRANSFER_OUT"].includes(item.type)
        ? -Number(item.amount)
        : Number(item.amount),
    balance: Number(item.balanceAfter),
  }));

  const filteredTransactions = transactions.filter((transaction) =>
      `${transaction.type} ${transaction.description} ${transaction.date}`
          .toLowerCase()
          .includes(search.toLowerCase())
  );

  const navigate = (page) => {
    setActivePage(page);
    setSidebarOpen(false);
  };


  function handleLogin() {
    setCurrentUser(
        JSON.parse(sessionStorage.getItem("user") || "null")
    );
    setLoggedIn(true);
  }

  function handleLogout() {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    setCurrentUser(null);
    setDashboardData(null);
    setAccounts([]);
    setActivePage("Dashboard");
    setLoggedIn(false);
  }


  useEffect(() => {
    if (!loggedIn) return;

    api.get("/accounts/me")
        .then((response) => {
          setAccounts(Array.isArray(response.data) ? response.data : [response.data]);
          console.log("Accounts API:", response.data);
        })
        .catch((error) => {
          console.error("Accounts API error:", error);
        });
  }, [loggedIn]);


  useEffect(() => {
    if (!loggedIn) return;

    api.get("/dashboard")
        .then((response) => {
          setDashboardData(response.data);
          console.log("Dashboard API:", response.data);
        })
        .catch((error) => {
          console.error("Dashboard API error:", error);

          if (error.response?.status === 401) {
            handleLogout();
          }
        });
  }, [loggedIn]);

  if (!loggedIn) {
    return authPage === "register" ? (
        <Register
            onSwitchToLogin={() => setAuthPage("login")}
        />
    ) : (
        <Login
            onLogin={handleLogin}
            onSwitchToRegister={() => setAuthPage("register")}
        />
    );
  }

  const refreshBankingData = async () => {
    try {
      const [dashboardResponse, accountsResponse] = await Promise.all([
        api.get("/dashboard"),
        api.get("/accounts/me"),
      ]);

      setDashboardData(dashboardResponse.data);

      setAccounts(
          Array.isArray(accountsResponse.data)
              ? accountsResponse.data
              : [accountsResponse.data]
      );
    } catch (error) {
      console.error("Failed to refresh banking data:", error);

      if (error.response?.status === 401) {
        handleLogout();
      }

      throw error;
    }
  };

  return (
      <div className="app-shell">
        {sidebarOpen && (
            <button
                className="sidebar-overlay"
                aria-label="Close navigation"
                onClick={() => setSidebarOpen(false)}
            />
        )}

        <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
          <div className="brand">
            <img
                src="/digital-banking-logo.png"
                alt="Digital Banking"
                className="brand-logo"
            />

            <button
                className="mobile-close"
                onClick={() => setSidebarOpen(false)}
                aria-label="Close menu"
            >
              <X size={22} />
            </button>
          </div>

          <nav className="navigation">
            {navigation.map(({ label, icon: Icon }) => (
                <button
                    key={label}
                    className={`nav-item ${activePage === label ? "active" : ""}`}
                    onClick={() => navigate(label)}
                >
                  <Icon size={21} />
                  <span>{label}</span>
                </button>
            ))}
          </nav>

          <button
              className="nav-item logout"
              onClick={handleLogout}
          >
            <LogOut size={21} />
            <span>Logout</span>
          </button>
        </aside>

        <main className="main-area">
          <header className="topbar">
            <button
                className="menu-toggle"
                aria-label="Open menu"
                onClick={() => setSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>

            <div className="search-box">
              <Search size={19} />
              <input
                  type="search"
                  placeholder="Search transactions, accounts..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <div className="topbar-right">
              <button className="notification-button" aria-label="Notifications">
                <Bell size={21} />
                <span className="notification-dot" />
              </button>
              <div className="avatar">
                {(currentUser?.fullName || currentUser?.name || currentUser?.email || "U")
                    .charAt(0)
                    .toUpperCase()}
              </div>

              <span className="user-name">
                {currentUser?.fullName ||
                    currentUser?.name ||
                    currentUser?.email ||
                    "User"}
              </span>

              <ChevronDown size={16} className="user-chevron" />
            </div>
          </header>

        {activePage === "Dashboard" && (
            <div className="dashboard-content">
            <section className="welcome-row">
              <div>
                <p className="eyebrow">YOUR FINANCES AT A GLANCE</p>
                <h1>
                  Good morning, {currentUser?.fullName || currentUser?.name || "there"}
                </h1>
                <p className="welcome-subtitle">
                  Here&apos;s your account summary and recent transactions.
                </p>
              </div>
              <div className="current-date">
                <History size={17} />
                <span>
                  {new Date().toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
            </section>

            <div className="dashboard-grid">
              <section className="main-column">
                <div className="stats-grid">
                  <article className="stat-card">
                    <div className="stat-icon blue">
                      <Landmark size={23} />
                    </div>
                    <div className="stat-details">
                      <p>Total Accounts</p>
                      <h2>{dashboardData?.totalAccounts ?? 0}</h2>
                      <span>Bank accounts</span>
                    </div>
                    <ChevronRight className="stat-arrow" size={20} />
                  </article>

                  <article className="stat-card">
                    <div className="stat-icon green">
                      <Wallet size={23} />
                    </div>
                    <div className="stat-details">
                      <p>Total Balance</p>
                      <h2>{formatMoney(Number(dashboardData?.totalBalance ?? 0))}</h2>
                      <span>Across all accounts</span>
                    </div>
                    <ChevronRight className="stat-arrow" size={20} />
                  </article>

                  <article className="stat-card">
                    <div className="stat-icon purple">
                      <ArrowLeftRight size={23} />
                    </div>
                    <div className="stat-details">
                      <p>Recent Transactions</p>
                      <h2>{transactions.length}</h2>
                      <span>Latest activities</span>
                    </div>
                    <ChevronRight className="stat-arrow" size={20} />
                  </article>
                </div>

                <section className="panel cash-flow-panel">
                  <div className="panel-heading">
                    <div>
                      <h2>Cash Flow</h2>
                      <p>Income vs. expenses · Last 6 months</p>
                    </div>
                  </div>

                  <div className="cash-flow-summary">
                    <div>
                      <span className="cash-flow-dot income-dot" />
                      <span>Total income this month</span>
                      <strong>
                        {formatMoney(
                            Number(
                                dashboardData?.monthlyCashFlow?.at(-1)?.income ?? 0
                            )
                        )}
                      </strong>
                    </div>

                    <div>
                      <span className="cash-flow-dot expense-dot" />
                      <span>Total expenses this month</span>
                      <strong>
                        {formatMoney(
                            Number(
                                dashboardData?.monthlyCashFlow?.at(-1)?.expense ?? 0
                            )
                        )}
                      </strong>
                    </div>
                  </div>

                  <div className="cash-flow-chart">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                          data={cashFlowData(dashboardData)}
                          margin={{ top: 12, right: 12, left: 8, bottom: 4 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />

                        <XAxis
                            dataKey="month"
                            tickLine={false}
                            axisLine={false}
                        />

                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            width={75}
                            tickFormatter={(value) => {
                              if (value >= 1_000_000_000) {
                                return `${(value / 1_000_000_000).toFixed(1)} tỷ`;
                              }

                              if (value >= 1_000_000) {
                                return `${(value / 1_000_000).toFixed(0)} triệu`;
                              }

                              if (value >= 1_000) {
                                return `${(value / 1_000).toFixed(0)} nghìn`;
                              }

                              return `${value} đ`;
                            }}
                        />

                        <Tooltip
                            formatter={(value, name) => [
                              formatMoney(Number(value)),
                              name === "income" ? "Income" : "Expenses",
                            ]}
                        />

                        <Legend
                            formatter={(value) =>
                                value === "income" ? "Income" : "Expenses"
                            }
                        />

                        <Bar
                            dataKey="income"
                            name="income"
                            fill="#16a34a"
                            radius={[5, 5, 0, 0]}
                        />

                        <Bar
                            dataKey="expense"
                            name="expense"
                            fill="#f97316"
                            radius={[5, 5, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </section>

                <section className="panel transaction-panel">
                  <div className="panel-heading">
                    <div>
                      <h2>Recent Transactions</h2>
                      <p>Your latest account activity</p>
                    </div>
                    <button
                        className="view-all"
                        onClick={() => navigate("Transaction History")}
                    >
                      View All <ChevronRight size={17} />
                    </button>
                  </div>

                  <div className="table-scroll">
                    <table className="transactions-table">
                      <thead>
                      <tr>
                        <th>Date &amp; Time</th>
                        <th>Type</th>
                        <th>Description</th>
                        <th className="align-right">Amount</th>
                        <th className="align-right">Balance After</th>
                      </tr>
                      </thead>
                      <tbody>
                      {filteredTransactions.map((transaction) => (
                          <tr key={transaction.id}>
                            <td className="date-cell">{transaction.date}</td>
                            <td>
                            <span
                                className={`transaction-badge ${
                                    transaction.type === "DEPOSIT"
                                        ? "deposit-badge"
                                        : transaction.type === "TRANSFER_OUT"
                                            ? "transfer-badge"
                                            : "withdraw-badge"
                                }`}
                            >
                              {transaction.type === "DEPOSIT" ? (
                                  <Plus size={13} />
                              ) : transaction.type === "TRANSFER_OUT" ? (
                                  <ArrowLeftRight size={13} />
                              ) : (
                                  <Minus size={13} />
                              )}
                              {transaction.type.replace("_", " ")}
                            </span>
                            </td>
                            <td className="description-cell">
                              {transaction.description}
                            </td>
                            <td
                                className={`align-right amount-cell ${
                                    transaction.amount > 0 ? "positive" : "negative"
                                }`}
                            >
                              {transaction.amount > 0 ? "+" : "−"}
                              {formatMoney(Math.abs(transaction.amount))}
                            </td>
                            <td className="align-right balance-cell">
                              {formatMoney(transaction.balance)}
                            </td>
                          </tr>
                      ))}
                      {filteredTransactions.length === 0 && (
                          <tr>
                            <td colSpan={5} className="empty-state">
                              No matching transactions found.
                            </td>
                          </tr>
                      )}
                      </tbody>
                    </table>
                  </div>
                </section>
              </section>

              <aside className="right-column">

                <section className="account-card">
                  <div className="account-card-top">
                    <div>
                      <p className="account-label">TOTAL ACCOUNT BALANCE</p>
                      <p className="account-number">
                        {accounts.length} Bank Accounts
                      </p>
                    </div>
                    <div className="account-card-icon">
                      <CreditCard size={25} />
                    </div>
                  </div>

                  <p className="account-balance">
                    {formatMoney(totalAccountBalance)}
                  </p>
                  <p className="available-label">Total available balance</p>

                  <div className="account-card-accounts">
                    {accounts.map((account) => (
                        <div className="account-mini-row" key={account.id}>
                          <span>
                            {account.accountNumber.replace(/(\d{4})(?=\d)/g, "$1 ")}
                          </span>
                          <strong>{formatMoney(Number(account.balance ?? 0))}</strong>
                        </div>
                    ))}
                  </div>
                </section>

                <section className="panel quick-actions-panel">
                  <div className="panel-heading compact-heading">
                    <div>
                      <h2>Quick Actions</h2>
                      <p>Manage your money</p>
                    </div>
                  </div>
                  <div className="quick-actions-grid">
                    <button
                        className="action-card action-deposit"
                        onClick={() => navigate("Deposit")}
                    >
                    <span className="action-icon">
                      <Plus size={22} />
                    </span>
                      <strong>Deposit</strong>
                      <span>Add money to your account</span>
                    </button>
                    <button
                        className="action-card action-withdraw"
                        onClick={() => navigate("Withdraw")}
                    >
                    <span className="action-icon">
                      <Minus size={22} />
                    </span>
                      <strong>Withdraw</strong>
                      <span>Withdraw money from your account</span>
                    </button>
                    <button
                        className="action-card action-transfer"
                        onClick={() => navigate("Transfer")}
                    >
                    <span className="action-icon">
                      <ArrowRightLeft size={22} />
                    </span>
                      <strong>Transfer</strong>
                      <span>Send money to other accounts</span>
                    </button>
                    <button
                        className="action-card action-history"
                        onClick={() => navigate("Transaction History")}
                    >
                    <span className="action-icon">
                      <List size={22} />
                    </span>
                      <strong>Transaction History</strong>
                      <span>View all transactions</span>
                    </button>
                  </div>
                </section>

                <section className="security-panel">
                  <div className="security-icon">
                    <ShieldCheck size={25} />
                  </div>
                  <div>
                    <h3>Your security matters</h3>
                    <p>
                      Always keep your login credentials private. Never share
                      your password or authentication token.
                    </p>
                  </div>
                </section>
              </aside>
            </div>

            <footer className="dashboard-footer">
              <span>© 2026 Digital Banking</span>
              <span><ShieldCheck size={14} /> Secure banking experience</span>
            </footer>
          </div>
        )}


          {activePage === "Transfer" && (
              <div className="page-content">
                <Transfer
                    accounts={accounts}
                    onSuccess={refreshBankingData}
                />
              </div>
          )}

          {activePage === "Deposit" && (
              <div className="page-content">
                <Deposit
                    accounts={accounts}
                    onSuccess={refreshBankingData}
                />
              </div>
          )}

          {activePage === "Withdraw" && (
              <div className="page-content">
                <Withdraw
                    accounts={accounts}
                    onSuccess={refreshBankingData}
                />
              </div>
          )}

          {activePage === "Transaction History" && (
              <div className="page-content">
                <TransactionHistory />
              </div>
          )}



          {activePage === "My Accounts" && (
              <div className="page-content accounts-page">
                {showCreateAccount && (
                    <CreateAccount
                        onSuccess={refreshBankingData}
                        onCancel={() => setShowCreateAccount(false)}
                    />
                )}


                <section className="panel accounts-panel">
                  <div className="panel-heading">
                    <div>
                      <h2>My Accounts</h2>
                      <p>Manage your bank accounts and balances</p>
                    </div>

                    <div className="account-page-actions">
                      <button
                          className="view-all"
                          onClick={refreshBankingData}
                      >
                        Refresh
                      </button>

                      <button
                          className="create-account-button"
                          onClick={() => setShowCreateAccount(true)}
                      >
                        <Plus size={17} />
                        Open New Account
                      </button>
                    </div>
                  </div>

                  <div className="account-summary-grid">
                    <div className="account-summary-card">
                      <div className="account-summary-icon">
                        <Wallet size={23} />
                      </div>
                      <div>
                        <p>Total Balance</p>
                        <h3>{formatMoney(totalAccountBalance)}</h3>
                        <span>Across all accounts</span>
                      </div>
                    </div>

                    <div className="account-summary-card">
                      <div className="account-summary-icon">
                        <CreditCard size={23} />
                      </div>
                      <div>
                        <p>Active Accounts</p>
                        <h3>
                          {accounts.filter(
                              (account) => account.status === "ACTIVE"
                          ).length}
                        </h3>
                        <span>Available bank accounts</span>
                      </div>
                    </div>
                  </div>

                  <div className="account-list-section">
                    <div className="account-list-heading">
                      <h3>Your Bank Accounts</h3>
                      <span>{accounts.length} accounts</span>
                    </div>

                    <div className="account-list">
                      {accounts.length === 0 ? (
                          <div className="empty-state">
                            No bank accounts found.
                          </div>
                      ) : (
                          accounts.map((account) => (
                              <div className="account-item" key={account.id}>
                                <div className="account-item-left">
                                  <div className="account-item-icon">
                                    <CreditCard size={23} />
                                  </div>

                                  <div className="account-item-info">
                                    <strong>
                                      {account.accountNumber.replace(
                                          /(\d{4})(?=\d)/g,
                                          "$1 "
                                      )}
                                    </strong>
                                    <span>Payment Account</span>
                                    <span className="account-status">
                                      <span className="status-dot" />
                                      {account.status}
                                    </span>
                                  </div>
                                </div>

                                <div className="account-item-balance">
                                  <strong>
                                    {formatMoney(Number(account.balance ?? 0))}
                                  </strong>
                                  <span>Available balance</span>
                                </div>
                              </div>
                          ))
                      )}
                    </div>
                  </div>
                </section>

              </div>
          )}


        </main>
      </div>
  );
}

export default App;