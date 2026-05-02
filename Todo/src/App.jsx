import { AuthProvider, useAuth } from './context/AuthContext';
import AuthScreen from './components/auth/AuthScreen';
import Layout from './components/layout/Layout';

function AppContent() {
  const { user } = useAuth();
  
  if (!user) {
    return <AuthScreen />;
  }
  
  return <Layout />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
