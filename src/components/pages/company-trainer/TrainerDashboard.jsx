import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  GraduationCap,
  Plus,
  Check,
  X,
  ArrowUpRight,
  UserCheck,
  ClipboardList,
  Clock3,
  MoreHorizontal,
  FileCheck2,
  Users,
} from "lucide-react";
import Sidebar from "../../layout/Sidebar";
import PageHeader from "../../common/pagesAssets/PageHeader";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../context/ToastContext";
import { Button } from "../../common/Button";
import { trainerAPI } from "../../../services/api";
import { trainerNavItems, trainerSidebarProps } from "./trainerNavigation";
import {
  DUMMY_TRAINER_DASHBOARD,
  DUMMY_TRAINER_APPLICATIONS,
  DUMMY_TRAINER_STUDENTS,
  DUMMY_TRAINER_TASKS,
} from "./trainerMockData";

const COLORS = {
  primary: "#0475FB",
  primarySoft: "#EAF3FF",
  accent: "#FFAD4E",
  accentSoft: "#FFF4E5",
  green: "#22C55E",
  greenSoft: "#EAF9EF",
  purple: "#8B5CF6",
  purpleSoft: "#F2EDFF",
  text: "#172033",
  muted: "#7B8497",
  border: "#E9EDF4",
};

const Card = ({ title, subtitle, action, children, className = "" }) => (
  <section className={`rounded-[18px] border bg-white p-5 shadow-sm ${className}`} style={{ borderColor: COLORS.border }}>
    <div className="flex items-start justify-between gap-3">
      <div>
        <h2 className="text-[16px] font-extrabold text-[#172033]">{title}</h2>
        {subtitle && <p className="mt-1 text-[10px] font-medium text-[#7B8497]">{subtitle}</p>}
      </div>
      {action}
    </div>
    {children}
  </section>
);

const StatCard = ({ icon: Icon, label, value, color, bg, sub, onClick }) => (
  <button type="button" onClick={onClick} className="rounded-[18px] border bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md" style={{ borderColor: COLORS.border }}>
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#7B8497]">{label}</p>
        <p className="mt-1 text-[23px] font-extrabold tracking-[-0.4px] text-[#172033]">{value}</p>
        {sub && <p className="mt-1 text-[10px] font-medium text-[#7B8497]">{sub}</p>}
      </div>
      <div className="rounded-full p-2.5" style={{ backgroundColor: bg }}><Icon size={17} style={{ color }} /></div>
    </div>
  </button>
);

function InternshipProgress({ startDate, endDate }) {
  const progress = useMemo(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    const totalMs = Math.max(1, end.getTime() - start.getTime());
    const elapsedMs = Math.min(totalMs, Math.max(0, today.getTime() - start.getTime()));
    const percent = Math.round((elapsedMs / totalMs) * 100);
    const daysPassed = Math.floor(elapsedMs / 86400000);
    const daysRemaining = Math.max(0, Math.ceil((end.getTime() - Math.max(today.getTime(), start.getTime())) / 86400000));
    const totalDays = Math.ceil(totalMs / 86400000);
    return { percent, daysPassed, daysRemaining, totalDays, start, end };
  }, [startDate, endDate]);

  const circumference = 301.6;
  const dash = (progress.percent / 100) * circumference;

  return (
    <Card title="Internship Progress" subtitle="Program duration and time remaining" action={<button type="button" className="rounded-full p-1.5 text-[#596274] hover:bg-[#F7F9FC]"><MoreHorizontal size={17} /></button>}>
      <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className="relative mx-auto h-40 w-40 shrink-0">
          <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
            <circle cx="60" cy="60" r="48" fill="none" stroke="#E9EDF4" strokeWidth="11" />
            <circle cx="60" cy="60" r="48" fill="none" stroke={COLORS.primary} strokeWidth="11" strokeLinecap="round" strokeDasharray={`${dash} ${circumference}`} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[28px] font-extrabold tracking-[-1px] text-[#172033]">{progress.percent}%</span>
            <span className="text-[10px] font-medium text-[#7B8497]">Time passed</span>
          </div>
        </div>
        <div className="grid flex-1 gap-2.5 sm:grid-cols-2">
          <div className="rounded-xl bg-[#F7F9FC] p-3"><p className="text-[10px] text-[#7B8497]">Start date</p><p className="mt-1 text-xs font-bold text-[#172033]">{progress.start.toLocaleDateString()}</p></div>
          <div className="rounded-xl bg-[#F7F9FC] p-3"><p className="text-[10px] text-[#7B8497]">End date</p><p className="mt-1 text-xs font-bold text-[#172033]">{progress.end.toLocaleDateString()}</p></div>
          <div className="rounded-xl bg-[#F7F9FC] p-3"><p className="text-[10px] text-[#7B8497]">Days passed</p><p className="mt-1 text-xs font-bold text-[#172033]">{progress.daysPassed} days</p></div>
          <div className="rounded-xl bg-[#F7F9FC] p-3"><p className="text-[10px] text-[#7B8497]">Remaining</p><p className="mt-1 text-xs font-bold text-[#172033]">{progress.daysRemaining} days</p></div>
        </div>
      </div>
      <div className="mt-5">
        <div className="h-2 overflow-hidden rounded-full bg-[#EEF1F5]"><div className="h-full rounded-full bg-[#0475FB]" style={{ width: `${progress.percent}%` }} /></div>
        <div className="mt-1.5 flex justify-between text-[9px] font-medium text-[#7B8497]"><span>{progress.daysPassed} of {progress.totalDays} days completed</span><span>{progress.daysRemaining} days remaining</span></div>
      </div>
    </Card>
  );
}

function SubmissionOverview({ tasks }) {
  const rows = tasks.slice(0, 6).map((task) => {
    const total = Number(task.totalStudents ?? task.assignedStudentsCount ?? 24);
    const submitted = Number(task.submittedCount ?? task.submissionsCount ?? 0);
    return { ...task, total, submitted, percent: total ? Math.min(100, Math.round((submitted / total) * 100)) : 0 };
  });
  const highest = [...rows].sort((a, b) => b.percent - a.percent)[0];

  return (
    <Card title="Tasks Submission Overview" subtitle="See which assignments are ready for review" action={<button type="button" className="rounded-lg border border-[#E4E8EF] bg-white px-3 py-2 text-[10px] font-bold text-[#596274]">All Tasks <span className="ml-1">⌄</span></button>}>
      <div className="mt-5 space-y-4">
        {rows.map((task, index) => {
          const barColors = [COLORS.primary, COLORS.green, COLORS.purple, COLORS.accent];
          return <div key={task.id || index}>
            <div className="mb-1.5 flex items-center justify-between gap-3 text-[10px]"><span className="min-w-0 truncate font-semibold text-[#344054]">{task.title}</span><span className="shrink-0 font-bold text-[#596274]">{task.submitted} / {task.total} ({task.percent}%)</span></div>
            <div className="h-2.5 rounded-full bg-[#EEF1F5]"><div className="h-full rounded-full transition-all" style={{ width: `${task.percent}%`, backgroundColor: barColors[index % barColors.length] }} /></div>
          </div>;
        })}
      </div>
      {highest && <div className="mt-5 flex items-center gap-2 rounded-xl bg-[#F7F9FC] px-3 py-2.5 text-[10px] text-[#596274]"><FileCheck2 size={14} className="text-[#22C55E]" /><span>Highest submission: <b className="text-[#172033]">{highest.title}</b> · {highest.submitted} submissions to review</span></div>}
    </Card>
  );
}

function AttendanceMiniCard() {
  const points = [58, 65, 72, 68, 76, 74, 82, 79, 86, 84, 89, 86];
  const max = 100, min = 40, width = 100, height = 36;
  const path = points.map((value, index) => {
    const x = (index / (points.length - 1)) * width;
    const y = height - ((value - min) / (max - min)) * height;
    return `${index === 0 ? "M" : "L"}${x},${y}`;
  }).join(" ");

  return (
    <Card title="Attendance Overview" subtitle="Average attendance this month" action={<span className="rounded-lg border border-[#E4E8EF] px-3 py-1.5 text-[10px] font-bold text-[#596274]">This Month</span>}>
      <div className="mt-4 flex items-end justify-between gap-4">
        <div><p className="text-[27px] font-extrabold text-[#172033]">86.7%</p><p className="mt-1 text-[10px] font-medium text-[#22A75A]">↑ 4.2% vs. last month</p></div>
        <div className="h-16 max-w-[250px] flex-1"><svg viewBox="0 0 100 36" preserveAspectRatio="none" className="h-full w-full overflow-visible"><path d={path} fill="none" stroke={COLORS.primary} strokeWidth="2" strokeLinecap="round" /></svg></div>
      </div>
      <div className="mt-3 flex justify-between text-[9px] text-[#7B8497]"><span>May 20</span><span>Jun 20</span></div>
    </Card>
  );
}

function RecentActivity({ applications, tasks }) {
  const items = [
    ...tasks.filter((task) => Number(task.submittedCount ?? 0) > 0).slice(0, 2).map((task) => ({ icon: Check, bg: COLORS.greenSoft, color: COLORS.green, text: `${task.submittedCount} trainees submitted “${task.title}”`, tag: "Task Submission" })),
    ...applications.slice(0, 2).map((application) => ({ icon: UserCheck, bg: COLORS.accentSoft, color: "#A45A00", text: `New application from ${application.student?.user?.firstName || "Student"} ${application.student?.user?.lastName || ""}`, tag: "New Application" })),
  ].slice(0, 4);

  return (
    <Card title="Recent Activity" subtitle="Latest activity from your internship" action={<button type="button" className="text-[10px] font-extrabold text-[#0475FB]">View all</button>}>
      <div className="mt-3 divide-y divide-[#EEF1F5]">
        {items.map((item, index) => { const Icon = item.icon; return <div key={index} className="flex items-center gap-3 py-3 first:pt-1"><div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: item.bg, color: item.color }}><Icon size={14} /></div><div className="min-w-0 flex-1"><p className="truncate text-[11px] font-semibold text-[#344054]">{item.text}</p><p className="mt-0.5 text-[9px] text-[#7B8497]">Recently</p></div><span className="hidden rounded-full bg-[#F2EDFF] px-2 py-1 text-[9px] font-bold text-[#6D4AE8] sm:block">{item.tag}</span></div>; })}
      </div>
    </Card>
  );
}

export default function TrainerDashboard() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [dashboard, setDashboard] = useState(DUMMY_TRAINER_DASHBOARD);
  const [applications, setApplications] = useState(DUMMY_TRAINER_APPLICATIONS);
  const [students, setStudents] = useState(DUMMY_TRAINER_STUDENTS);
  const [tasks, setTasks] = useState(DUMMY_TRAINER_TASKS);
  const [actingId, setActingId] = useState(null);

  const fullName = `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "Trainer";
  const trainerUser = { name: fullName, role: "Company Trainer", avatar: user?.profileImage || "" };

  // The trainer list endpoints are kept in services/api.js for future backend integration,
  // but are intentionally not invoked here until those routes are available.
  useEffect(() => {
    setDashboard(DUMMY_TRAINER_DASHBOARD);
    setApplications(DUMMY_TRAINER_APPLICATIONS);
    setStudents(DUMMY_TRAINER_STUDENTS);
    setTasks(DUMMY_TRAINER_TASKS);
    setLoading(false);
  }, []);

  const action = async (id, type) => {
    setActingId(id);
    try {
      if (!String(id).startsWith("dummy-")) {
        if (type === "approve") await trainerAPI.approveApplication(id);
        else await trainerAPI.rejectApplication(id);
      }
      setApplications((previous) => previous.filter((application) => application.id !== id));
      showToast(type === "approve" ? "Application approved." : "Application rejected.", "success");
    } catch (error) {
      showToast(error?.message || "Action failed.", "error");
    } finally {
      setActingId(null);
    }
  };

  const stats = dashboard?.stats || {};
  const companyName = dashboard?.company?.name || "Your Company";
  const internship = dashboard?.internship || DUMMY_TRAINER_DASHBOARD.internship;
  const signOut = () => { logout(); navigate("/login"); };

  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-gradient-to-b from-[#F2F7FF] via-[#F8FAFC] to-[#FFF8F4] font-['Inter']">
      <Sidebar navItems={trainerNavItems} footerItems={[]} user={trainerUser} {...trainerSidebarProps} onSignOut={signOut} />
      <main className="relative z-10 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-[1240px] px-5 py-5 sm:px-7 lg:px-8 lg:py-7">
          <PageHeader loading={loading} profile={user} fullName={fullName} studentUser={trainerUser} searchValue="" onSearchChange={() => {}} chatBadge={0} notificationBadge={stats.pendingApplications ?? applications.length} />

          <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7B8497]">Trainer Dashboard</p>
              <h1 className="text-[25px] font-extrabold tracking-[-0.6px] text-[#172033]">Internship Overview</h1>
              <p className="mt-1.5 flex items-center gap-1.5 text-[13px] font-medium text-[#7B8497]"><Building2 size={14} /> {companyName} · Company Trainer</p>
            </div>
            <Button variant="gold" onClick={() => navigate("/company/trainer/tasks")} className="flex items-center gap-1.5 px-4 py-2.5 text-[12px] font-bold"><Plus size={16} /> Create Task</Button>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 xl:grid-cols-4">
            <StatCard icon={GraduationCap} label="Total Trainees" value={stats.totalStudents ?? students.length} color={COLORS.primary} bg={COLORS.primarySoft} sub="Assigned to you" onClick={() => navigate("/company/trainer/students")} />
            <StatCard icon={ClipboardList} label="Tasks" value={(stats.activeTasks ?? 5) + (stats.completedTasks ?? 1)} color={COLORS.green} bg={COLORS.greenSoft} sub={`${stats.activeTasks ?? 5} active · ${stats.completedTasks ?? 1} completed`} onClick={() => navigate("/company/trainer/tasks")} />
            <StatCard icon={UserCheck} label="Pending Applications" value={stats.pendingApplications ?? applications.length} color={COLORS.accent} bg={COLORS.accentSoft} sub="Waiting for your review" onClick={() => navigate("/company/trainer/applications")} />
            <StatCard icon={Clock3} label="Attendance" value={`${stats.attendanceRate ?? 86.7}%`} color={COLORS.primary} bg={COLORS.primarySoft} sub="Average attendance" onClick={() => navigate("/company/trainer/attendance")} />
          </div>

          <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[0.9fr_1.1fr]"><InternshipProgress startDate={internship.startDate} endDate={internship.endDate} /><SubmissionOverview tasks={tasks} /></div>
          <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2"><AttendanceMiniCard /><RecentActivity applications={applications} tasks={tasks} /></div>

          <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
            <Card title="Pending Applications" subtitle="Students requesting to join your internship" action={<button onClick={() => navigate("/company/trainer/applications")} className="text-[10px] font-extrabold text-[#0475FB]">View all</button>}>
              <div className="mt-3 divide-y divide-[#EEF1F5]">
                {applications.slice(0, 4).map((application) => {
                  const student = application.student || {};
                  const name = `${student.user?.firstName || ""} ${student.user?.lastName || ""}`.trim() || "Student";
                  const busy = actingId === application.id;
                  return <div key={application.id} className="flex items-center justify-between gap-3 py-3"><div className="flex min-w-0 items-center gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EAF3FF] text-[11px] font-extrabold text-[#0475FB]">{name[0]}</div><div className="min-w-0"><p className="truncate text-[11px] font-bold text-[#172033]">{name}</p><p className="truncate text-[10px] text-[#7B8497]">{student.major || "—"}</p></div></div><div className="flex gap-1.5"><button disabled={busy} onClick={() => action(application.id, "reject")} className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FEF0F0] text-[#EF4444] disabled:opacity-50"><X size={13} /></button><button disabled={busy} onClick={() => action(application.id, "approve")} className="flex h-7 w-7 items-center justify-center rounded-full bg-[#EAF9EF] text-[#22C55E] disabled:opacity-50"><Check size={13} /></button></div></div>;
                })}
              </div>
            </Card>

            <Card title="My Trainees" subtitle="Interns currently under your supervision" action={<button onClick={() => navigate("/company/trainer/students")} className="text-[10px] font-extrabold text-[#0475FB]">View all</button>}>
              <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {students.slice(0, 4).map((item) => {
                  const student = item.student || item;
                  const name = `${student.user?.firstName || ""} ${student.user?.lastName || ""}`.trim() || "Student";
                  return <div key={item.id} className="flex items-center gap-3 rounded-xl border border-[#E9EDF4] p-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F2EDFF] text-[11px] font-extrabold text-[#6D4AE8]">{name[0]}</div><div className="min-w-0 flex-1"><p className="truncate text-[11px] font-bold text-[#172033]">{name}</p><p className="truncate text-[10px] text-[#7B8497]">{student.major || "—"}</p></div><Users size={14} className="shrink-0 text-[#A0A8B8]" /></div>;
                })}
              </div>
            </Card>
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-[#E9EDF4] py-4 text-[10px] font-medium text-[#7B8497]"><span>Manage your internship activities from the trainer workspace.</span><button onClick={() => navigate("/company/trainer/tasks")} className="flex items-center gap-1 font-extrabold text-[#0475FB]">Go to Tasks <ArrowUpRight size={11} /></button></div>
        </div>
      </main>
    </div>
  );
}
