import { useState } from "react";
import styles from "./Login.module.css";

export function Login() {
    const [isLogin, setIsLogin] = useState(true);

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
                    <input type="text" placeholder="Логин" />
                    <input type="password" placeholder="Пароль" />

                    {!isLogin && (
                        <>
                            <input type="text" placeholder="Токен бота" />
                            <input type="text" placeholder="Телеграм канал" />
                        </>
                    )}
                </div>

                <div className={styles.button}>
                    <button>{isLogin ? "ВОЙТИ" : "ЗАРЕГИСТРИРОВАТЬСЯ"}</button>
                </div>
            </div>
        </div>
    );
}
