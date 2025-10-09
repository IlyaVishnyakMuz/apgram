export interface Post {
    userId: number;
    id: number;
    url?: string | null;
    title: string;
    description: string;
    chosen?: boolean;
    scheduledAt?: string | null;
}
