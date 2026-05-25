import { Navigate, useNavigate } from 'react-router-dom';
import { AuthForm } from '../components/AuthForm';
import { useAuth } from '../context/AuthContext';

export function RegisterPage() {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (isAuthenticated) {
    return <Navigate to="/collection" replace />;
  }

  return (
    <>
      <h1 className="page-title">Sign up</h1>
      <p className="page-subtitle">Create your SCBingoBook account.</p>
      <AuthForm
        mode="register"
        onSubmit={async (data) => {
          await register({
            email: data.email,
            username: data.username,
            password: data.password,
            displayName: data.displayName,
          });
          navigate('/collection');
        }}
      />
    </>
  );
}
