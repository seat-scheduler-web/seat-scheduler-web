import { Link, useLocation } from "react-router-dom";

const navItems = [
  { path: "/admin", label: "Movies", icon: "🎬" },
  { path: "/admin/schedules", label: "Schedules", icon: "📅" },
  { path: "/admin/bookings", label: "Bookings", icon: "🎟️" },
];

export default function AdminLayout({ children }) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-base-200">
      <div className="navbar bg-base-100 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex-1">
            <Link to="/admin" className="text-xl font-bold">
              🎬 Admin Dashboard
            </Link>
          </div>
          <div className="flex-none">
            <Link to="/" className="btn btn-ghost btn-sm">
              ← Back to Site
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full md:w-64">
            <div className="bg-base-100 rounded-lg shadow-sm p-4">
              <ul className="menu menu-vertical w-full">
                {navItems.map((item) => (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={
                        location.pathname === item.path ? "active" : ""
                      }
                    >
                      <span className="text-lg">{item.icon}</span>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1">{children}</div>
        </div>
      </div>
    </div>
  );
}
