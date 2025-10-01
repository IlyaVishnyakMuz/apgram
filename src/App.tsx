import { BrowserRouter, Route, Routes } from "react-router-dom"
import { Layout } from "./layout/Layout"
import { Home } from "./pages/Home/Home"
import { Detail } from "./pages/Detail/Detail"
import { Posts } from "./pages/Posts/Posts"

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home/>} />
          <Route path="detail" element={<Detail/>} />
          <Route path="posts" element={<Posts/>} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
