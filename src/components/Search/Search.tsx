import { useState } from "react";
import styles from "./Search.module.css";

interface SearchProps {
  onSearch: (text: string) => void;
}

export function Search({ onSearch }: SearchProps) {
  const [text, setText] = useState("");

  const handleSearch = () => {
    if (text) onSearch(text);
    setText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className={styles.search}>
      <input
        type="text"
        className={styles.input}
        placeholder="Введите тему для постов..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button className={styles.btn} onClick={handleSearch}>
        <img src={`${import.meta.env.BASE_URL}/search.svg`} />
      </button>
    </div>
  );
}
