import { BrowserRouter, Route, Routes } from 'react-router-dom';

import {
  AuthCallbackPage,
  CompleteProfilePage,
  DailyRitualPage,
  DashboardPage,
  LoginPage,
  PendingVerificationPage,
  RegisterPage,
  WorkoutGuidedPage,
} from '@/pages';
import { ThemeToggle } from '@/shared/ui';

import { AuthSessionGate } from './AuthSessionGate';
import { RequireCompleteUserProfile } from './RequireCompleteUserProfile';

export function App() {
  return (
    <BrowserRouter>
      <main className="min-h-dvh bg-background text-foreground">
        <div className="mx-auto flex w-full max-w-md items-center justify-end px-4 pt-4">
          <ThemeToggle />
        </div>
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
              <Route element={<RequireCompleteUserProfile />}>
                <Route path="/daily" element={<DailyRitualPage />} />
                <Route path="/" element={<DashboardPage />} />
                <Route path="/workout" element={<WorkoutGuidedPage />} />
              </Route>
            </Route>
          </Routes>
        </div>
      </main>
    </BrowserRouter>
  );
}
