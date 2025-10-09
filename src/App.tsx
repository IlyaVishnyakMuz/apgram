import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Layout } from "./layout/Layout";
import { Home } from "./pages/Home/Home";
import { Detail } from "./pages/Detail/Detail";
import { Posts } from "./pages/Posts/Posts";
import { Settings } from "./pages/Settings/Settings";
import { Login } from "./pages/Login/Login";
import { NotFound } from "./pages/NotFound/NotFound";
import { ProtectedRoute } from "./components/ProtectedRoute/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter basename="/apgram/">
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="detail/:id" element={<Detail />} />
            <Route path="posts" element={<Posts />} />
            <Route path="settings" element={<Settings />} />

            {/* 👇 Страница 404 внутри защищённой области */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Route>

        <Route path="/login" element={<Login />} />

        {/* 👇 И ещё одна защита на случай, если кто-то залезет неавторизованным */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
