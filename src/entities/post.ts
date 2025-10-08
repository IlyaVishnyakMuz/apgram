export interface Post {
    id: number;
    url?: string | null;
    title: string;
    description: string;
    chosen?: boolean;
    scheduledAt?: string | null; // 🕓 дата и время запланированной отправки
}
  