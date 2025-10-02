import { Link, NavLink } from "react-router-dom";
import styles from "./Sidebar.module.css";

export function Sidebar() {
    return(
        <aside className={styles.sidebar}>
            <div className={styles.logo}>
                <Link to="/">.APostgram</Link>
            </div>
            <ul>
                <li>
                    <NavLink to="/" className={({ isActive }) => (isActive ? styles.active : "")}>СГЕНЕРИРОВАТЬ</NavLink>
                </li>
                <li>
                    <NavLink to="/posts/" className={({ isActive }) => (isActive ? styles.active : "")}>ПОСТЫ</NavLink>
                </li>
            </ul>
        </aside>
    )
}
