import { useState, useEffect } from "react";
import { apiRequest } from "../../api/client";
import AdminLayout from "./AdminLayout";

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "CANCELLED", label: "Cancelled" },
];

function formatDateTime(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    loadBookings();
  }, [statusFilter]);

  async function loadBookings() {
    try {
      setLoading(true);
      const query = statusFilter ? `?status=${statusFilter}` : "";
      const data = await apiRequest(`/admin/bookings${query}`);
      setBookings(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function getStatusBadge(status) {
    const badges = {
      CONFIRMED: "badge-success",
      CANCELLED: "badge-error",
    };
    return badges[status] || "badge-soft";
  }

  if (loading && bookings.length === 0) {
    return (
      <AdminLayout>
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-lg" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">All Bookings</h2>
          <div className="flex items-center gap-2">
            <label className="text-sm opacity-50">Filter:</label>
            <select
              className="select select-bordered select-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="alert alert-error">
            <span>{error}</span>
          </div>
        )}

        <div className="bg-base-100 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>User</th>
                  <th>Movie</th>
                  <th>Seat</th>
                  <th>Status</th>
                  <th>Booked At</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id}>
                    <td>#{booking.id}</td>
                    <td>
                      <div>
                        <div className="font-medium">
                          {booking.user?.username}
                        </div>
                        <div className="text-xs opacity-50">
                          {booking.user?.email}
                        </div>
                      </div>
                    </td>
                    <td>
                      {booking.schedule?.movie?.title ||
                        `Movie #${booking.schedule?.movieId}`}
                    </td>
                    <td>
                      <span className="badge badge-soft">
                        {booking.seatNumber}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${getStatusBadge(booking.status)}`}
                      >
                        {booking.status}
                      </span>
                    </td>
                    <td>{formatDateTime(booking.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {bookings.length === 0 && (
            <div className="text-center py-12 text-base-content/50">
              No bookings found.
            </div>
          )}
        </div>

        {bookings.length > 0 && (
          <div className="text-sm opacity-50 text-center">
            Showing {bookings.length} booking{bookings.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
