import styles from "./Settings.module.css";
import { Action } from "../../components/Action/Action";
import { useState } from "react";
import type { ChangeEvent } from "react";

type Channel = { url: string };
type Site = { url: string };

export function Settings() {
    const [isChannels, setIsChannels] = useState(false);
    const [isSites, setIsSites] = useState(false);
    const [channels, setChannels] = useState<Channel[]>([{ url: "" }]);
    const [sites, setSites] = useState<Site[]>([{ url: "" }]);
    const [botApi, setBotApi] = useState("");
    const [channelData, setChannelData] = useState("");

    function onIsChannelsChange(e: ChangeEvent<HTMLInputElement>) {
        setIsChannels(e.target.checked);
    }

    function onIsSitesChange(e: ChangeEvent<HTMLInputElement>) {
        setIsSites(e.target.checked);
    }

    function addChannel() {
        setChannels((prev) => [...prev, { url: "" }]);
    }

    function removeChannel(index: number) {
        setChannels((prev) => {
            const updated = prev.filter((_, i) => i !== index);
            return updated.length === 0 ? [{ url: "" }] : updated;
        });
    }

    function handleChannelChange(e: ChangeEvent<HTMLInputElement>, index: number) {
        const value = e.target.value;
        setChannels((prev) =>
            prev.map((ch, i) => (i === index ? { ...ch, url: value } : ch))
        );
    }

    function addSite() {
        setSites((prev) => [...prev, { url: "" }]);
    }

    function removeSite(index: number) {
        setSites((prev) => {
            const updated = prev.filter((_, i) => i !== index);
            return updated.length === 0 ? [{ url: "" }] : updated;
        });
    }

    function handleSiteChange(e: ChangeEvent<HTMLInputElement>, index: number) {
        const value = e.target.value;
        setSites((prev) =>
            prev.map((s, i) => (i === index ? { ...s, url: value } : s))
        );
    }

    return (
        <div className={styles.settings}>
            <h1 className={styles.title}>Привет, Илья!</h1>

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
                        <input type="checkbox" />
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
                        <input type="checkbox" />
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

            <div className={styles.button}>
                <button>СОХРАНИТЬ</button>
            </div>
        </div>
    );
}
