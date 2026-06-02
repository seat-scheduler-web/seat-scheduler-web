import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { BuyerQueueProvider } from "./context/BuyerQueueContext";
import { UndoStackProvider } from "./context/UndoStackContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { ToastProvider } from "./components/Toast";
import PageTransition from "./components/PageTransition";
import ErrorBoundary from "./components/ErrorBoundary";
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
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route
            path="/"
            element={
              <ErrorBoundary>
                <PageTransition>
                  <Home />
                </PageTransition>
              </ErrorBoundary>
            }
          />
          <Route
            path="/schedules/:id"
            element={
              <ErrorBoundary>
                <PageTransition>
                  <ScheduleDetail />
                </PageTransition>
              </ErrorBoundary>
            }
          />
          <Route
            path="/schedules/:id/seats"
            element={
              user ? (
                <ErrorBoundary>
                  <PageTransition>
                    <SeatSelection />
                  </PageTransition>
                </ErrorBoundary>
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/bookings/:id/confirmation"
            element={
              user ? (
                <ErrorBoundary>
                  <PageTransition>
                    <BookingConfirmation />
                  </PageTransition>
                </ErrorBoundary>
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/my-bookings"
            element={
              user ? (
                <ErrorBoundary>
                  <PageTransition>
                    <MyBookings />
                  </PageTransition>
                </ErrorBoundary>
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
                <ErrorBoundary>
                  <PageTransition>
                    <Login />
                  </PageTransition>
                </ErrorBoundary>
              )
            }
          />
          <Route
            path="/register"
            element={
              user ? (
                <Navigate to="/" />
              ) : (
                <ErrorBoundary>
                  <PageTransition>
                    <Register />
                  </PageTransition>
                </ErrorBoundary>
              )
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <BuyerQueueProvider>
          <UndoStackProvider>
            <ToastProvider>
              <AppRoutes />
            </ToastProvider>
          </UndoStackProvider>
        </BuyerQueueProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
