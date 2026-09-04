import { LayoutDashboard, Users, ClipboardList, UserCheck, CalendarCheck2 } from "lucide-react";

export const trainerNavItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/company/trainer/dashboard" },
  { label: "My Trainees", icon: Users, path: "/company/trainer/students" },
  { label: "Tasks", icon: ClipboardList, path: "/company/trainer/tasks" },
  { label: "Applications", icon: UserCheck, path: "/company/trainer/applications" },
  { label: "Attendance", icon: CalendarCheck2, path: "/company/trainer/attendance" },
];

export const trainerSidebarProps = {
  profilePath: "/company/trainer/profile",
  brandPath: "/company/trainer/dashboard",
  storageKey: "sidebar-company-trainer",
};
