import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getPosts,
  updatePost,
  addPost,
  sendPostToTelegram,
  schedulePost,
  cancelScheduledPost,
  setChosen,
  uploadImage,
  deleteImageFromPost, // ✅ добавлено
} from "../../app/api";
import type { Post } from "../../entities/post";
import { Actions } from "../../entities/actions";
import { StatusText } from "../../components/StatusText/StatusText";
import { Action } from "../../components/Action/Action";
import { DateText } from "../../components/DateText/DateText";
import { CustomDatePicker } from "../../components/CustomDatePicker/CustomDatePicker";
import styles from "./Detail.module.css";

export function Detail() {
  const { id } = useParams();
  const numericId = useMemo(() => Number(id), [id]);
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actions, setActions] = useState<string[]>([]);
  const [isTitleEditing, setIsTitleEditing] = useState(false);
  const [isDescEditing, setIsDescEditing] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const navigate = useNavigate();

  const titleTextareaRef = useRef<HTMLTextAreaElement>(null);
  const descTextareaRef = useRef<HTMLTextAreaElement>(null);
  const descDisplayRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isFromBackend = actions.includes(Actions.Send);

  const setTextareaHeightFromDisplay = useCallback(() => {
    const ta = descTextareaRef.current;
    const display = descDisplayRef.current;
    if (!ta) return;
    if (display) {
      const h = display.offsetHeight;
      if (h > 0) ta.style.height = `${h}px`;
    } else {
      ta.style.height = "auto";
      ta.style.height = `${ta.scrollHeight}px`;
    }
  }, []);

  const setTitleTextareaHeight = useCallback(() => {
    const ta = titleTextareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${ta.scrollHeight}px`;
  }, []);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:4000");

    ws.onmessage = async (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === "posts_updated") {
          const backendPosts = await getPosts();
          const exists = backendPosts.some((p) => p.id === numericId);
          if (!exists) navigate(-1);
        }
      } catch (err) {
        console.error("Ошибка WS:", err);
      }
    };

    return () => ws.close();
  }, [numericId, navigate]);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        setLoading(true);
        setError(null);

        const saved = localStorage.getItem("generatedPosts");
        if (saved) {
          const arr: Post[] = JSON.parse(saved);
          const found = arr.find((p) => p.id === numericId);
          if (found && isMounted) {
            setPost(found);
            setActions([Actions.Add]);
            setLoading(false);
            return;
          }
        }

        const backendPosts = await getPosts();
        const backendFound = backendPosts.find((p) => p.id === numericId) || null;
        if (isMounted) {
          setPost(backendFound);
          setActions(backendFound ? [Actions.Calendar, Actions.Send] : []);
          if (backendFound?.scheduledAt) {
            setSelectedDate(new Date(backendFound.scheduledAt));
          }
        }
      } catch (e) {
        if (isMounted) setError("Не удалось загрузить пост");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    if (!Number.isFinite(numericId)) {
      setError("Некорректный ID");
      setLoading(false);
      return;
    }

    load();
    return () => {
      isMounted = false;
    };
  }, [numericId]);

  useEffect(() => {
    requestAnimationFrame(setTextareaHeightFromDisplay);
  }, [post?.description, isDescEditing, setTextareaHeightFromDisplay]);

  async function handleAdd() {
    if (!post) return;
    await addPost(post.title, post.description, post.url || null);
    setChosen(post.id);
  }

  async function handleSend() {
    if (!post) return;
    try {
      await sendPostToTelegram(post.id);
    } catch (err) {
      console.error("Ошибка при отправке поста:", err);
      alert("Ошибка при отправке поста");
    }
  }

  async function handleDateSelect(date: Date | null) {
    if (!date || !post) return;
    setSelectedDate(date);
    setIsOpen(false);
    try {
      await schedulePost(post.id, date.toISOString());
    } catch (err) {
      console.error(err);
      alert("Ошибка при назначении времени");
    }
  }

  async function handleCancelSchedule() {
    if (!selectedDate || !post) return;
    try {
      await cancelScheduledPost(post.id);
      setSelectedDate(null);
    } catch (err) {
      console.error(err);
      alert("Ошибка при отмене");
    }
  }

  const handleUpdate = useCallback(async () => {
    if (!post) return;
    await updatePost(numericId, post.title, post.description, post.url || null);
  }, [numericId, post]);

  // ✅ загрузка новой картинки
  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!post) return;
    const file = e.target.files?.[0];
    if (!file) return;

    const MAX_SIZE_MB = 10;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      alert(`Размер файла превышает ${MAX_SIZE_MB} МБ. Выберите файл поменьше.`);
      e.target.value = "";
      return;
    }

    try {
      const imageUrl = await uploadImage(file);
      const updatedPost = { ...post, url: imageUrl };
      setPost(updatedPost);
      await updatePost(numericId, updatedPost.title, updatedPost.description, imageUrl);
    } catch (err) {
      console.error("Ошибка при загрузке картинки:", err);
      alert("Не удалось загрузить изображение");
    } finally {
      e.target.value = "";
    }
  }

  // ✅ удалить картинку
  async function handleDeleteImage() {
    if (!post) return;
    try {
      await deleteImageFromPost(post.id);
      setPost({ ...post, url: null });
    } catch (err) {
      console.error("Ошибка при удалении картинки:", err);
      alert("Не удалось удалить картинку");
    }
  }

  if (loading) return <StatusText text="Загрузка..." isAnimated />;
  if (error) return <StatusText text={error} />;
  if (!post) return <StatusText text="Пост не найден" />;

  const propsMap = {
    [Actions.Add]: { icon: "add", onClick: handleAdd, visible: true },
    [Actions.Calendar]: { icon: "calendar", onClick: () => setIsOpen(!isOpen), visible: true },
    [Actions.Send]: { icon: "send", onClick: handleSend, visible: true },
  };

  const formatDate = (date: Date) => {
    const d = date.getDate().toString().padStart(2, "0");
    const m = (date.getMonth() + 1).toString().padStart(2, "0");
    const y = date.getFullYear();
    const h = date.getHours().toString().padStart(2, "0");
    const min = date.getMinutes().toString().padStart(2, "0");
    return `${d}.${m}.${y} ${h}:${min}`;
  };

  return (
    <div className={styles.detail}>
      <div className={styles.detail_top}>
        <div className={styles.detail_top_content}>
          <Action icon="back" onClick={() => navigate(-1)} />
          <div className={styles.detail_top_actions}>
            {actions.map((a, i) => {
              const cfg = propsMap[a];
              return cfg?.visible ? <Action key={i} icon={cfg.icon} onClick={cfg.onClick} /> : null;
            })}
          </div>
        </div>

        {isFromBackend && (
          <div className={styles.detail_top_img_buttons}>
            <button
              className={styles.detail_top_img_button}
              onClick={() => fileInputRef.current?.click()}
            >
              {post.url ? "Заменить" : "Выбрать"}
            </button>

            {!!post.url && (
              <button
                className={styles.detail_top_img_button}
                onClick={handleDeleteImage}
              >
                Удалить
              </button>
            )}
          </div>
        )}


        {/* ✅ безопасный рендер картинки */}
        {!!post.url && typeof post.url === "string" && post.url.trim() !== "" && (
          <img src={post.url} alt={post.title} className={styles.img} />
        )}

        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleImageChange}
        />
      </div>

      <div className={styles.detail_content}>
        {selectedDate && <DateText text={formatDate(selectedDate)} />}

        <textarea
          ref={titleTextareaRef}
          className={`${styles.title_textarea} ${isFromBackend && isTitleEditing ? "" : styles.hidden}`}
          value={post.title}
          onChange={(e) => {
            setPost({ ...post, title: e.target.value });
            requestAnimationFrame(setTitleTextareaHeight);
          }}
          onBlur={() => {
            if (isFromBackend) handleUpdate();
            setIsTitleEditing(false);
          }}
          readOnly={!isFromBackend}
          rows={1}
        />

        <h1
          className={`${styles.title} ${isTitleEditing && isFromBackend ? styles.hidden : ""} ${
            isFromBackend ? styles.is_backend : ""
          }`}
          onClick={() => {
            if (!isFromBackend) return;
            setIsTitleEditing(true);
            requestAnimationFrame(() => {
              setTitleTextareaHeight();
              titleTextareaRef.current?.focus();
            });
          }}
        >
          {post.title}
        </h1>

        <textarea
          ref={descTextareaRef}
          className={`${styles.description_input} ${isFromBackend && isDescEditing ? "" : styles.hidden}`}
          value={post.description}
          onChange={(e) => {
            setPost({ ...post, description: e.target.value });
            requestAnimationFrame(setTextareaHeightFromDisplay);
          }}
          onBlur={() => {
            if (isFromBackend) handleUpdate();
            setIsDescEditing(false);
          }}
          readOnly={!isFromBackend}
        />

        <div
          ref={descDisplayRef}
          className={`${styles.description} ${isDescEditing && isFromBackend ? styles.hidden : ""} ${
            isFromBackend ? styles.is_backend : ""
          }`}
          onClick={() => {
            if (!isFromBackend) return;
            setIsDescEditing(true);
            requestAnimationFrame(() => {
              setTextareaHeightFromDisplay();
              descTextareaRef.current?.focus();
            });
          }}
        >
          {post.description}
        </div>
      </div>

      {isOpen && (
        <CustomDatePicker
          selectedDate={selectedDate}
          setSelectedDate={handleDateSelect}
          setIsOpen={setIsOpen}
          onCancelSchedule={handleCancelSchedule}
        />
      )}
    </div>
  );
}
