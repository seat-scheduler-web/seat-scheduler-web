import { Suspense, lazy } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { BuyerQueueProvider } from "./context/BuyerQueueContext";
import { UndoStackProvider } from "./context/UndoStackContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { ToastProvider } from "./components/Toast";
import PageTransition from "./components/PageTransition";
import ErrorBoundary from "./components/ErrorBoundary";
import AdminRoute from "./components/AdminRoute";
import { useEffect } from "react";

// Lazy-loaded page components for code splitting
const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const ScheduleDetail = lazy(() => import("./pages/ScheduleDetail"));
const SeatSelection = lazy(() => import("./pages/SeatSelection"));
const BookingConfirmation = lazy(() => import("./pages/BookingConfirmation"));
const MyBookings = lazy(() => import("./pages/MyBookings"));
const Profile = lazy(() => import("./pages/Profile"));
const AdminMovies = lazy(() => import("./pages/admin/Movies"));
const AdminSchedules = lazy(() => import("./pages/admin/Schedules"));
const AdminBookings = lazy(() => import("./pages/admin/Bookings"));

function PageLoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <span className="loading loading-spinner loading-lg text-primary" />
        <span className="text-sm opacity-50">Loading page...</span>
      </div>
    </div>
  );
}

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
        <Suspense fallback={<PageLoadingFallback />}>
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
              path="/profile"
              element={
                user ? (
                  <ErrorBoundary>
                    <PageTransition>
                      <Profile />
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

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <ErrorBoundary>
                    <PageTransition>
                      <AdminMovies />
                    </PageTransition>
                  </ErrorBoundary>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/schedules"
              element={
                <AdminRoute>
                  <ErrorBoundary>
                    <PageTransition>
                      <AdminSchedules />
                    </PageTransition>
                  </ErrorBoundary>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/bookings"
              element={
                <AdminRoute>
                  <ErrorBoundary>
                    <PageTransition>
                      <AdminBookings />
                    </PageTransition>
                  </ErrorBoundary>
                </AdminRoute>
              }
            />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

// Handle GitHub Pages 404.html redirect
// Converts URLs like /seat-scheduler-web/?/some-path back to /seat-scheduler-web/some-path
function GitHubPagesRedirect() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const search = location.search;
    if (search && search.startsWith("?/")) {
      const path = search.slice(2).replace(/~and~/g, "&");
      navigate(path, { replace: true });
    }
  }, [location, navigate]);

  return null;
}

export default function App() {
  return (
    <BrowserRouter basename="/seat-scheduler-web">
      <AuthProvider>
        <BuyerQueueProvider>
          <UndoStackProvider>
            <ToastProvider>
              <GitHubPagesRedirect />
              <AppRoutes />
            </ToastProvider>
          </UndoStackProvider>
        </BuyerQueueProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
