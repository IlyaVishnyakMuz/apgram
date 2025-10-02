import { Outlet } from "react-router-dom";
import { Sidebar } from "../components/Sidebar/Sidebar";
import styles from "./Layout.module.css";

export function Layout() {
    return(
        <div className={styles.main}>
            <Sidebar />
            <div className={styles.content}>
                <Outlet />
            </div>
        </div>
    )
}