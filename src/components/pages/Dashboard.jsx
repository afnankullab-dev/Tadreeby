import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import SuperAdminDashboard from "./superAdmin/SuperAdminDashboard";
import StudentDashboard from "./student/StudentDashboard";
import UniversityAdminDashboard from "./university-admin/UniversityAdminDashboard";
import CompanyDashboard from "./company-admin/companyDashboard";
import TrainerDashboard from "./company-trainer/TrainerDashboard";

const DASHBOARD_BY_ROLE = {
  SUPER_ADMIN: SuperAdminDashboard,
  STUDENT: StudentDashboard,
  UNIVERSITY_ADMIN: UniversityAdminDashboard,
  COMPANY_ADMIN: CompanyDashboard,
  COMPANY_TRAINER: TrainerDashboard,
};

/**
 * Canonical dashboard entry point for every authenticated role.
 * The URL stays /dashboard while the rendered dashboard is selected
 * from AuthContext instead of maintaining separate dashboard routes.
 */
export default function Dashboard() {
  const { user } = useAuth();
  const DashboardComponent = DASHBOARD_BY_ROLE[user?.role];

  if (!DashboardComponent) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <DashboardComponent />;
}
