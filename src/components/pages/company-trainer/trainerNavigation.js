import {
  LayoutDashboard,
  Users,
  ClipboardList,
  UserCheck,
  CalendarCheck2,
  BriefcaseBusiness,
  Settings,
} from "lucide-react";

export const trainerNavItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Internship Details", icon: BriefcaseBusiness, path: "/company/trainer/internship" },
  { label: "My Trainees", icon: Users, path: "/company/trainer/students" },
  { label: "Tasks", icon: ClipboardList, path: "/company/trainer/tasks" },
  { label: "Applications", icon: UserCheck, path: "/company/trainer/applications" },
  { label: "Attendance", icon: CalendarCheck2, path: "/company/trainer/attendance" },
];

// Shared trainer sidebar behavior used by every trainer screen.
export const trainerSidebarProps = {
  footerItems: [
    { label: "Settings", icon: Settings, path: "/company/trainer/settings" },
  ],
  profilePath: "/company/trainer/settings",
  chatPath: "/company/trainer/chat",
  brandPath: "/dashboard",
  storageKey: "sidebar-company-trainer",
};
