import styles from "./StatusText.module.css"

type StatusTextProps = {
    text: string;
    isAnimated?: boolean
};

export function StatusText({ text, isAnimated }: StatusTextProps) {
    return(
        <div className={`${styles.status_text} ${(isAnimated ? styles.animated : "")}`}>{ text }</div>
    )
}
