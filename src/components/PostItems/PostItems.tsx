import { PostItem } from "../PostItem/PostItem"
import styles from "./PostItems.module.css"

export function PostItems() {
    return(
        <div className={styles.items}>
            <PostItem />
            <PostItem />
            <PostItem />
            <PostItem />
        </div>
    )
}
