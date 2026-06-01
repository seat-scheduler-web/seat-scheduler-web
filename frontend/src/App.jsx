import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import { ToastProvider } from "./components/Toast";
import PageTransition from "./components/PageTransition";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ScheduleDetail from "./pages/ScheduleDetail";
import SeatSelection from "./pages/SeatSelection";
import BookingConfirmation from "./pages/BookingConfirmation";
import MyBookings from "./pages/MyBookings";

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <Routes>
        <Route
          path="/"
          element={
            <PageTransition>
              <Home />
            </PageTransition>
          }
        />
        <Route
          path="/schedules/:id"
          element={
            <PageTransition>
              <ScheduleDetail />
            </PageTransition>
          }
        />
        <Route
          path="/schedules/:id/seats"
          element={
            user ? (
              <PageTransition>
                <SeatSelection />
              </PageTransition>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/bookings/:id/confirmation"
          element={
            user ? (
              <PageTransition>
                <BookingConfirmation />
              </PageTransition>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/my-bookings"
          element={
            user ? (
              <PageTransition>
                <MyBookings />
              </PageTransition>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/login"
          element={
            user ? (
              <Navigate to="/" />
            ) : (
              <PageTransition>
                <Login />
              </PageTransition>
            )
          }
        />
        <Route
          path="/register"
          element={
            user ? (
              <Navigate to="/" />
            ) : (
              <PageTransition>
                <Register />
              </PageTransition>
            )
          }
        />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
