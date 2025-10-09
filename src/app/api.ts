// api.ts
// const API_URL = "https://apgram-backend.onrender.com/api";
const API_URL = "http://localhost:4000/api";
const STORAGE_KEY = "generatedPosts";

// --- 🧩 Вспомогательные функции ---
function generateId(): number {
  return Math.round(Math.random() * 100000);
}

function safeParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

// --- 🌐 Универсальный запрос с поддержкой токена ---
async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) headers["x-auth-token"] = token;

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const data = await res.json();
      msg = data?.error || msg;
    } catch {}
    throw new Error(msg);
  }

  return res.json();
}

// --- 👤 Работа с пользователями ---
export async function registerUser(data: {
  username: string;
  password: string;
  telegram_token: string;
  channel_id: string;
}) {
  return request<{
    success: boolean;
    message: string;
    userId: number;
    auth_token: string;
  }>(`/users/register`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function loginUser(data: { username: string; password: string }) {
  return request<{
    success: boolean;
    message: string;
    userId: number;
    telegram_token: string;
    channel_id: string;
    auth_token: string;
  }>(`/users/login`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getUserSettings(userId: number, token: string) {
  return request<{ success: boolean; settings: any }>(
    `/users/settings/${userId}`,
    {},
    token
  );
}

export async function updateUserSettings(
  userId: number,
  settings: any,
  token: string
) {
  return request<{ success: boolean; message: string }>(
    `/users/settings/${userId}`,
    {
      method: "PUT",
      body: JSON.stringify(settings),
    },
    token
  );
}

/**
 * 🚪 Выход из системы
 * Удаляет токен и связанные данные из localStorage.
 */
export function logout() {
  try {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_id");
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error("Ошибка при выходе из системы:", e);
  }
}

export async function uploadImage(file: File, token: string): Promise<string> {
  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch(`${API_URL}/posts/upload`, {
    method: "POST",
    headers: token ? { "x-auth-token": token } : undefined,
    body: formData,
  });

  if (!res.ok) throw new Error("Ошибка загрузки изображения");
  const data = await res.json();
  if (!data.success) throw new Error(data.error || "Ошибка загрузки");

  return data.url;
}

export function deleteImageFromPost(id: number, token: string) {
  return request<{ success: boolean; message?: string }>(
    `/posts/${id}/image`,
    {
      method: "DELETE",
    },
    token
  );
}

// --- 📝 Работа с постами ---
export function addPost(
  userId: number,
  title: string,
  description: string,
  url: string | null,
  scheduledAt?: string | null,
  token?: string
) {
  return request<{ success: boolean; id: number }>(
    `/posts`,
    {
      method: "POST",
      body: JSON.stringify({ userId, title, description, url, scheduledAt }),
    },
    token
  );
}

export function getUserPosts(userId: number, token: string) {
  return request<any[]>(`/posts/user/${userId}`, {}, token);
}

export function getPostById(id: number, token: string) {
  return request<any>(`/posts/${id}`, {}, token);
}

export function updatePost(
  id: number,
  title: string,
  description: string,
  url: string | null,
  scheduledAt?: string | null,
  token?: string
) {
  return request<{ success: boolean; message?: string }>(
    `/posts/${id}`,
    {
      method: "PUT",
      body: JSON.stringify({ title, description, url, scheduledAt }),
    },
    token
  );
}

export function deletePost(id: number, token: string) {
  return request<{ success: boolean }>(`/posts/${id}`, { method: "DELETE" }, token);
}

export function sendPostToTelegram(id: number, token: string) {
  return request<{ success: boolean; message?: string }>(
    `/posts/sendPost/${id}`,
    { method: "POST" },
    token
  );
}

// --- ⏰ Планировщик ---
export function schedulePost(id: number, scheduledAt: string, token: string) {
  return request<{ success: boolean; message: string; scheduledAt: string }>(
    `/posts/schedulePost/${id}`,
    {
      method: "POST",
      body: JSON.stringify({ scheduledAt }),
    },
    token
  );
}

export function cancelScheduledPost(id: number, token: string) {
  return request<{ success: boolean; message: string }>(
    `/posts/schedulePost/${id}`,
    {
      method: "DELETE",
    },
    token
  );
}

// --- 🤖 Генерация постов ---
export async function generatePosts(
  userId: number,
  token: string,
  prompt?: string // 👈 необязательный параметр
): Promise<any[]> {
  try {
    const body = prompt ? { prompt } : {}; // если промпт передан — отправляем его в body

    const data = await request<{ success: boolean; userId: number; posts: any[] }>(
      `/posts/generate-posts/${userId}`,
      {
        method: "POST",
        body: JSON.stringify(body),
      },
      token
    );

    const posts = data.posts || [];

    const normalized = posts.map((p: any) => ({
      ...p,
      id: generateId(),
      chosen: false,
    }));

    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    return normalized;
  } catch (e) {
    console.error("Ошибка генерации постов:", e);
    return [];
  }
}


// --- 💾 Локальное хранилище ---
export async function getStoredPosts(userId: number, token: string): Promise<any[]> {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const posts: any[] = safeParse(saved, []);
      const updated = posts.map((post) => ({
        ...post,
        id: post.id || generateId(),
        chosen: post.chosen ?? false,
      }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    } catch (e) {
      console.error("Ошибка при парсинге localStorage:", e);
      return await generatePosts(userId, token);
    }
  }
  return await generatePosts(userId, token);
}

// --- ✅ Выбор поста ---
export function setChosen(id: number) {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return;
  try {
    const posts: any[] = safeParse(saved, []);
    const updatedPosts = posts.map((post) =>
      post.id === id ? { ...post, chosen: !post.chosen } : post
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPosts));
    return updatedPosts;
  } catch (e) {
    console.error("Ошибка при обновлении chosen:", e);
  }
}

// --- 🔔 WebSocket обновления ---
export function connectToPostUpdates(onUpdate: () => void) {
  const ws = new WebSocket(API_URL.replace("http", "ws"));
  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.type === "posts_updated") onUpdate();
    } catch {}
  };
  ws.onclose = () => {
    console.warn("WebSocket закрыт. Переподключение через 3с...");
    setTimeout(() => connectToPostUpdates(onUpdate), 3000);
  };
}
