import { Action } from "../Action/Action";
import styles from "./PostItem.module.css";
import type { Post } from "../../entities/post";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  addPost,
  sendPostToTelegram,
  schedulePost,
  cancelScheduledPost,
  setChosen,
} from "../../app/api";
import { Actions } from "../../entities/actions";
import { DateText } from "../DateText/DateText";
import { CustomDatePicker } from "../CustomDatePicker/CustomDatePicker";

type PostItemProps = {
  post: Post;
  actions: string[];
  onUpdate?: () => void;
};

export function PostItem({ post, actions, onUpdate }: PostItemProps) {
  const [isChosen, setIsChosen] = useState(post.chosen);
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    post.scheduledAt ? new Date(post.scheduledAt) : null
  );
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const formatDate = (date: Date) => {
    const d = date.getDate().toString().padStart(2, "0");
    const m = (date.getMonth() + 1).toString().padStart(2, "0");
    const y = date.getFullYear();
    const h = date.getHours().toString().padStart(2, "0");
    const min = date.getMinutes().toString().padStart(2, "0");
    return `${d}.${m}.${y} ${h}:${min}`;
  };

  // ✅ Добавление поста в БД
  async function addToPosts() {
    try {
      await addPost(post.title, post.description, post.url || null);
      setChosen(post.id);
      setIsChosen(true);
      onUpdate?.();
    } catch (err) {
      console.error("Ошибка при добавлении поста:", err);
      alert("Не удалось добавить пост");
    }
  }

  // ✅ Отправка поста в Telegram (без удаления на фронте!)
  async function sendPost() {
    try {
      await sendPostToTelegram(post.id);
      onUpdate?.(); // бекенд сам удалит и WS обновит
    } catch (err) {
      console.error("Ошибка при отправке поста:", err);
      alert("Не удалось отправить пост");
    }
  }

  // ✅ Назначение даты
  async function handleDateSelect(date: Date | null) {
    if (!date) return;
    setSelectedDate(date);
    setIsOpen(false);

    const iso = date.toISOString();
    try {
      await schedulePost(post.id, iso);
      onUpdate?.();
    } catch (err) {
      console.error(err);
      alert("Ошибка при назначении времени");
    }
  }

  // ✅ Отмена запланированной отправки
  async function handleCancelSchedule() {
    if (!selectedDate) return;
    try {
      await cancelScheduledPost(post.id);
      setSelectedDate(null);
      onUpdate?.();
    } catch (err) {
      console.error(err);
      alert("Ошибка при отмене отправки");
    }
  }

  // --- UI ---
  return (
    <div className={`${styles.item} ${isChosen ? styles.added : ""}`}>
      <div className={styles.top}>
        <div className={styles.actions}>
          {actions.map((action, index) => {
            const propsMap = {
              [Actions.Add]: {
                icon: "add",
                onClick: addToPosts,
                visible: !isChosen,
              },
              [Actions.Calendar]: {
                icon: "calendar",
                onClick: () => setIsOpen(!isOpen),
                visible: true,
              },
              [Actions.Send]: {
                icon: "send",
                onClick: sendPost,
                visible: true,
              },
            };

            const cfg = propsMap[action];
            return cfg?.visible ? (
              <Action key={index} icon={cfg.icon} onClick={cfg.onClick} />
            ) : null;
          })}
        </div>

        {/* ✅ безопасный рендер картинки */}
        {!!post.url && typeof post.url === "string" && post.url.trim() !== "" && (
          <img
            src={post.url}
            className={styles.img}
            onClick={() => navigate(`/detail/${post.id}`)}
            style={{ cursor: "pointer" }}
          />
        )}
      </div>

      <div className={styles.content}>
        <h3
          className={styles.title}
          onClick={() => navigate(`/detail/${post.id}`)}
          style={{ cursor: "pointer" }}
        >
          {post.title}
        </h3>
        <div className={styles.description}>{post.description}</div>

        {selectedDate && <DateText text={formatDate(selectedDate)} />}

        {isOpen && (
          <CustomDatePicker
            selectedDate={selectedDate}
            setSelectedDate={handleDateSelect}
            setIsOpen={setIsOpen}
            onCancelSchedule={handleCancelSchedule}
          />
        )}
      </div>
    </div>
  );
}
