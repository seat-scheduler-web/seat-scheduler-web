import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { apiRequest } from "../api/client";

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validateUsername(username) {
  const usernameRegex = /^[a-zA-Z0-9]+$/;
  return usernameRegex.test(username);
}

export default function Profile() {
  const { user, setUser } = useAuth();

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    username: user?.username || "",
    email: user?.email || "",
  });
  const [profileErrors, setProfileErrors] = useState({
    username: "",
    email: "",
  });
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");
  const [profileSubmitting, setProfileSubmitting] = useState(false);

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);

  // Booking stats state
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Load booking stats
  useState(() => {
    async function loadStats() {
      try {
        const bookings = await apiRequest("/bookings");
        const total = bookings.length;
        const upcoming = bookings.filter(
          (b) =>
            b.status === "CONFIRMED" &&
            new Date(b.schedule?.showTime) > new Date(),
        ).length;
        const cancelled = bookings.filter(
          (b) => b.status === "CANCELLED",
        ).length;
        setStats({ total, upcoming, cancelled });
      } catch (err) {
        console.error("Failed to load stats:", err);
      } finally {
        setStatsLoading(false);
      }
    }
    loadStats();
  }, []);

  function validateProfile() {
    const errors = { username: "", email: "" };
    let isValid = true;

    if (!profileForm.username.trim()) {
      errors.username = "Username is required";
      isValid = false;
    } else if (profileForm.username.length < 3) {
      errors.username = "Username must be at least 3 characters";
      isValid = false;
    } else if (profileForm.username.length > 20) {
      errors.username = "Username must be 20 characters or less";
      isValid = false;
    } else if (!validateUsername(profileForm.username)) {
      errors.username = "Username can only contain letters and numbers";
      isValid = false;
    }

    if (!profileForm.email.trim()) {
      errors.email = "Email is required";
      isValid = false;
    } else if (!validateEmail(profileForm.email)) {
      errors.email = "Please enter a valid email address";
      isValid = false;
    }

    setProfileErrors(errors);
    return isValid;
  }

  function validatePassword() {
    const errors = {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    };
    let isValid = true;

    if (!passwordForm.currentPassword) {
      errors.currentPassword = "Current password is required";
      isValid = false;
    }

    if (!passwordForm.newPassword) {
      errors.newPassword = "New password is required";
      isValid = false;
    } else if (passwordForm.newPassword.length < 6) {
      errors.newPassword = "New password must be at least 6 characters";
      isValid = false;
    }

    if (!passwordForm.confirmPassword) {
      errors.confirmPassword = "Please confirm your new password";
      isValid = false;
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    setPasswordErrors(errors);
    return isValid;
  }

  async function handleProfileSubmit(e) {
    e.preventDefault();
    setProfileSuccess("");
    setProfileError("");

    if (!validateProfile()) return;

    setProfileSubmitting(true);

    try {
      const data = await apiRequest("/users/me", {
        method: "PATCH",
        body: JSON.stringify(profileForm),
      });
      setUser(data.user);
      setProfileSuccess("Profile updated successfully");
    } catch (err) {
      setProfileError(err.message);
    } finally {
      setProfileSubmitting(false);
    }
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault();
    setPasswordSuccess("");
    setPasswordError("");

    if (!validatePassword()) return;

    setPasswordSubmitting(true);

    try {
      await apiRequest("/users/me/password", {
        method: "PATCH",
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });
      setPasswordSuccess("Password changed successfully");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      setPasswordError(err.message);
    } finally {
      setPasswordSubmitting(false);
    }
  }

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>

      <div className="grid gap-8 md:grid-cols-3">
        {/* User Info Card */}
        <div className="md:col-span-1">
          <div className="bg-base-200 rounded-lg p-6 text-center">
            <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">👤</span>
            </div>
            <h2 className="text-xl font-semibold">{user?.username}</h2>
            <p className="text-sm opacity-50">{user?.email}</p>
            <div className="mt-2">
              <span
                className={`badge ${
                  user?.role === "ADMIN" ? "badge-primary" : "badge-soft"
                }`}
              >
                {user?.role}
              </span>
            </div>
            <p className="text-xs opacity-40 mt-4">
              Member since {user?.createdAt && formatDate(user.createdAt)}
            </p>
          </div>

          {/* Booking Stats */}
          <div className="bg-base-200 rounded-lg p-6 mt-4">
            <h3 className="font-semibold mb-4">Booking Statistics</h3>
            {statsLoading ? (
              <div className="flex justify-center py-4">
                <span className="loading loading-spinner loading-sm" />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="opacity-70">Total Bookings</span>
                  <span className="font-semibold">{stats?.total || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-70">Upcoming</span>
                  <span className="font-semibold text-success">
                    {stats?.upcoming || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-70">Cancelled</span>
                  <span className="font-semibold text-error">
                    {stats?.cancelled || 0}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Forms */}
        <div className="md:col-span-2 space-y-6">
          {/* Profile Form */}
          <div className="bg-base-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Update Profile</h3>

            {profileSuccess && (
              <div className="alert alert-success text-sm mb-4">
                {profileSuccess}
              </div>
            )}
            {profileError && (
              <div className="alert alert-error text-sm mb-4">
                {profileError}
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Username</span>
                </label>
                <input
                  type="text"
                  className={`input input-bordered ${
                    profileErrors.username ? "input-error" : ""
                  }`}
                  value={profileForm.username}
                  onChange={(e) => {
                    setProfileForm({
                      ...profileForm,
                      username: e.target.value,
                    });
                    if (profileErrors.username)
                      setProfileErrors({ ...profileErrors, username: "" });
                  }}
                />
                {profileErrors.username && (
                  <label className="label">
                    <span className="label-text-alt text-error">
                      {profileErrors.username}
                    </span>
                  </label>
                )}
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Email</span>
                </label>
                <input
                  type="email"
                  className={`input input-bordered ${
                    profileErrors.email ? "input-error" : ""
                  }`}
                  value={profileForm.email}
                  onChange={(e) => {
                    setProfileForm({ ...profileForm, email: e.target.value });
                    if (profileErrors.email)
                      setProfileErrors({ ...profileErrors, email: "" });
                  }}
                />
                {profileErrors.email && (
                  <label className="label">
                    <span className="label-text-alt text-error">
                      {profileErrors.email}
                    </span>
                  </label>
                )}
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={profileSubmitting}
              >
                {profileSubmitting ? (
                  <span className="loading loading-spinner loading-sm" />
                ) : (
                  "Update Profile"
                )}
              </button>
            </form>
          </div>

          {/* Password Form */}
          <div className="bg-base-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Change Password</h3>

            {passwordSuccess && (
              <div className="alert alert-success text-sm mb-4">
                {passwordSuccess}
              </div>
            )}
            {passwordError && (
              <div className="alert alert-error text-sm mb-4">
                {passwordError}
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Current Password</span>
                </label>
                <input
                  type="password"
                  className={`input input-bordered ${
                    passwordErrors.currentPassword ? "input-error" : ""
                  }`}
                  value={passwordForm.currentPassword}
                  onChange={(e) => {
                    setPasswordForm({
                      ...passwordForm,
                      currentPassword: e.target.value,
                    });
                    if (passwordErrors.currentPassword)
                      setPasswordErrors({
                        ...passwordErrors,
                        currentPassword: "",
                      });
                  }}
                />
                {passwordErrors.currentPassword && (
                  <label className="label">
                    <span className="label-text-alt text-error">
                      {passwordErrors.currentPassword}
                    </span>
                  </label>
                )}
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">New Password</span>
                </label>
                <input
                  type="password"
                  className={`input input-bordered ${
                    passwordErrors.newPassword ? "input-error" : ""
                  }`}
                  value={passwordForm.newPassword}
                  onChange={(e) => {
                    setPasswordForm({
                      ...passwordForm,
                      newPassword: e.target.value,
                    });
                    if (passwordErrors.newPassword)
                      setPasswordErrors({ ...passwordErrors, newPassword: "" });
                  }}
                />
                {passwordErrors.newPassword && (
                  <label className="label">
                    <span className="label-text-alt text-error">
                      {passwordErrors.newPassword}
                    </span>
                  </label>
                )}
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Confirm New Password</span>
                </label>
                <input
                  type="password"
                  className={`input input-bordered ${
                    passwordErrors.confirmPassword ? "input-error" : ""
                  }`}
                  value={passwordForm.confirmPassword}
                  onChange={(e) => {
                    setPasswordForm({
                      ...passwordForm,
                      confirmPassword: e.target.value,
                    });
                    if (passwordErrors.confirmPassword)
                      setPasswordErrors({
                        ...passwordErrors,
                        confirmPassword: "",
                      });
                  }}
                />
                {passwordErrors.confirmPassword && (
                  <label className="label">
                    <span className="label-text-alt text-error">
                      {passwordErrors.confirmPassword}
                    </span>
                  </label>
                )}
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={passwordSubmitting}
              >
                {passwordSubmitting ? (
                  <span className="loading loading-spinner loading-sm" />
                ) : (
                  "Change Password"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
