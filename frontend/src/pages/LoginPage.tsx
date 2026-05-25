import { Navigate, useNavigate } from 'react-router-dom';
import { AuthForm } from '../components/AuthForm';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (isAuthenticated) {
    return <Navigate to="/collection" replace />;
  }

  return (
    <>
      <h1 className="page-title">Log in</h1>
      <p className="page-subtitle">Access your collection tracker.</p>
      <AuthForm
        mode="login"
        onSubmit={async (data) => {
          await login(data.email, data.password);
          navigate('/collection');
        }}
      />
    </>
  );
}
