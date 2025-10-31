import { Navigate, Route, Routes } from "react-router-dom";
import { useEffect } from "react";

import { AppLayout } from "@/components/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ActivitiesPage } from "@/pages/ActivitiesPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { LoginPage } from "@/pages/LoginPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { RegisterPage } from "@/pages/RegisterPage";
import { ResumePage } from "@/pages/ResumePage";
import { VerificationPage } from "@/pages/VerificationPage";
import { useAuthStore } from "@/store/auth";
import { useThemeStore } from "@/store/theme";

export default function App() {
  const token = useAuthStore((state) => state.token);
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    const { body, documentElement } = document;
    body.classList.toggle("theme--light", theme === "light");
    body.classList.toggle("theme--dark", theme === "dark");
    documentElement.classList.toggle("dark", theme === "dark");
    documentElement.style.setProperty("color-scheme", theme === "dark" ? "dark" : "light");
  }, [theme]);

  return (
    <Routes>
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="activities" element={<ActivitiesPage />} />
          <Route path="resume" element={<ResumePage />} />
          <Route path="verification" element={<VerificationPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
      </Route>

      <Route path="/login" element={token ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/register" element={token ? <Navigate to="/" replace /> : <RegisterPage />} />
      <Route path="*" element={<Navigate to={token ? "/" : "/login"} replace />} />
    </Routes>
  );
}
