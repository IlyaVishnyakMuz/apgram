import { useRef, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import styles from "./CustomDatePicker.module.css";

interface CustomDatePickerProps {
  selectedDate: Date | null;
  setSelectedDate: (date: Date | null) => void;
  setIsOpen: (isOpen: boolean) => void;
  onCancelSchedule?: () => Promise<void> | void;
}

export function CustomDatePicker({
  selectedDate,
  setSelectedDate,
  setIsOpen,
  onCancelSchedule,
}: CustomDatePickerProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // 🕓 локальная дата, не применяемая до "Сохранить"
  const [tempDate, setTempDate] = useState<Date>(
    selectedDate ? new Date(selectedDate) : new Date()
  );

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) {
      setIsOpen(false);
    }
  };

  const now = new Date();
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);
  const isToday = tempDate.toDateString() === now.toDateString();

  const handleCancel = async () => {
    if (onCancelSchedule) {
      await onCancelSchedule();
    }
    setIsOpen(false);
  };

  // ✅ Теперь изменения не сохраняются сразу
  const handleDateChange = (date: Date | null) => {
    if (!date) return;
    setTempDate(date);
  };

  // ✅ Сохраняем выбранное значение только по кнопке
  const handleSave = () => {
    setSelectedDate(tempDate);
    setIsOpen(false);
  };

  return (
    <div
      ref={overlayRef}
      className={styles.custom_datepicker}
      onClick={handleOverlayClick}
    >
      <div className={styles.picker_container}>
        <DatePicker
          selected={tempDate}
          onChange={handleDateChange}
          showTimeSelect
          timeFormat="HH:mm"
          timeIntervals={1}
          dateFormat="dd.MM.yyyy HH:mm"
          inline
          minDate={now}
          minTime={isToday ? now : new Date(0, 0, 0, 0, 0)}
          maxTime={endOfDay}
        />

        <div className={styles.buttons}>
          <button
            type="button"
            className={styles.cancel_button}
            onClick={handleCancel}
          >
            Удалить
          </button>
          <button
            type="button"
            className={styles.save_button}
            onClick={handleSave}
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
}
