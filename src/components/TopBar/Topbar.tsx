import { Action } from "../Action/Action";
import { Search } from "../Search/Search";
import styles from "./Topbar.module.css";

type TopbarProps = {
  onRefresh: () => void;
  onSearch?: (text: string) => void;
};

export function Topbar({ onRefresh, onSearch }: TopbarProps) {
  return (
    <div className={styles.topbar}>
      <Search onSearch={onSearch || (() => {})} />
      <Action icon="refresh" onClick={onRefresh} /> {/* 🔥 refresh тут */}
    </div>
  );
}
