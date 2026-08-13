import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { StoreProvider } from './lib/store';
import { AppLayout } from './components/layout/AppLayout';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { VerifyEmail } from './pages/VerifyEmail';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { Dashboard } from './pages/Dashboard';
import { Chat } from './pages/Chat';
import { Documents } from './pages/Documents';
import { SearchPage } from './pages/SearchPage';
import { Team } from './pages/Team';
import { Admin } from './pages/Admin';
import { Settings } from './pages/Settings';

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/app" element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="chat" element={<Chat />} />
            <Route path="documents" element={<Documents />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="team" element={<Team />} />
            <Route path="admin" element={<Admin />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </StoreProvider>
  );
}
