import { PostItem } from "../PostItem/PostItem"
import styles from "./PostItems.module.css"
import type { Post } from "../../entities/post"
import { Actions } from "../../entities/actions"
import { StatusText } from "../StatusText/StatusText";

type PostItemsProps = {
    posts: Post[];
};

export function PostItems({ posts }: PostItemsProps) {
    return (
        <>
            {
                posts.length > 0 ? (
                <div className={styles.items}>
                    {
                        posts.map((post, index) => (
                            <PostItem key={index} post={post} actions={[Actions.Add]} />
                        ))
                    }
                </div>
                ) : (
                    <StatusText text="Загрузка..." isAnimated={true} />
                )
            }
        </>
    )
}
