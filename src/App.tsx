import { BrowserRouter, Route, Routes } from "react-router-dom"
import { Layout } from "./layout/Layout"
import { Home } from "./pages/Home/Home"
import { Detail } from "./pages/Detail/Detail"
import { Posts } from "./pages/Posts/Posts"
import { Settings } from "./pages/Settings/Settings"
import { Login } from "./pages/Login/Login"

export default function App() {

  return (
    <BrowserRouter basename="/apgram/">
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home/>} />
          <Route path="detail/:id" element={<Detail/>} />
          <Route path="posts" element={<Posts/>} />
          <Route path="settings" element={<Settings/>} />
        </Route>
        <Route path="login" element={<Login/>} />
      </Routes>
    </BrowserRouter>
  )
}
