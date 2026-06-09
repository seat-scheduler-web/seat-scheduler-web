import { useState, useEffect } from "react";
import { apiRequest } from "../../api/client";
import { useToast } from "../../components/Toast";
import AdminLayout from "./AdminLayout";
import { TableSkeleton } from "../../components/Skeleton";
import ConfirmDialog from "../../components/ConfirmDialog";

function ScheduleForm({ onSubmit, onCancel }) {
  const [form, setForm] = useState({
    movieId: "",
    showTime: "",
    studio: "",
    price: "",
  });
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    apiRequest("/movies").then(setMovies).catch(console.error);
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({
      ...form,
      movieId: Number(form.movieId),
      price: form.price ? Number(form.price) : undefined,
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-base-100 rounded-lg shadow-sm p-6"
    >
      <h3 className="text-lg font-semibold mb-4">Add New Schedule</h3>

      <div className="space-y-4">
        <div className="form-control">
          <label className="label">
            <span className="label-text">Movie *</span>
          </label>
          <select
            className="select select-bordered"
            value={form.movieId}
            onChange={(e) => setForm({ ...form, movieId: e.target.value })}
            required
          >
            <option value="">Select a movie</option>
            {movies.map((movie) => (
              <option key={movie.id} value={movie.id}>
                {movie.title}
              </option>
            ))}
          </select>
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Show Time *</span>
          </label>
          <input
            type="datetime-local"
            className="input input-bordered"
            value={form.showTime}
            onChange={(e) => setForm({ ...form, showTime: e.target.value })}
            required
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Studio *</span>
          </label>
          <input
            type="text"
            className="input input-bordered"
            value={form.studio}
            onChange={(e) => setForm({ ...form, studio: e.target.value })}
            placeholder="e.g., Studio 1"
            required
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Price (IDR)</span>
          </label>
          <input
            type="number"
            className="input input-bordered"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            placeholder="e.g., 35000"
            min="0"
          />
        </div>
      </div>

      <div className="flex gap-2 mt-6">
        <button type="submit" className="btn btn-primary">
          Add Schedule
        </button>
        <button type="button" className="btn btn-ghost" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}

function formatDateTime(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Schedules() {
  const { addToast } = useToast();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState(null);

  useEffect(() => {
    loadSchedules();
  }, []);

  async function loadSchedules() {
    try {
      const data = await apiRequest("/schedules");
      setSchedules(data);
    } catch (err) {
      addToast(`Failed to load schedules: ${err.message}`, "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(formData) {
    try {
      await apiRequest("/schedules", {
        method: "POST",
        body: JSON.stringify(formData),
      });
      addToast("Schedule created successfully", "success");
      setShowForm(false);
      loadSchedules();
    } catch (err) {
      addToast(err.message, "error");
    }
  }

  function handleDeleteClick(schedule) {
    setScheduleToDelete(schedule);
    setShowDeleteDialog(true);
  }

  async function handleDeleteConfirm() {
    if (!scheduleToDelete) return;

    try {
      await apiRequest(`/admin/schedules/${scheduleToDelete.id}`, {
        method: "DELETE",
      });
      addToast(
        `Schedule for "${scheduleToDelete.movie?.title}" deleted successfully`,
        "success",
      );
      loadSchedules();
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setShowDeleteDialog(false);
      setScheduleToDelete(null);
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="h-8 w-32 bg-base-300 rounded animate-pulse" />
            <div className="h-10 w-36 bg-base-300 rounded animate-pulse" />
          </div>
          <TableSkeleton rows={5} columns={4} />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Schedules</h2>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            + Add Schedule
          </button>
        </div>

        {showForm && (
          <ScheduleForm
            onSubmit={handleSubmit}
            onCancel={() => setShowForm(false)}
          />
        )}

        <div className="bg-base-100 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>Movie</th>
                  <th>Show Time</th>
                  <th>Studio</th>
                  <th>Price</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {schedules.map((schedule) => (
                  <tr key={schedule.id}>
                    <td className="font-medium">
                      {schedule.movie?.title || `Movie #${schedule.movieId}`}
                    </td>
                    <td>{formatDateTime(schedule.showTime)}</td>
                    <td>{schedule.studio}</td>
                    <td>
                      {schedule.price
                        ? `IDR ${Number(schedule.price).toLocaleString()}`
                        : "—"}
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-error btn-outline"
                        onClick={() => handleDeleteClick(schedule)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {schedules.length === 0 && (
            <div className="text-center py-12 space-y-3">
              <div className="text-5xl">📅</div>
              <p className="text-base-content/50">
                No schedules yet. Add your first schedule to get started!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setScheduleToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Schedule"
        message={
          scheduleToDelete
            ? `Are you sure you want to delete the schedule for "${scheduleToDelete.movie?.title}" on ${formatDateTime(scheduleToDelete.showTime)}? This action cannot be undone.`
            : "Are you sure you want to delete this schedule?"
        }
        confirmText="Yes, Delete Schedule"
        cancelText="Cancel"
        variant="error"
      />
    </AdminLayout>
  );
}
