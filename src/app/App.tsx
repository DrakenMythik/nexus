import { BrowserRouter, Route, Routes } from 'react-router-dom';

import {
  AuthCallbackPage,
  CompleteProfilePage,
  DashboardPage,
  LoginPage,
  PendingVerificationPage,
  RegisterPage,
} from '@/pages';

import { AuthSessionGate } from './AuthSessionGate';
import { RequireProfileDisplayName } from './RequireProfileDisplayName';

export function App() {
  return (
    <BrowserRouter>
      <main className="min-h-dvh bg-background text-foreground">
        <div className="mx-auto w-full max-w-md px-4 py-10">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/register/pending-verification"
              element={<PendingVerificationPage />}
            />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
            <Route element={<AuthSessionGate />}>
              <Route
                path="/complete-profile"
                element={<CompleteProfilePage />}
              />
              <Route element={<RequireProfileDisplayName />}>
                <Route path="/" element={<DashboardPage />} />
              </Route>
            </Route>
          </Routes>
        </div>
      </main>
    </BrowserRouter>
  );
}
