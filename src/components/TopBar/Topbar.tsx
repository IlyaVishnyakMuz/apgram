import { Action } from "../Action/Action"
import { Search } from "../Search/Search";
import styles from "./Topbar.module.css";

type TopbarProps = {
  onRefresh: () => void;
};

export function Topbar({ onRefresh }: TopbarProps) {
    return (
        <div className={styles.topbar}>
            <Search />
            <Action icon="refresh" onClick={onRefresh} />
        </div>
    )
}
