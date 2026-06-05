import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "../components/Toast";

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);

  function validate() {
    const newErrors = { email: "", password: "" };
    let isValid = true;

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

    if (!validate()) {
      return;
    }

    setSubmitting(true);

    try {
      await login(form.email, form.password);
      addToast("Welcome back! You're now logged in.", "success");
      navigate("/");
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="hero min-h-screen relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
      <div className="absolute top-10 left-10 text-6xl opacity-10 select-none rotate-12">
        🎬
      </div>
      <div className="absolute bottom-20 right-10 text-5xl opacity-10 select-none -rotate-12">
        🍿
      </div>
      <div className="absolute top-1/3 right-1/4 text-4xl opacity-5 select-none">
        🎥
      </div>

      <div className="hero-content w-full max-w-sm relative z-10">
        <div className="card bg-base-200 w-full shrink-0 shadow-2xl border border-base-300/50">
          {/* Accent bar */}
          <div className="h-1.5 bg-gradient-to-r from-primary/60 via-secondary/60 to-accent/60" />

          <form onSubmit={handleSubmit} className="card-body p-6 md:p-8">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="flex justify-center gap-2 text-3xl mb-3">
                <span>🎟️</span>
              </div>
              <h1 className="card-title text-2xl justify-center font-bold tracking-tight">
                Welcome Back
              </h1>
              <p className="text-sm opacity-50 mt-1">
                Sign in to book your seats
              </p>
            </div>

            <div className="form-control">
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
                placeholder="••••••••"
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
                      <path
                        fillRule="evenodd"
                        d="M17 4.25A2.25 2.25 0 0014.75 2h-5.5A2.25 2.25 0 007 4.25v2a.75.75 0 001.5 0v-2a.75.75 0 01.75-.75h5.5a.75.75 0 01.75.75v11.5a.75.75 0 01-.75.75h-5.5a.75.75 0 01-.75-.75v-2a.75.75 0 00-1.5 0v2A2.25 2.25 0 009.25 18h5.5A2.25 2.25 0 0017 15.75V4.25z"
                        clipRule="evenodd"
                      />
                      <path
                        fillRule="evenodd"
                        d="M1 10a.75.75 0 01.75-.75h9.69l-1.72-1.72a.75.75 0 011.06-1.06l3 3a.75.75 0 010 1.06l-3 3a.75.75 0 01-1.06-1.06l1.72-1.72H1.75A.75.75 0 011 10z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Sign In
                  </>
                )}
              </button>
            </div>

            <p className="text-center text-sm mt-4 opacity-70">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="link link-primary font-semibold hover:link-hover transition-colors"
              >
                Create one
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
