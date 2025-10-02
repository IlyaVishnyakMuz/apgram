import { useEffect, useState } from "react"
import { PostItem } from "../PostItem/PostItem"
import styles from "./PostItems.module.css"
import { generateNews } from "../../app/api"
import type { Post } from "../../entities/post"

export function PostItems() {
    const [generatedPosts, setGeneratedPosts] = useState<Post[]>([])

    useEffect(() => {
        const fetchData = async () => {
            const response = await generateNews();
            console.log(response);
            setGeneratedPosts(response);
        };

        fetchData();
    }, []);

    return (
        <div className={styles.items}>
            {generatedPosts.length > 0 ? (
                generatedPosts.map((post, index) => (
                    <PostItem key={index} post={post} />
                ))
            ) : (
                <p>Нет постов</p>
            )}
        </div>
    )
}
