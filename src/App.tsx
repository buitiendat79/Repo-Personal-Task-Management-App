import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RegisterPage from "./features/auth/RegisterPage";
import LoginPage from "./features/auth/LoginPage";
import TasksPage from "./features/tasks/TaskPage";
import CreateTasksPage from "./features/tasks/CreateTasksPage";
import EditTaskPage from "./features/tasks/EditTaskPage";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />

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
      </Routes>
    </Router>
  );
}

export default App;
