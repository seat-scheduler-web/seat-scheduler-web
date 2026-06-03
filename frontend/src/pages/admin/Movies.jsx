import { useState, useEffect } from "react";
import { apiRequest } from "../../api/client";
import AdminLayout from "./AdminLayout";

function MovieForm({ movie, onSubmit, onCancel }) {
  const [form, setForm] = useState(
    movie || {
      title: "",
      description: "",
      duration: "",
      genre: "",
      posterUrl: "",
    },
  );

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({
      ...form,
      duration: Number(form.duration),
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-base-100 rounded-lg shadow-sm p-6"
    >
      <h3 className="text-lg font-semibold mb-4">
        {movie ? "Edit Movie" : "Add New Movie"}
      </h3>

      <div className="space-y-4">
        <div className="form-control">
          <label className="label">
            <span className="label-text">Title *</span>
          </label>
          <input
            type="text"
            className="input input-bordered"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Description</span>
          </label>
          <textarea
            className="textarea textarea-bordered"
            value={form.description || ""}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Duration (min) *</span>
            </label>
            <input
              type="number"
              className="input input-bordered"
              value={form.duration}
              onChange={(e) => setForm({ ...form, duration: e.target.value })}
              required
              min="1"
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Genre</span>
            </label>
            <input
              type="text"
              className="input input-bordered"
              value={form.genre || ""}
              onChange={(e) => setForm({ ...form, genre: e.target.value })}
              placeholder="e.g., Action, Comedy"
            />
          </div>
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Poster URL</span>
          </label>
          <input
            type="url"
            className="input input-bordered"
            value={form.posterUrl || ""}
            onChange={(e) => setForm({ ...form, posterUrl: e.target.value })}
            placeholder="https://example.com/poster.jpg"
          />
        </div>
      </div>

      <div className="flex gap-2 mt-6">
        <button type="submit" className="btn btn-primary">
          {movie ? "Update Movie" : "Add Movie"}
        </button>
        <button type="button" className="btn btn-ghost" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}

export default function Movies() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);

  useEffect(() => {
    loadMovies();
  }, []);

  async function loadMovies() {
    try {
      const data = await apiRequest("/movies");
      setMovies(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(formData) {
    try {
      if (editingMovie) {
        await apiRequest(`/movies/${editingMovie.id}`, {
          method: "PATCH",
          body: JSON.stringify(formData),
        });
      } else {
        await apiRequest("/movies", {
          method: "POST",
          body: JSON.stringify(formData),
        });
      }
      setShowForm(false);
      setEditingMovie(null);
      loadMovies();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Are you sure you want to delete this movie?")) return;

    try {
      await apiRequest(`/movies/${id}`, { method: "DELETE" });
      loadMovies();
    } catch (err) {
      setError(err.message);
    }
  }

  function handleEdit(movie) {
    setEditingMovie(movie);
    setShowForm(true);
  }

  function handleCancel() {
    setShowForm(false);
    setEditingMovie(null);
  }

  if (loading) {
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
          <h2 className="text-2xl font-bold">Movies</h2>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            + Add Movie
          </button>
        </div>

        {error && (
          <div className="alert alert-error">
            <span>{error}</span>
          </div>
        )}

        {showForm && (
          <MovieForm
            movie={editingMovie}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        )}

        <div className="bg-base-100 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Genre</th>
                  <th>Duration</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {movies.map((movie) => (
                  <tr key={movie.id}>
                    <td className="font-medium">{movie.title}</td>
                    <td>
                      {movie.genre && (
                        <span className="badge badge-soft">{movie.genre}</span>
                      )}
                    </td>
                    <td>{movie.duration} min</td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          className="btn btn-sm btn-ghost"
                          onClick={() => handleEdit(movie)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-error btn-outline"
                          onClick={() => handleDelete(movie.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {movies.length === 0 && (
            <div className="text-center py-12 text-base-content/50">
              No movies found. Add your first movie!
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
