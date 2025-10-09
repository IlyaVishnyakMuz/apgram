/**
 * Основная модель пользователя в APgram API
 */
export interface User {
  userId: number;
  username: string;
  telegram_token?: string;
  channel_id?: string;
  auth_token: string;
}

/**
 * Ответ API при регистрации
 */
export interface RegisterResponse {
  success: boolean;
  message?: string;
  userId: number;
  auth_token: string;
}

/**
 * Ответ API при логине
 */
export interface LoginResponse {
  success: boolean;
  message?: string;
  userId: number;
  telegram_token: string;
  channel_id: string;
  auth_token: string;
}
