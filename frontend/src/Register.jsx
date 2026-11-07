
import { useState } from "react";
import { Landmark, UserRound, Mail, LockKeyhole } from "lucide-react";
import api from "./api";
import "./Login.css";

function Register({ onSwitchToLogin }) {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");
        setSuccess("");

        if (password !== confirmPassword) {
            setError("Mật khẩu xác nhận không khớp.");
            return;
        }

        if (password.length < 8 || password.length > 72) {
            setError("Mật khẩu phải từ 8 đến 72 ký tự.");
            return;
        }

        setLoading(true);

        try {
            const response = await api.post("/auth/register", {
                fullName,
                email,
                password,
            });

            setSuccess(
                response.data?.message ||
                "Đăng ký thành công. Vui lòng đăng nhập."
            );

            setFullName("");
            setEmail("");
            setPassword("");
            setConfirmPassword("");
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Đăng ký thất bại. Vui lòng kiểm tra thông tin."
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
                    <p>Tạo tài khoản mới</p>
                </div>

                <label htmlFor="fullName">Họ và tên</label>
                <div className="login-input">
                    <UserRound size={18} />
                    <input
                        id="fullName"
                        type="text"
                        placeholder="Nhập họ và tên"
                        value={fullName}
                        onChange={(event) =>
                            setFullName(event.target.value)
                        }
                        maxLength={100}
                        autoComplete="name"
                        required
                    />
                </div>

                <label htmlFor="registerEmail">Email</label>
                <div className="login-input">
                    <Mail size={18} />
                    <input
                        id="registerEmail"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(event) =>
                            setEmail(event.target.value)
                        }
                        maxLength={150}
                        autoComplete="email"
                        required
                    />
                </div>

                <label htmlFor="registerPassword">Mật khẩu</label>
                <div className="login-input">
                    <LockKeyhole size={18} />
                    <input
                        id="registerPassword"
                        type="password"
                        placeholder="Ít nhất 8 ký tự"
                        value={password}
                        onChange={(event) =>
                            setPassword(event.target.value)
                        }
                        minLength={8}
                        maxLength={72}
                        autoComplete="new-password"
                        required
                    />
                </div>

                <label htmlFor="confirmPassword">
                    Xác nhận mật khẩu
                </label>
                <div className="login-input">
                    <LockKeyhole size={18} />
                    <input
                        id="confirmPassword"
                        type="password"
                        placeholder="Nhập lại mật khẩu"
                        value={confirmPassword}
                        onChange={(event) =>
                            setConfirmPassword(event.target.value)
                        }
                        minLength={8}
                        maxLength={72}
                        autoComplete="new-password"
                        required
                    />
                </div>

                {error && (
                    <p className="login-error">{error}</p>
                )}

                {success && (
                    <p className="register-success">
                        {success}
                    </p>
                )}

                <button
                    className="login-button"
                    type="submit"
                    disabled={loading}
                >
                    {loading ? "Đang đăng ký..." : "Đăng ký"}
                </button>

                <p className="login-note">
                    Đã có tài khoản?{" "}
                    <button
                        type="button"
                        className="auth-link"
                        onClick={onSwitchToLogin}
                    >
                        Đăng nhập
                    </button>
                </p>
            </form>
        </main>
    );
}

export default Register;
