import { useEffect, useState, useRef } from "react";
import type { Post } from "../../entities/post";
import { getUserPosts } from "../../app/api";
import styles from "./Posts.module.css";
import { PostItem } from "../../components/PostItem/PostItem";
import { Actions } from "../../entities/actions";
import { StatusText } from "../../components/StatusText/StatusText";

export function Posts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  // 📥 загрузка постов с сервера (использует userId + token)
  async function loadPosts() {
    try {
      const userIdStr = localStorage.getItem("user_id");
      const token = localStorage.getItem("auth_token") || "";
      if (!userIdStr || !token) {
        setPosts([]);
        return;
      }
      const userId = Number(userIdStr);
      const data = await getUserPosts(userId, token);
      setPosts(data);
    } catch (err) {
      console.error("Ошибка при загрузке постов:", err);
    }
  }

  // 🔌 динамическое определение WebSocket URL
  function getWsUrl() {
    if (window.location.hostname.includes("render.com")) {
      return "wss://apgram-backend.onrender.com";
    }
    return "ws://localhost:4000";
  }

  // 🔌 подключение к WebSocket
  function connectWebSocket() {
    const ws = new WebSocket(getWsUrl());
    wsRef.current = ws;

    ws.onopen = () => console.log("🟢 WS подключен");

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === "posts_updated") {
          console.log("📡 Обновление получено по WS");
          loadPosts(); // 🔄 обновляем список
        }
      } catch (err) {
        console.error("Ошибка WS-сообщения:", err);
      }
    };

    ws.onclose = () => {
      console.warn("🔴 WS отключён, переподключение через 3 сек...");
      setTimeout(connectWebSocket, 3000); // авто-переподключение
    };

    ws.onerror = (err) => {
      console.error("Ошибка WS:", err);
      ws.close();
    };
  }

  // 🧠 инициализация
  useEffect(() => {
    loadPosts();
    connectWebSocket();

    return () => {
      wsRef.current?.close();
    };
  }, []);

  return (
    <>
      {posts.length > 0 ? (
        <div className={styles.items}>
          {posts.map((post) => (
            <PostItem
              key={post.id}
              post={post}
              actions={[Actions.Calendar, Actions.Send]}
              onUpdate={loadPosts}
            />
          ))}
        </div>
      ) : (
        <StatusText text="Пока постов нет..." />
      )}
    </>
  );
}
