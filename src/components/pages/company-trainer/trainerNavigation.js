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
  { label: "Dashboard", icon: LayoutDashboard, path: "/company/trainer/dashboard" },
  { label: "Internship Details", icon: BriefcaseBusiness, path: "/company/trainer/internship" },
  { label: "My Trainees", icon: Users, path: "/company/trainer/students" },
  { label: "Tasks", icon: ClipboardList, path: "/company/trainer/tasks" },
  { label: "Applications", icon: UserCheck, path: "/company/trainer/applications" },
  { label: "Attendance", icon: CalendarCheck2, path: "/company/trainer/attendance" },
];

// Shared trainer sidebar behavior used by every trainer screen.
// Chat is handled by Sidebar's dedicated chatPath, so it appears in the
// Personal section instead of becoming a footer item or main navigation item.
export const trainerSidebarProps = {
  footerItems: [
    { label: "Settings", icon: Settings, path: "/company/trainer/settings" },
  ],
  profilePath: "/company/trainer/settings",
  chatPath: "/company/trainer/chat",
  brandPath: "/company/trainer/dashboard",
  storageKey: "sidebar-company-trainer",
};
