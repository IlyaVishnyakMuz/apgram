import styles from "./Settings.module.css";
import { Action } from "../../components/Action/Action";
import { useState, useEffect } from "react";
import type { ChangeEvent } from "react";
import {
  getUserSettings,
  updateUserSettings,
} from "../../app/api";

type Channel = { url: string };
type Site = { url: string };

export function Settings() {
  const [username, setUsername] = useState("");

  // Основные поля
  const [botApi, setBotApi] = useState("");
  const [channelData, setChannelData] = useState("");

  // Генерационные настройки
  const [fromPrevPosts, setFromPrevPosts] = useState(false);
  const [isChannels, setIsChannels] = useState(false);
  const [isSites, setIsSites] = useState(false);
  const [withImages, setWithImages] = useState(false);

  // Списки
  const [channels, setChannels] = useState<Channel[]>([{ url: "" }]);
  const [sites, setSites] = useState<Site[]>([{ url: "" }]);

  // Служебные состояния
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);

  const userId = Number(localStorage.getItem("user_id"));
  const token = localStorage.getItem("auth_token");

  // --- 📥 Загрузка настроек пользователя ---
  useEffect(() => {
    async function fetchSettings() {
      if (!userId || !token) return;
      setLoading(true);
      try {
        const res = await getUserSettings(userId, token);
        if (res.success && res.settings) {
          const s = res.settings;

          setUsername(s.username || "Пользователь");
          setBotApi(s.telegram_token || "");
          setChannelData(s.channel_id || "");

          // 📥 Подставляем значения чекбоксов
          setFromPrevPosts(!!s.use_own_posts);
          setIsChannels(!!s.use_other_channels);
          setIsSites(!!s.use_sites);
          setWithImages(!!s.add_images);

          // 📥 Подставляем списки
          setChannels(s.channels_list?.length ? s.channels_list : [{ url: "" }]);
          setSites(s.sites_list?.length ? s.sites_list : [{ url: "" }]);
        }
      } catch (e) {
        console.error("Ошибка загрузки настроек:", e);
      } finally {
        setLoading(false);
      }
    }

    fetchSettings();
  }, []);

  // --- 📤 Сохранение настроек ---
  async function handleSave() {
    if (!userId || !token) return;
    setLoading(true);
    setMessage("");
    setIsSuccess(null);

    try {
      // 🔍 ВАЛИДАЦИЯ
      if (!botApi.trim()) {
        setMessage("Укажите токен бота");
        setIsSuccess(false);
        setLoading(false);
        return;
      }

      if (!channelData.trim()) {
        setMessage("Укажите телеграм-канал");
        setIsSuccess(false);
        setLoading(false);
        return;
      }

      // Если выбран режим генерации с сайтов — проверяем все сайты
      if (isSites) {
        const invalidSites = sites.some(
          (s) =>
            !s.url.trim() ||
            !/^https?:\/\/[a-zA-Z0-9.-]+\.[a-z]{2,}.*$/.test(s.url.trim())
        );
        if (invalidSites) {
          setMessage("Заполните корректные адреса сайтов (пример: https://site.com)");
          setIsSuccess(false);
          setLoading(false);
          return;
        }
      }

      // Если выбран режим генерации с каналов — проверяем все каналы
      if (isChannels) {
        const invalidChannels = channels.some(
          (c) => !c.url.trim()
        );
        if (invalidChannels) {
          setMessage("Заполните ссылки или никнеймы каналов");
          setIsSuccess(false);
          setLoading(false);
          return;
        }
      }

      // ✅ Если всё ок — отправляем
      const settings = {
        telegram_token: botApi,
        channel_id: channelData,
        add_images: withImages,
        use_own_posts: fromPrevPosts,
        use_other_channels: isChannels,
        use_sites: isSites,
        channels_list: channels,
        sites_list: sites,
      };

      const res = await updateUserSettings(userId, settings, token);
      if (res.success) {
        setMessage("Настройки успешно сохранены");
        setIsSuccess(true);
      } else {
        setMessage("Не удалось сохранить настройки");
        setIsSuccess(false);
      }
    } catch (e) {
      console.error("Ошибка сохранения настроек:", e);
      setMessage("Ошибка при сохранении");
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  }

  // --- Обработчики чекбоксов ---
  const onIsChannelsChange = (e: ChangeEvent<HTMLInputElement>) =>
    setIsChannels(e.target.checked);

  const onIsSitesChange = (e: ChangeEvent<HTMLInputElement>) =>
    setIsSites(e.target.checked);

  const onPrevPostsChange = (e: ChangeEvent<HTMLInputElement>) =>
    setFromPrevPosts(e.target.checked);

  const onWithImagesChange = (e: ChangeEvent<HTMLInputElement>) => {
    setWithImages(e.target.checked);
  }

  // --- Обработчики списков ---
  const addChannel = () => setChannels((prev) => [...prev, { url: "" }]);
  const removeChannel = (index: number) =>
    setChannels((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      return updated.length === 0 ? [{ url: "" }] : updated;
    });
  const handleChannelChange = (e: ChangeEvent<HTMLInputElement>, index: number) =>
    setChannels((prev) =>
      prev.map((ch, i) => (i === index ? { ...ch, url: e.target.value } : ch))
    );

  const addSite = () => setSites((prev) => [...prev, { url: "" }]);
  const removeSite = (index: number) =>
    setSites((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      return updated.length === 0 ? [{ url: "" }] : updated;
    });
  const handleSiteChange = (e: ChangeEvent<HTMLInputElement>, index: number) =>
    setSites((prev) =>
      prev.map((s, i) => (i === index ? { ...s, url: e.target.value } : s))
    );

  // --- UI ---
  return (
    <div className={styles.settings}>
      <h1 className={styles.title}>Привет, {username}!</h1>

      <div className={styles.block}>
        <h2 className={styles.subtitle}>ОСНОВНЫЕ НАСТРОЙКИ</h2>
        <div className={styles.block_content}>
          <div className={styles.input}>
            <input
              type="text"
              placeholder="Токен бота"
              value={botApi}
              onChange={(e) => setBotApi(e.target.value)}
            />
          </div>
          <div className={styles.input}>
            <input
              type="text"
              placeholder="Телеграмм канал"
              value={channelData}
              onChange={(e) => setChannelData(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className={styles.block}>
        <h2 className={styles.subtitle}>ГЕНЕРАЦИЯ</h2>
        <div className={styles.block_content}>
          <label className={styles.label}>
            <input
              type="checkbox"
              checked={fromPrevPosts}
              onChange={onPrevPostsChange}
            />
            <span>НА ОСНОВЕ ПРЕДЫДУЩИХ ПОСТОВ</span>
          </label>
          <label className={styles.label}>
            <input
              type="checkbox"
              checked={isChannels}
              onChange={onIsChannelsChange}
            />
            <span>НА ОСНОВЕ ДРУГИХ КАНАЛОВ</span>
          </label>
          <label className={styles.label}>
            <input
              type="checkbox"
              checked={isSites}
              onChange={onIsSitesChange}
            />
            <span>НА ОСНОВЕ САЙТОВ</span>
          </label>
          <label className={styles.label}>
            <input
              type="checkbox"
              checked={withImages}
              onChange={onWithImagesChange}
            />
            <span>ДОБАВЛЯТЬ КАРТИНКИ</span>
          </label>
        </div>
      </div>

      <div className={`${styles.block} ${!isSites ? styles.hidden : ""}`}>
        <h2 className={styles.subtitle}>САЙТЫ</h2>
        <div className={styles.block_content}>
          {sites.map((item, index) => (
            <div key={index} className={styles.input}>
              <input
                type="text"
                placeholder="https://название_сайта.домен"
                value={item.url}
                onChange={(e) => handleSiteChange(e, index)}
              />
              {index === sites.length - 1 ? (
                <Action icon="add" onClick={addSite} />
              ) : (
                <Action icon="trash" onClick={() => removeSite(index)} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className={`${styles.block} ${!isChannels ? styles.hidden : ""}`}>
        <h2 className={styles.subtitle}>КАНАЛЫ</h2>
        <div className={styles.block_content}>
          {channels.map((item, index) => (
            <div key={index} className={styles.input}>
              <input
                type="text"
                placeholder="Ссылка или никнейм канала"
                value={item.url}
                onChange={(e) => handleChannelChange(e, index)}
              />
              {index === channels.length - 1 ? (
                <Action icon="add" onClick={addChannel} />
              ) : (
                <Action icon="trash" onClick={() => removeChannel(index)} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className={styles.bottom}>
        {message && (
            <div
            className={`${styles.message} ${
                isSuccess === true
                ? styles.success
                : isSuccess === false
                ? styles.error
                : ""
            }`}
            >
            {message}
            </div>
        )}
        <button onClick={handleSave} disabled={loading}>
          {loading ? "СОХРАНЕНИЕ..." : "СОХРАНИТЬ"}
        </button>
      </div>
    </div>
  );
}
