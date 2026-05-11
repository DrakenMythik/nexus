import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { AuthCallbackPage, LoginPage, RegisterPage } from '@/pages';

export function App() {
  return (
    <BrowserRouter>
      <main className="min-h-dvh bg-slate-950 text-slate-100">
        <div className="mx-auto w-full max-w-md px-4 py-10">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
            <Route
              path="/"
              element={<div>Nexus Dashboard (Protected)</div>}
            />
          </Routes>
        </div>
      </main>
    </BrowserRouter>
  );
}
