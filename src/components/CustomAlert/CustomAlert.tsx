import { useEffect, useState } from "react";
import styles from "./CustomAlert.module.css";

type CustomAlertProps = {
  text: string;
  show: boolean;
};

export function CustomAlert({ text, show }: CustomAlertProps) {
  const [isShow, setIsShow] = useState(show);

  // 👉 Синхронизация пропса show с локальным состоянием
  useEffect(() => {
    if (show) {
      setIsShow(true);
      const timer = setTimeout(() => setIsShow(false), 5000);
      return () => clearTimeout(timer);
    } else {
      setIsShow(false);
    }
  }, [show]);

  if (!isShow) return null; // 🧹 ничего не рендерим, если не показываем

  return (
    <div className={`${styles.alert} ${isShow ? styles.show : ""}`}>
      <span>{text}</span>
      <div className={styles.alert_cross} onClick={() => setIsShow(false)}>
        <img src={`${import.meta.env.BASE_URL}/cross.svg`} alt="Закрыть" />
      </div>
    </div>
  );
}
