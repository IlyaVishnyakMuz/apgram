import { Link } from "react-router-dom";

export function Sidebar() {
    return(
        <aside className="sidebar">
            <div className="logo">
                <Link to="/">.APostgram</Link>
            </div>
            <ul>
                <li><Link to="/">СГЕНЕРИРОВАТЬ</Link></li>
                <li><Link to="/posts/">ПОСТЫ</Link></li>
            </ul>
        </aside>
    )
}