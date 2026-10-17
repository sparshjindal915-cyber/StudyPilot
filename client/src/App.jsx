import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import PublicOnlyRoute from './components/PublicOnlyRoute.jsx';
import Layout from './components/Layout.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Subjects from './pages/Subjects.jsx';
import SubjectDetail from './pages/SubjectDetail.jsx';
import Tasks from './pages/Tasks.jsx';
import Planner from './pages/Planner.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/subjects" element={<Subjects />} />
          <Route path="/subjects/:id" element={<SubjectDetail />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/planner" element={<Planner />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
