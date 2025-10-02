import { Action } from "../Action/Action"
import styles from "./PostItem.module.css"
import type { Post } from "../../entities/post"

export function PostItem({post}: {post: Post}) {
    return(
        <div className={styles.item}>
            <div className={styles.top}>
                <div className={styles.actions}>
                    <Action icon="play" />
                </div>
                <img src={post.url} className={styles.img} />
            </div>
            <div className={styles.content}>
                <h3 className={styles.title}>{post.title}</h3>
                <div className={styles.description}>{post.description}</div>
            </div>
        </div>
    )
}
