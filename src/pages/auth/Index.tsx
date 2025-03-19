
import { Navigate, useLocation } from 'react-router-dom';

const AuthIndex = () => {
  const location = useLocation();
  
  // Redirect to login by default
  return <Navigate to="/auth/login" state={{ from: location }} replace />;
};

export default AuthIndex;
