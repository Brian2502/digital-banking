
import { useState } from "react";
import { Landmark, LockKeyhole, Mail } from "lucide-react";
import api from "./api";
import "./Login.css";

function Login({ onLogin, onSwitchToRegister }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await api.post("/auth/login", {
                email,
                password,
            });

            const data = response.data;

            if (!data.token) {
                throw new Error("API chưa trả về trường token.");
            }

            sessionStorage.setItem("token", data.token);
            sessionStorage.setItem("user", JSON.stringify(data));

            onLogin(data);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.message ||
                "Đăng nhập thất bại. Vui lòng kiểm tra email và mật khẩu."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="login-page">
            <form className="login-card" onSubmit={handleSubmit}>
                <div className="login-brand">
                    <div className="login-logo">
                        <img src="/favicon.png" alt="Digital Banking Logo" />
                    </div>
                    <h1>Digital Banking</h1>
                    <p>Đăng nhập vào tài khoản của bạn</p>
                </div>

                <label htmlFor="email">Email</label>
                <div className="login-input">
                    <Mail size={18} />
                    <input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        required
                    />
                </div>

                <label htmlFor="password">Mật khẩu</label>
                <div className="login-input">
                    <LockKeyhole size={18} />
                    <input
                        id="password"
                        type="password"
                        placeholder="Nhập mật khẩu"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        required
                    />
                </div>

                {error && <p className="login-error">{error}</p>}

                <button className="login-button" type="submit" disabled={loading}>
                    {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                </button>

                <p className="login-note">
                    Chưa có tài khoản?{" "}
                    <button
                        type="button"
                        className="auth-link"
                        onClick={onSwitchToRegister}
                    >
                        Đăng ký ngay
                    </button>
                </p>
            </form>
        </main>
    );
}

export default Login;
