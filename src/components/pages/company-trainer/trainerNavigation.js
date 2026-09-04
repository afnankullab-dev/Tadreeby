import { LayoutDashboard, Users, ClipboardList, UserCheck, CalendarCheck2, BriefcaseBusiness, MessageCircle, Settings } from "lucide-react";

export const trainerNavItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/company/trainer/dashboard" },
  { label: "Internship Details", icon: BriefcaseBusiness, path: "/company/trainer/internship" },
  { label: "My Trainees", icon: Users, path: "/company/trainer/students" },
  { label: "Tasks", icon: ClipboardList, path: "/company/trainer/tasks" },
  { label: "Applications", icon: UserCheck, path: "/company/trainer/applications" },
  { label: "Attendance", icon: CalendarCheck2, path: "/company/trainer/attendance" },
  { label: "Chat", icon: MessageCircle, path: "/company/trainer/chat" },
];

export const trainerSidebarProps = {
  footerItems: [{ label: "Settings", icon: Settings, path: "/company/trainer/settings" }],
  profilePath: "/company/trainer/settings",
  brandPath: "/company/trainer/dashboard",
  chatPath: "/company/trainer/chat",
  storageKey: "sidebar-company-trainer",
};
