import { Navigate, Outlet } from "react-router-dom";

/**
 * Проверяет, авторизован ли пользователь (есть ли токен).
 * Если нет — перенаправляет на /login.
 */
export function ProtectedRoute() {
  const token = localStorage.getItem("auth_token");

  // Если токена нет — редирект на /login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Если есть — рендерим вложенные маршруты
  return <Outlet />;
}
