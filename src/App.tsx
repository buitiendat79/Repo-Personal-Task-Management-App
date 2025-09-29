// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RegisterPage from "./features/auth/RegisterPage";
import LoginPage from "./features/auth/LoginPage";
import TasksPage from "./features/tasks/TaskPage";
import CreateTasksPage from "./features/tasks/CreateTasksPage";
import EditTaskPage from "./features/tasks/EditTaskPage";
import DashboardPage from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import ProfilePage from "./pages/ProfilePage";
import EditProfilePage from "./pages/EditProfilePage";
import TaskDetailPage from "./features/tasks/TaskDetailPage";
import ChangePW from "./pages/ChangePW";
import { useEffect, useState } from "react";
import { supabase } from "./api/supabaseClient";
import { useDispatch } from "react-redux";
import { setUser } from "./features/auth/AuthSlice";
import { ForgotPasswordPage } from "./features/auth/Forgot_Password";
import ResetPasswordPage from "./pages/ResetPasswordPage";

function App() {
  const dispatch = useDispatch();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const hasRemember =
          localStorage.getItem("sb-session-remember") === "true";
        const storage = hasRemember ? localStorage : sessionStorage;
        const saved = storage.getItem("sb-session");
        console.debug("App restoreSession:", {
          hasRemember,
          hasSaved: !!saved,
        });

        if (saved) {
          const session = JSON.parse(saved);
          // set session into supabase client for this tab
          const { error } = await supabase.auth.setSession(session);
          if (error) {
            console.warn("App: setSession error", error);
          }
          const user = (session as any).user ?? (session as any).user;
          if (user) {
            dispatch(setUser(user));
          } else {
            dispatch(setUser(null));
          }
        } else {
          dispatch(setUser(null));
        }
      } catch (err) {
        console.error("App restoreSession error", err);
        dispatch(setUser(null));
      } finally {
        setReady(true);
      }
    };

    restoreSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        dispatch(setUser(session.user));
      } else {
        dispatch(setUser(null));
        // also clear flag/storage when signed out centrally
        localStorage.removeItem("sb-session-remember");
        localStorage.removeItem("sb-session");
        sessionStorage.removeItem("sb-session");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [dispatch]);

  if (!ready) return null; // hoặc một skeleton/loading nhỏ

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/createtask"
          element={
            <ProtectedRoute>
              <CreateTasksPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tasks"
          element={
            <ProtectedRoute>
              <TasksPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tasks/:taskId/edit"
          element={
            <ProtectedRoute>
              <EditTaskPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/editprofile"
          element={
            <ProtectedRoute>
              <EditProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/change_password"
          element={
            <ProtectedRoute>
              <ChangePW />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tasks/:taskId"
          element={
            <ProtectedRoute>
              <TaskDetailPage />
            </ProtectedRoute>
          }
        />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Routes>
    </Router>
  );
}

export default App;
