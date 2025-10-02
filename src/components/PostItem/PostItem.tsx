import { Action } from "../Action/Action"
import styles from "./PostItem.module.css"

export function PostItem() {
    return(
        <div className={styles.item}>
            <div className={styles.top}>
                <div className={styles.actions}>
                    <Action icon="play" />
                </div>
                <img src="https://preview.redd.it/a-beautiful-painting-of-the-ruins-v0-vmd25szzbmza1.jpg?width=640&crop=smart&auto=webp&s=9b11514f5583038f81bed1ad6b8d8c2bb7575ea4" className={styles.img} />
            </div>
            <div className={styles.content}>
                <h3 className={styles.title}>Самый крутой заголовок в мире</h3>
                <div className={styles.description}>Lorem ipsum dolor sit amet consectetur adipisicing elit. Eligendi similique iure aperiam exercitationem dolorum laudantium harum iusto magni sit, excepturi nesciunt facere fugit nemo fugiat voluptate. Cumque repellendus facilis illo dolores, ducimus voluptatibus, assumenda quaerat provident architecto et minima ut.Ω</div>
            </div>
        </div>
    )
}
