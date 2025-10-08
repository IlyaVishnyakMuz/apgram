import styles from "./DateText.module.css"

type DateTextProps = {
    text: string
}

export function DateText({text}: DateTextProps) {
    return (
        <div className={styles.datetext}>{text}</div>
    )
}
