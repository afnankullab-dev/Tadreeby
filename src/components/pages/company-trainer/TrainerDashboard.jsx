// src/components/pages/company-trainer/TrainerDashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  GraduationCap,
  Plus,
  Check,
  X,
  AlertCircle,
  ArrowUpRight,
  UserCheck,
  ClipboardList,
  Clock3,
} from "lucide-react";

import Sidebar from "../../layout/Sidebar";
import PageHeader from "../../common/pagesAssets/PageHeader";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../context/ToastContext";
import { Button } from "../../common/Button";
import { trainerAPI } from "../../../services/api";
import { trainerNavItems, trainerSidebarProps } from "./trainerNavigation";

const COLORS = {
  primary: "#0475FB",
  primarySoft: "#EAF3FF",
  accent: "#FFAD4E",
  accentSoft: "#FFF4E5",
  green: "#22C55E",
  greenSoft: "#EAF9EF",
  red: "#EF4444",
  purple: "#8B5CF6",
  purpleSoft: "#F2EDFF",
  text: "#172033",
  muted: "#7B8497",
  border: "#E9EDF4",
};

const StatCard = ({ icon: Icon, label, value, color, bg, onClick }) => (
  <button type="button" onClick={onClick} disabled={!onClick} className="rounded-[18px] border bg-white p-4 text-left transition duration-300 hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-default" style={{ borderColor: COLORS.border }}>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-[#7B8497]">{label}</p>
        <p className="mt-1 text-[21px] font-extrabold text-[#172033]">{value}</p>
      </div>
      <div className="rounded-full p-2" style={{ backgroundColor: bg }}><Icon size={17} strokeWidth={1.8} style={{ color }} /></div>
    </div>
  </button>
);

const PendingApplicationsCard = ({ applications, onApprove, onReject, actingId, onViewAll }) => (
  <div className="rounded-[18px] border bg-white p-5 shadow-sm" style={{ borderColor: COLORS.border }}>
    <div className="flex items-center justify-between">
      <div><h3 className="text-[16px] font-extrabold text-[#172033]">Pending Applications</h3><p className="mt-1 text-[10px] text-[#7B8497]">Students requesting to join your internship</p></div>
      <button onClick={onViewAll} className="text-[10px] font-extrabold text-[#0475FB] hover:underline">View all</button>
    </div>
    {applications.length === 0 ? (
      <div className="mt-6 flex flex-col items-center justify-center py-8 text-center"><UserCheck size={28} className="text-[#C9D0DB]" /><p className="mt-3 text-[12px] font-medium text-[#7B8497]">No pending applications right now</p></div>
    ) : (
      <div className="mt-4 divide-y divide-[#E9EDF4]">{applications.slice(0, 5).map((app) => {
        const name = `${app.student?.user?.firstName || ""} ${app.student?.user?.lastName || ""}`.trim() || "Student";
        const major = app.student?.major || "—";
        const busy = actingId === app.id;
        return <div key={app.id} className="flex items-center justify-between gap-3 py-3 first:pt-1 last:pb-1">
          <div className="flex min-w-0 items-center gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-extrabold text-white" style={{ backgroundColor: COLORS.primary }}>{name.charAt(0).toUpperCase()}</div><div className="min-w-0"><p className="truncate text-[12px] font-bold text-[#172033]">{name}</p><p className="truncate text-[10px] text-[#7B8497]">{major}</p></div></div>
          <div className="flex shrink-0 items-center gap-1.5"><button type="button" disabled={busy} onClick={() => onApprove(app.id)} className="flex h-7 w-7 items-center justify-center rounded-full bg-[#EAF9EF] text-[#22C55E] disabled:opacity-50" title="Approve"><Check size={14} /></button><button type="button" disabled={busy} onClick={() => onReject(app.id)} className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FEF0F0] text-[#EF4444] disabled:opacity-50" title="Reject"><X size={14} /></button></div>
        </div>;
      })}</div>
    )}
  </div>
);

const MyStudentsCard = ({ students, onViewAll }) => (
  <div className="rounded-[18px] border bg-white p-5 shadow-sm" style={{ borderColor: COLORS.border }}>
    <div className="flex items-center justify-between"><div><h3 className="text-[16px] font-extrabold text-[#172033]">My Trainees</h3><p className="mt-1 text-[10px] text-[#7B8497]">Interns currently under your supervision</p></div><button onClick={onViewAll} className="text-[10px] font-extrabold text-[#0475FB] hover:underline">View all</button></div>
    {students.length === 0 ? <div className="mt-6 flex flex-col items-center justify-center py-8 text-center"><GraduationCap size={28} className="text-[#C9D0DB]" /><p className="mt-3 text-[12px] font-medium text-[#7B8497]">No trainees assigned yet</p></div> : <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">{students.slice(0, 6).map((s) => { const name = `${s.student?.user?.firstName || ""} ${s.student?.user?.lastName || ""}`.trim() || "Student"; return <div key={s.id} className="flex items-center gap-3 rounded-xl border border-[#E9EDF4] p-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-extrabold text-white" style={{ backgroundColor: COLORS.accent }}>{name.charAt(0).toUpperCase()}</div><div className="min-w-0"><p className="truncate text-[12px] font-bold text-[#172033]">{name}</p><p className="truncate text-[10px] text-[#7B8497]">{s.student?.major || "—"}</p></div></div>; })}</div>}
  </div>
);

export default function TrainerDashboard() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dashboard, setDashboard] = useState(null);
  const [applications, setApplications] = useState([]);
  const [students, setStudents] = useState([]);
  const [actingId, setActingId] = useState(null);
  const fullName = `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "Trainer";
  const trainerUser = { name: fullName, role: "Company Trainer", avatar: user?.profileImage || "" };
  const handleSignOut = () => { logout(); navigate("/login"); };
  const fetchData = async () => { setLoading(true); setError(""); try { const [dashboardData, applicationsData, studentsData] = await Promise.all([trainerAPI.getDashboard(), trainerAPI.getPendingApplications(1, 5), trainerAPI.getMyStudents(1, 6)]); setDashboard(dashboardData || {}); setApplications(applicationsData?.data || applicationsData || []); setStudents(studentsData?.data || studentsData || []); } catch (err) { console.error("Failed to fetch trainer dashboard:", err); setError(err?.message || "Failed to load dashboard data."); } finally { setLoading(false); } };
  useEffect(() => { fetchData(); }, []);
  const handleApprove = async (id) => { setActingId(id); try { await trainerAPI.approveApplication(id); setApplications((prev) => prev.filter((a) => a.id !== id)); showToast("Application approved.", "success"); fetchData(); } catch (err) { showToast(err?.message || "Failed to approve application.", "error"); } finally { setActingId(null); } };
  const handleReject = async (id) => { setActingId(id); try { await trainerAPI.rejectApplication(id); setApplications((prev) => prev.filter((a) => a.id !== id)); showToast("Application rejected.", "success"); } catch (err) { showToast(err?.message || "Failed to reject application.", "error"); } finally { setActingId(null); } };
  const companyName = dashboard?.company?.name || "Your Company";
  const stats = { students: dashboard?.stats?.totalStudents ?? students.length, pendingApplications: dashboard?.stats?.pendingApplications ?? applications.length, activeTasks: dashboard?.stats?.activeTasks ?? 0, completedTasks: dashboard?.stats?.completedTasks ?? 0 };

  return <div className="relative flex h-screen w-full overflow-hidden bg-gradient-to-b from-[#F2F7FF] via-[#F8FAFC] to-[#FFF8F4] font-['Inter']">
    <div className="pointer-events-none absolute top-1/4 -left-20 h-80 w-80 rounded-full bg-blue-400/10 blur-3xl" /><div className="pointer-events-none absolute bottom-1/4 -right-20 h-96 w-96 rounded-full bg-orange-400/10 blur-3xl" /><div className="pointer-events-none absolute top-10 right-1/3 h-64 w-64 rounded-full bg-indigo-400/10 blur-3xl" />
    <Sidebar navItems={trainerNavItems} footerItems={[]} user={trainerUser} {...trainerSidebarProps} onSignOut={handleSignOut} />
    <main className="relative z-10 flex-1 overflow-y-auto"><div className="mx-auto w-full max-w-[1240px] px-5 py-5 sm:px-7 lg:px-8 lg:py-7">
      <PageHeader loading={loading} profile={user} fullName={fullName} studentUser={trainerUser} searchValue="" onSearchChange={() => {}} chatBadge={0} notificationBadge={stats.pendingApplications} />
      {error && <div className="mt-4 flex items-start gap-2 rounded-xl border border-[#F8D5D5] bg-[#FEF7F7] px-4 py-3 text-[10px] text-[#B42318]"><AlertCircle size={14} className="mt-0.5 shrink-0" /><span>{error}</span></div>}
      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="mb-1 text-[12px] font-semibold uppercase tracking-[0.12em] text-[#7B8497]">Trainer Dashboard</p><h1 className="text-[25px] font-extrabold tracking-[-0.6px] text-[#172033]">Welcome back, {fullName.split(" ")[0]}</h1><p className="mt-1.5 flex items-center gap-1.5 text-[13px] font-medium text-[#7B8497]"><Building2 size={14} /> {companyName} · Company Trainer</p></div><Button variant="gold" onClick={() => navigate("/company/trainer/tasks")} className="flex items-center gap-1.5 px-4 py-2.5 text-[12px] font-bold"><Plus size={16} strokeWidth={2} /> Create Task</Button></div>
      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4"><StatCard icon={GraduationCap} label="My Trainees" value={loading ? "—" : stats.students} color={COLORS.primary} bg={COLORS.primarySoft} onClick={() => navigate("/company/trainer/students")} /><StatCard icon={UserCheck} label="Pending Applications" value={loading ? "—" : stats.pendingApplications} color={COLORS.accent} bg={COLORS.accentSoft} onClick={() => navigate("/company/trainer/applications")} /><StatCard icon={ClipboardList} label="Active Tasks" value={loading ? "—" : stats.activeTasks} color={COLORS.purple} bg={COLORS.purpleSoft} onClick={() => navigate("/company/trainer/tasks")} /><StatCard icon={Clock3} label="Completed Tasks" value={loading ? "—" : stats.completedTasks} color={COLORS.green} bg={COLORS.greenSoft} onClick={() => navigate("/company/trainer/tasks")} /></div>
      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2"><PendingApplicationsCard applications={applications} onApprove={handleApprove} onReject={handleReject} actingId={actingId} onViewAll={() => navigate("/company/trainer/applications")} /><MyStudentsCard students={students} onViewAll={() => navigate("/company/trainer/students")} /></div>
      <div className="mt-6 flex items-center justify-between border-t border-[#E9EDF4] pt-4 text-[10px] font-medium text-[#7B8497]"><span>Tadreeby helps you manage your interns' training the smart way.</span><button type="button" onClick={() => navigate("/company/trainer/tasks")} className="flex items-center gap-1 font-extrabold text-[#0475FB] hover:underline">Go to Tasks <ArrowUpRight size={11} /></button></div>
    </div></main>
  </div>;
}
