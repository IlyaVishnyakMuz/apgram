// api.ts
const API_URL = "https://apgram-backend.onrender.com/api";
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

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
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

// --- 📤 Загрузка изображения ---
export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch(`${API_URL}/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) throw new Error("Ошибка загрузки изображения");
  const data = await res.json();
  if (!data.success) throw new Error(data.error || "Ошибка загрузки");

  return data.url.replace(/\\/g, "/"); // нормализуем путь
}

export function deleteImageFromPost(id: number) {
  return request<{ success: boolean; message?: string }>(`/posts/${id}/image`, {
    method: "DELETE",
  });
}


// --- 📝 Работа с постами (в БД) ---
export function addPost(
  title: string,
  description: string,
  url: string | null,
  scheduledAt?: string | null
) {
  return request<{ success: boolean; id: number }>(`/posts`, {
    method: "POST",
    body: JSON.stringify({ title, description, url, scheduledAt }),
  });
}

export function getPosts() {
  return request<any[]>(`/posts`);
}

export function getPostById(id: number) {
  return request<any>(`/posts/${id}`);
}

export function updatePost(
  id: number,
  title: string,
  description: string,
  url: string | null,
  scheduledAt?: string | null
) {
  return request<{ success: boolean; message?: string }>(`/posts/${id}`, {
    method: "PUT",
    body: JSON.stringify({ title, description, url, scheduledAt }),
  });
}

export function deletePost(id: number) {
  return request<{ success: boolean }>(`/posts/${id}`, {
    method: "DELETE",
  });
}

export function sendPostToTelegram(id: number) {
  return request<{ success: boolean; message?: string }>(`/sendPost/${id}`, {
    method: "POST",
  });
}

// --- ⏰ Планировщик ---
export function schedulePost(id: number, scheduledAt: string) {
  return request<{ success: boolean; message: string; scheduledAt: string }>(
    `/schedulePost/${id}`,
    {
      method: "POST",
      body: JSON.stringify({ scheduledAt }),
    }
  );
}

export function cancelScheduledPost(id: number) {
  return request<{ success: boolean; message: string }>(
    `/schedulePost/${id}`,
    {
      method: "DELETE",
    }
  );
}

// --- 🤖 Генерация и локальное хранилище (только localStorage) ---
export async function generatePosts(): Promise<any[]> {
  try {
    // ⚠️ Берём посты с сервера, но не сохраняем в БД
    const posts = await request<any[]>(`/generate-posts`, { method: "POST" });

    // Создаём независимые локальные копии
    const normalized = posts.map((p: any) => ({
      ...p,
      id: generateId(),
      chosen: false,
    }));

    // Сохраняем только в localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    return normalized;
  } catch (e) {
    console.error("Ошибка генерации постов:", e);
    return [];
  }
}

export async function getStoredPosts(): Promise<any[]> {
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
      return await generatePosts();
    }
  }
  return await generatePosts();
}

// --- ✅ setChosen ---
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
