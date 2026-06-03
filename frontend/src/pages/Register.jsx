import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validateUsername(username) {
  const usernameRegex = /^[a-zA-Z0-9]+$/;
  return usernameRegex.test(username);
}

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [errors, setErrors] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function validate() {
    const newErrors = { username: "", email: "", password: "" };
    let isValid = true;

    if (!form.username.trim()) {
      newErrors.username = "Username is required";
      isValid = false;
    } else if (form.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
      isValid = false;
    } else if (form.username.length > 20) {
      newErrors.username = "Username must be 20 characters or less";
      isValid = false;
    } else if (!validateUsername(form.username)) {
      newErrors.username = "Username can only contain letters and numbers";
      isValid = false;
    }

    if (!form.email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!validateEmail(form.email)) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    if (!form.password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!validate()) {
      return;
    }

    setSubmitting(true);

    try {
      await register(form.username, form.email, form.password);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="hero min-h-screen relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 via-transparent to-primary/5" />
      <div className="absolute top-16 right-16 text-6xl opacity-10 select-none -rotate-12">
        🎭
      </div>
      <div className="absolute bottom-16 left-16 text-5xl opacity-10 select-none rotate-12">
        🎪
      </div>
      <div className="absolute top-1/4 left-1/3 text-4xl opacity-5 select-none">
        🎦
      </div>

      <div className="hero-content w-full max-w-sm relative z-10">
        <div className="card bg-base-200 w-full shrink-0 shadow-2xl border border-base-300/50">
          {/* Accent bar */}
          <div className="h-1.5 bg-gradient-to-r from-secondary/60 via-accent/60 to-primary/60" />

          <form onSubmit={handleSubmit} className="card-body p-6 md:p-8">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="flex justify-center gap-2 text-3xl mb-3">
                <span>🎬</span>
              </div>
              <h1 className="card-title text-2xl justify-center font-bold tracking-tight">
                Create Account
              </h1>
              <p className="text-sm opacity-50 mt-1">
                Join us and start booking movies
              </p>
            </div>

            {error && (
              <div className="alert alert-error text-sm shadow-lg mb-4">
                {error}
              </div>
            )}

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Username</span>
              </label>
              <input
                type="text"
                placeholder="johndoe"
                className={`input input-bordered focus:input-primary transition-colors duration-200 ${
                  errors.username ? "input-error" : ""
                }`}
                required
                minLength={3}
                maxLength={20}
                value={form.username}
                onChange={(e) => {
                  setForm({ ...form, username: e.target.value });
                  if (errors.username) setErrors({ ...errors, username: "" });
                }}
              />
              {errors.username && (
                <label className="label">
                  <span className="label-text-alt text-error">
                    {errors.username}
                  </span>
                </label>
              )}
            </div>

            <div className="form-control mt-2">
              <label className="label">
                <span className="label-text font-medium">Email</span>
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                className={`input input-bordered focus:input-primary transition-colors duration-200 ${
                  errors.email ? "input-error" : ""
                }`}
                required
                value={form.email}
                onChange={(e) => {
                  setForm({ ...form, email: e.target.value });
                  if (errors.email) setErrors({ ...errors, email: "" });
                }}
              />
              {errors.email && (
                <label className="label">
                  <span className="label-text-alt text-error">
                    {errors.email}
                  </span>
                </label>
              )}
            </div>

            <div className="form-control mt-2">
              <label className="label">
                <span className="label-text font-medium">Password</span>
              </label>
              <input
                type="password"
                placeholder="Min. 6 characters"
                className={`input input-bordered focus:input-primary transition-colors duration-200 ${
                  errors.password ? "input-error" : ""
                }`}
                required
                minLength={6}
                value={form.password}
                onChange={(e) => {
                  setForm({ ...form, password: e.target.value });
                  if (errors.password) setErrors({ ...errors, password: "" });
                }}
              />
              {errors.password && (
                <label className="label">
                  <span className="label-text-alt text-error">
                    {errors.password}
                  </span>
                </label>
              )}
            </div>

            <div className="form-control mt-6">
              <button
                type="submit"
                className="btn btn-primary hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200"
                disabled={submitting}
              >
                {submitting ? (
                  <span className="loading loading-spinner" />
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="w-4 h-4"
                    >
                      <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" />
                    </svg>
                    Create Account
                  </>
                )}
              </button>
            </div>

            <p className="text-center text-sm mt-4 opacity-70">
              Already have an account?{" "}
              <Link
                to="/login"
                className="link link-primary font-semibold hover:link-hover transition-colors"
              >
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
