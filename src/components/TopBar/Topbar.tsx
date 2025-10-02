import { Action } from "../Action/Action"
import { Search } from "../Search/Search";
import styles from "./Topbar.module.css";

export function Topbar() {
    return (
        <div className={styles.topbar}>
            <Search />
            <Action icon="refresh" />
        </div>
    )
}
