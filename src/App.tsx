import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RegisterPage from "./features/auth/RegisterPage";
import LoginPage from "./features/auth/LoginPage";
import TasksPage from "./features/tasks/TasksPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<TasksPage />} />
      </Routes>
    </Router>
  );
}
export default App;
