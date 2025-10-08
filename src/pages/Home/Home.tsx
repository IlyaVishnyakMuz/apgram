import { PostItems } from "../../components/PostItems/PostItems";
import { Topbar } from "../../components/TopBar/Topbar";
import { useState, useEffect } from "react";
import { generatePosts, getStoredPosts } from "../../app/api";
import type { Post } from "../../entities/post";

export function Home() {
    const [generatedPosts, setGeneratedPosts] = useState<Post[]>([])

    const getPosts = async () => {
        setGeneratedPosts([]);
        const response = await getStoredPosts();
        console.log(response);
        setGeneratedPosts(response);
    };
    
    const fetchData = async () => {
        setGeneratedPosts([]);
        const response = await generatePosts();
        console.log(response);
        setGeneratedPosts(response);
    };

    useEffect(() => {
        getPosts();
    }, []);

    return(
        <>
            <Topbar onRefresh={fetchData} />
            <PostItems posts={generatedPosts} />
        </>
    )
}
