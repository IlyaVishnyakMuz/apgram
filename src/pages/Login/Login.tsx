import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Login.module.css";
import { loginUser, registerUser, logout } from "../../app/api";

export function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [telegramToken, setTelegramToken] = useState("");
  const [channelId, setChannelId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    logout();
  }, []);

  async function handleSubmit() {
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        const res = await loginUser({ username, password });
        if (!res.success) throw new Error(res.message || "Ошибка входа");

        localStorage.setItem("auth_token", res.auth_token);
        localStorage.setItem("user_id", res.userId.toString());
        navigate("/");
      } else {
        const res = await registerUser({
          username,
          password,
          telegram_token: telegramToken,
          channel_id: channelId,
        });
        if (!res.success) throw new Error(res.message || "Ошибка регистрации");

        localStorage.setItem("auth_token", res.auth_token);
        localStorage.setItem("user_id", res.userId.toString());
        navigate("/");
      }
    } catch (e: any) {
      console.error("Ошибка входа/регистрации:", e);
      setError(e.message || "Произошла ошибка");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.login_wrapper}>
      <div className={styles.login}>
        <h1 className={styles.title}>.APostgram</h1>

        <div className={styles.tabs}>
          <div
            className={`${styles.tab} ${isLogin ? styles.active : ""}`}
            onClick={() => setIsLogin(true)}
          >
            ЛОГИН
          </div>
          <div
            className={`${styles.tab} ${!isLogin ? styles.active : ""}`}
            onClick={() => setIsLogin(false)}
          >
            РЕГИСТРАЦИЯ
          </div>
        </div>

        <div className={styles.content}>
          <input
            type="text"
            placeholder="Логин"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {!isLogin && (
            <>
              <input
                type="text"
                placeholder="Токен бота"
                value={telegramToken}
                onChange={(e) => setTelegramToken(e.target.value)}
              />
              <input
                type="text"
                placeholder="Телеграм канал (например, @mychannel)"
                value={channelId}
                onChange={(e) => setChannelId(e.target.value)}
              />
            </>
          )}
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.button}>
          <button onClick={handleSubmit} disabled={loading}>
            {loading
              ? "Загрузка..."
              : isLogin
              ? "ВОЙТИ"
              : "ЗАРЕГИСТРИРОВАТЬСЯ"}
          </button>
        </div>
      </div>
    </div>
  );
}
