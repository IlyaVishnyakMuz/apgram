import { Outlet } from "react-router-dom";
import { Sidebar } from "../components/Sidebar/Sidebar";

export function Layout() {
    return(
        <div className="main">
            <Sidebar />
            <div className="content">
                <Outlet />
            </div>
        </div>
    )
}