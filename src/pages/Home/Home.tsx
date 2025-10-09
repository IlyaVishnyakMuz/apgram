import { useState, useEffect } from "react";
import { PostItems } from "../../components/PostItems/PostItems";
import { Topbar } from "../../components/TopBar/Topbar";
import { StatusText } from "../../components/StatusText/StatusText";
import { generatePosts, getStoredPosts } from "../../app/api";
import type { Post } from "../../entities/post";

export function Home() {
  const [generatedPosts, setGeneratedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string | null>(null);

  const userId = Number(localStorage.getItem("user_id"));
  const token = localStorage.getItem("auth_token");

  // 🔹 Загрузка сохранённых постов
  const getPosts = async () => {
    if (!userId || !token) return;
    setLoading(true);
    setError(null);

    try {
      const response = await getStoredPosts(userId, token);
      setGeneratedPosts(response);
    } catch (e: any) {
      console.error("Ошибка загрузки постов:", e);
      setError(e.message || "Ошибка при получении постов");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Генерация постов (с prompt)
  const fetchData = async (customPrompt?: string) => {
    if (!userId || !token) return;
    setLoading(true);
    setError(null);

    try {
      const response = customPrompt
        ? await generatePosts(userId, token, customPrompt)
        : await generatePosts(userId, token, prompt || "");
      setGeneratedPosts(response);
      setPrompt(null);
    } catch (e: any) {
      console.error("Ошибка генерации постов:", e);
      setError(e.message || "Ошибка при генерации постов");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Обработка поиска (из Search)
  const handleSearch = (text: string) => {
    setPrompt(text);
    fetchData(text);
  };

  useEffect(() => {
    getPosts();
  }, []);

  return (
    <>
      <Topbar onRefresh={() => fetchData()} onSearch={handleSearch} />

      {loading ? (
        <StatusText text="Загрузка..." isAnimated={true} />
      ) : error ? (
        <StatusText text={error} />
      ) : generatedPosts.length === 0 ? (
        <StatusText text="Постов пока нет" />
      ) : (
        <PostItems posts={generatedPosts} />
      )}
    </>
  );
}
