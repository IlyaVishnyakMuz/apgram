import { registerUser, loginUser, getUserSettings, updateUserSettings } from "./api";

export interface User {
  userId: number;
  username: string;
  telegram_token?: string;
  channel_id?: string;
  auth_token: string;
}

const AUTH_KEY = "apgram_auth";

/**
 * Сохраняем авторизационные данные в localStorage
 */
export function saveAuth(user: User) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
}

/**
 * Получаем текущего пользователя (если есть)
 */
export function getAuth(): User | null {
  const raw = localStorage.getItem(AUTH_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

/**
 * Удаляем токен (выход из аккаунта)
 */
export function logout() {
  localStorage.removeItem(AUTH_KEY);
}

/**
 * Проверяем, есть ли пользователь
 */
export function isAuthenticated(): boolean {
  return !!getAuth();
}

/**
 * Регистрация нового пользователя
 */
export async function register({
  username,
  password,
  telegram_token,
  channel_id,
}: {
  username: string;
  password: string;
  telegram_token: string;
  channel_id: string;
}) {
  const res = await registerUser({
    username,
    password,
    telegram_token,
    channel_id,
  });

  const user: User = {
    userId: res.userId,
    username,
    telegram_token,
    channel_id,
    auth_token: res.auth_token,
  };

  saveAuth(user);
  return user;
}

/**
 * Вход в аккаунт
 */
export async function login({
  username,
  password,
}: {
  username: string;
  password: string;
}) {
  const res = await loginUser({ username, password });

  const user: User = {
    userId: res.userId,
    username,
    telegram_token: res.telegram_token,
    channel_id: res.channel_id,
    auth_token: res.auth_token,
  };

  saveAuth(user);
  return user;
}

/**
 * Получение текущих настроек пользователя
 */
export async function getSettings() {
  const user = getAuth();
  if (!user) throw new Error("Пользователь не авторизован");

  return await getUserSettings(user.userId, user.auth_token);
}

/**
 * Обновление настроек пользователя
 */
export async function updateSettings(data: any) {
  const user = getAuth();
  if (!user) throw new Error("Пользователь не авторизован");

  return await updateUserSettings(user.userId, data, user.auth_token);
}
