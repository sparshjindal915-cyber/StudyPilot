import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Spinner from './Spinner.jsx';

export default function PublicOnlyRoute() {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }
  if (user) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}
