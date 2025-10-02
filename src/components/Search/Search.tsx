import styles from "./Search.module.css"

export function Search() {
    return (
        <div className={styles.search}>
            <input 
                type="text" 
                className={styles.input} 
                placeholder="Введите текст..." 
            />
            <button className={styles.btn}>
                <img src={`${import.meta.env.BASE_URL}/search.svg`} />
            </button>
        </div>
    )
}
