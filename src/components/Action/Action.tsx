import styles from "./Action.module.css"

type ActionProps = {
  icon: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export function Action({icon, ...props}: ActionProps) {
    return (
        <button {...props} className={`${styles.action}`}>
            <img src={`${import.meta.env.BASE_URL}/${icon}.svg`} />
        </button>
    )
}
