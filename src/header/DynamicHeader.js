import { useAuth } from "../context/AuthContext";
import Header from "./Header";
import Header2 from "./Header2.js";
import AdminHeader from "./AdminHeader.js";

export default function DynamicHeader() {
    const { user } = useAuth();

    if (!user) return <Header />;          // Belum login → header normal
    if (user.role === "admin") return <AdminHeader />; // Admin → header admin
    return <Header />;                    // User biasa → header setelah login
}