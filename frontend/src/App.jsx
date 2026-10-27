
import { useEffect, useState } from "react";
import api from "./api";
import Login from "./Login";
import Transfer from "./Transfer";
import Deposit from "./Deposit";
import Withdraw from "./Withdraw";
import TransactionHistory from "./TransactionHistory";

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

  const [loggedIn, setLoggedIn] = useState(
      Boolean(sessionStorage.getItem("token"))
  );

  const [dashboardData, setDashboardData] = useState(null);
  const [accounts, setAccounts] = useState([]);

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
    setLoggedIn(true);
  }

  function handleLogout() {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    setDashboardData(null);
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
    return <Login onLogin={handleLogin} />;
  }

  const refreshBankingData = async () => {
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
            <div className="brand-icon">
              <Landmark size={30} />
            </div>
            <span>Digital Banking</span>
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
              <div className="avatar">U</div>
              <span className="user-name">User Demo</span>
              <ChevronDown size={16} className="user-chevron" />
            </div>
          </header>

        {activePage === "Dashboard" && (
            <div className="dashboard-content">
            <section className="welcome-row">
              <div>
                <p className="eyebrow">YOUR FINANCES AT A GLANCE</p>
                <h1>Good morning, User Demo <span>👋</span></h1>
                <p className="welcome-subtitle">
                  Here&apos;s your account summary and recent transactions.
                </p>
              </div>
              <div className="current-date">
                <History size={17} />
                <span>October 22, 2026</span>
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
                      <p className="account-label">MY ACCOUNT</p>
                      <p className="account-number">
                        {accounts[0]?.accountNumber
                            ? accounts[0].accountNumber.replace(/(\d{4})(?=\d)/g, "$1 ")
                            : "No account"}
                      </p>
                    </div>
                    <div className="account-card-icon">
                      <CreditCard size={25} />
                    </div>
                  </div>
                  <p className="account-balance">
                    {formatMoney(Number(accounts[0]?.balance ?? 0))}
                  </p>
                  <p className="available-label">Available balance</p>
                  <p className="available-label">
                    Status: {accounts[0]?.status ?? "Loading..."}
                  </p>
                  <div className="card-decoration decoration-one" />
                  <div className="card-decoration decoration-two" />
                  <div className="card-dots">
                    <span className="selected" />
                    <span />
                    <span />
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
            <Transfer
                accounts={accounts}
                onSuccess={refreshBankingData}
            />
        )}
        {activePage === "Deposit" && (
            <Deposit
                accounts={accounts}
                onSuccess={refreshBankingData}
            />
        )}
        {activePage === "Withdraw" && (
            <Withdraw
                accounts={accounts}
                onSuccess={refreshBankingData}
            />
        )}
        {activePage === "Transaction History" && (
            <TransactionHistory />
        )}
        </main>
      </div>
  );
}

export default App;