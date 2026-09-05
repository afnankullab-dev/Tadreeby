import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  CalendarDays,
  CalendarPlus,
  Check,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FileText,
  GraduationCap,
  Plus,
  UserCheck,
  UserPlus,
} from "lucide-react";
import Sidebar from "../../layout/Sidebar";
import PageHeader from "../../common/pagesAssets/PageHeader";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../context/ToastContext";
import { trainerAPI } from "../../../services/api";
import { trainerNavItems, trainerSidebarProps } from "./trainerNavigation";
import {
  DUMMY_TRAINER_APPLICATIONS,
  DUMMY_TRAINER_DASHBOARD,
  DUMMY_TRAINER_STUDENTS,
  DUMMY_TRAINER_TASKS,
} from "./trainerMockData";

const COLORS = {
  primary: "#635BFF",
  primarySoft: "#EFEEFF",
  green: "#19B978",
  greenSoft: "#E9FAF3",
  orange: "#FF9B4A",
  orangeSoft: "#FFF1E6",
  pink: "#F45B8A",
  pinkSoft: "#FFEAF1",
};

const Card = ({ title, subtitle, action, children, className = "" }) => (
  <section className={`rounded-[20px] border bg-white p-5 shadow-[0_8px_30px_rgba(34,42,70,0.05)] ${className}`} style={{ borderColor: "#E9EDF4" }}>
    {(title || action) && (
      <div className="flex items-start justify-between gap-3">
        <div>
          {title && <h2 className="text-[16px] font-extrabold tracking-[-0.2px] text-[#172033]">{title}</h2>}
          {subtitle && <p className="mt-1 text-[10px] font-medium text-[#7B8497]">{subtitle}</p>}
        </div>
        {action}
      </div>
    )}
    {children}
  </section>
);

const MetricCard = ({ icon: Icon, label, value, detail, color, bg, onClick }) => (
  <button type="button" onClick={onClick} className="group min-h-[155px] rounded-[20px] border bg-white p-5 text-left shadow-[0_8px_30px_rgba(34,42,70,0.05)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_35px_rgba(34,42,70,0.09)]" style={{ borderColor: "#E9EDF4" }}>
    <div className="flex items-start justify-between">
      <span className="flex h-12 w-12 items-center justify-center rounded-[15px]" style={{ backgroundColor: bg, color }}><Icon size={23} /></span>
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F7F8FB] text-[#7B8497] transition group-hover:bg-[#EFEEFF] group-hover:text-[#635BFF]"><ArrowUpRight size={15} /></span>
    </div>
    <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.08em] text-[#8B94A6]">{label}</p>
    <p className="mt-1 text-[30px] font-extrabold tracking-[-1px] text-[#172033]">{value}</p>
    <p className="mt-1 text-[10px] font-semibold text-[#7B8497]">{detail}</p>
  </button>
);

function InternshipBanner({ companyName }) {
  return (
    <section className="relative h-[142px] overflow-hidden rounded-[22px] bg-gradient-to-r from-[#5146E5] via-[#6657F4] to-[#7568F7] px-7 py-5 text-white shadow-[0_12px_35px_rgba(99,91,255,0.22)] sm:px-8">
      <div className="absolute -right-8 -top-16 h-44 w-44 rounded-full bg-white/10" />
      <div className="absolute right-36 -bottom-20 h-44 w-44 rounded-full bg-[#8D85FF]/30" />
      <div className="absolute right-12 top-7 h-24 w-24 rounded-full bg-white/5" />
      <div className="relative z-10 max-w-[65%]">
        <span className="inline-flex rounded-full border border-white/25 bg-white/15 px-3 py-1 text-[9px] font-extrabold uppercase tracking-[0.1em] backdrop-blur-sm">Current Internship</span>
        <h2 className="mt-3 text-[24px] font-extrabold tracking-[-0.7px] sm:text-[27px]">Frontend Developer Trainer</h2>
        <p className="mt-2 text-[11px] font-medium text-white/85 sm:text-[12px]">{companyName}<span className="mx-2 text-white/50">•</span>Field Training<span className="mx-2 text-white/50">•</span>Week 8 of 12</p>
      </div>
      <div className="absolute bottom-3 right-5 hidden h-[112px] w-[210px] sm:block" aria-hidden="true">
        <div className="absolute bottom-5 right-24 h-14 w-20 rotate-[-2deg] rounded-xl border border-white/30 bg-white/20 p-2 shadow-lg backdrop-blur-sm">
          <div className="h-1.5 w-7 rounded-full bg-white/65" /><div className="mt-2 h-1.5 w-12 rounded-full bg-white/40" /><div className="mt-2 h-1.5 w-9 rounded-full bg-white/30" />
        </div>
        <div className="absolute bottom-0 right-2 h-[105px] w-[105px]">
          <div className="absolute bottom-0 left-4 h-14 w-20 rounded-[18px] bg-gradient-to-br from-[#FFB56B] to-[#F07C4D] shadow-xl" />
          <div className="absolute bottom-3 left-0 h-12 w-7 -rotate-12 rounded-full bg-[#5146E5]" />
          <div className="absolute bottom-2 right-0 h-10 w-7 rotate-12 rounded-full bg-[#5146E5]" />
          <div className="absolute left-7 top-8 h-12 w-12 rounded-full bg-[#FFD2A9] shadow-md" />
          <div className="absolute left-6 top-5 h-6 w-14 -rotate-6 rounded-full bg-[#3A2924]" />
          <span className="absolute left-[35px] top-[27px] h-1.5 w-1.5 rounded-full bg-[#172033]" /><span className="absolute left-[48px] top-[27px] h-1.5 w-1.5 rounded-full bg-[#172033]" />
          <div className="absolute left-[38px] top-[35px] h-1 w-4 rounded-full bg-[#E58C76]" />
          <div className="absolute bottom-0 left-7 h-3 w-9 rounded-full bg-[#252B54]" />
          <div className="absolute bottom-0 right-2 h-3 w-9 rounded-full bg-[#252B54]" />
        </div>
      </div>
    </section>
  );
}

function TaskSubmissionChart({ tasks, onViewTasks }) {
  const rows = tasks.slice(0, 6).map((task) => {
    const total = Number(task.totalStudents ?? task.assignedStudentsCount ?? 24);
    const submitted = Math.min(total, Number(task.submittedCount ?? task.submissionsCount ?? 0));
    return { ...task, total, submitted, percent: total ? Math.round((submitted / total) * 100) : 0 };
  });
  return (
    <Card title="Tasks Submission Overview" subtitle="Track trainee progress across current assignments" action={<button type="button" onClick={onViewTasks} className="rounded-lg border border-[#E4E8EF] bg-white px-3 py-2 text-[10px] font-bold text-[#596274] hover:bg-[#F7F9FC]">This Month <span className="ml-1">⌄</span></button>} className="min-h-[380px]">
      <div className="mt-5 flex items-center gap-5 text-[10px] font-semibold text-[#596274]"><span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-[#635BFF]" />Submitted</span><span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-[#DCDCF8]" />Remaining</span></div>
      <div className="mt-5 flex gap-3">
        <div className="flex h-[215px] w-8 flex-col justify-between pb-8 text-[8px] font-semibold text-[#A0A8B8]"><span>100%</span><span>75%</span><span>50%</span><span>25%</span><span>0%</span></div>
        <div className="relative flex h-[215px] min-w-0 flex-1 items-end justify-around gap-2 border-b border-[#EEF1F5] bg-[linear-gradient(to_bottom,transparent_24%,#F2F3F7_25%,transparent_26%,transparent_49%,#F2F3F7_50%,transparent_51%,transparent_74%,#F2F3F7_75%,transparent_76%)]">
          {rows.map((task, index) => {
            const submittedHeight = Math.max(12, (task.percent / 100) * 165);
            const remainingHeight = Math.max(0, 165 - submittedHeight);
            return <div key={task.id || index} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end"><span className="mb-2 text-[9px] font-extrabold text-[#344054]">{task.percent}%</span><div className="flex w-full max-w-[42px] flex-col justify-end overflow-hidden rounded-t-[8px]" style={{ height: 165 }}><div className="w-full bg-gradient-to-t from-[#635BFF] to-[#817BFF]" style={{ height: submittedHeight }} />{remainingHeight > 0 && <div className="w-full bg-[#DCDCF8]" style={{ height: remainingHeight }} />}</div><span className="mt-3 w-full truncate text-center text-[8px] font-bold text-[#7B8497]" title={task.title}>T{index + 1}</span></div>;
          })}
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-x-5 gap-y-2 border-t border-[#EEF1F5] pt-3 sm:grid-cols-3">{rows.map((task, index) => <div key={task.id || index} className="flex min-w-0 items-center justify-between gap-2 text-[9px]"><span className="min-w-0 truncate font-semibold text-[#596274]">T{index + 1} · {task.title}</span><span className="shrink-0 font-extrabold text-[#172033]">{task.submitted}/{task.total}</span></div>)}</div>
    </Card>
  );
}

const EVENTS = [
  { date: 8, title: "Weekly Mentor Meeting", time: "10:00 AM", color: COLORS.primary, bg: COLORS.primarySoft },
  { date: 10, title: "Project Review", time: "02:00 PM", color: COLORS.green, bg: COLORS.greenSoft },
  { date: 15, title: "Weekly Progress Sync", time: "11:30 AM", color: COLORS.orange, bg: COLORS.orangeSoft },
];

function CalendarCard() {
  const year = 2026; const month = 8; const today = 5;
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = Array.from({ length: Math.ceil((firstDay + daysInMonth) / 7) * 7 }, (_, i) => { const day = i - firstDay + 1; return day > 0 && day <= daysInMonth ? day : null; });
  const eventDates = new Set(EVENTS.map((event) => event.date));
  return (
    <Card title="Calendar" subtitle="Your upcoming internship schedule">
      <div className="mt-4 flex items-center justify-between"><button type="button" className="rounded-full p-1.5 text-[#7B8497] hover:bg-[#F7F8FB]"><ChevronLeft size={16} /></button><h3 className="text-[14px] font-extrabold text-[#172033]">September 2026</h3><button type="button" className="rounded-full p-1.5 text-[#7B8497] hover:bg-[#F7F8FB]"><ChevronRight size={16} /></button></div>
      <div className="mt-4 grid grid-cols-7 text-center text-[9px] font-extrabold uppercase text-[#9AA2B1]">{['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => <span key={day} className="py-1">{day}</span>)}</div>
      <div className="mt-1 grid grid-cols-7 gap-y-1 text-center">{cells.map((day, index) => <div key={index} className="flex h-9 items-center justify-center">{day && <div className={`relative flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold ${day === today ? 'bg-[#635BFF] text-white shadow-[0_4px_12px_rgba(99,91,255,0.28)]' : 'text-[#344054]'}`}>{day}{eventDates.has(day) && day !== today && <span className="absolute bottom-0.5 h-1 w-1 rounded-full bg-[#635BFF]" />}</div>}</div>)}</div>
      <div className="mt-4 border-t border-[#EEF1F5] pt-4"><div className="flex items-center justify-between"><p className="text-[12px] font-extrabold text-[#172033]">Upcoming Events</p><CalendarDays size={15} className="text-[#635BFF]" /></div><div className="mt-3 space-y-2.5">{EVENTS.map((event) => <div key={event.date} className="flex items-center gap-3 rounded-[14px] border border-[#EEF1F5] bg-white p-2.5 shadow-[0_4px_15px_rgba(34,42,70,0.035)]"><div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-[11px]" style={{ backgroundColor: event.bg, color: event.color }}><span className="text-[8px] font-extrabold uppercase">Sep</span><span className="text-[14px] font-extrabold leading-4">{event.date}</span></div><div className="min-w-0 flex-1"><p className="truncate text-[10px] font-extrabold text-[#344054]">{event.title}</p><p className="mt-0.5 text-[9px] font-medium text-[#7B8497]">Sep {event.date}, 2026 · {event.time}</p></div><span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: event.color }} /></div>)}</div><button type="button" className="mt-3 flex w-full items-center justify-center gap-1 text-[9px] font-extrabold text-[#635BFF]">View all events <ArrowUpRight size={11} /></button></div>
    </Card>
  );
}

function QuickActions({ onCreateTask, onApplications, onStudents }) {
  const actions = [
    { icon: Plus, title: "Create New Task", subtitle: "Assign a new task", color: COLORS.primary, bg: COLORS.primarySoft, onClick: onCreateTask },
    { icon: UserPlus, title: "Add Trainee", subtitle: "Manage your trainees", color: COLORS.green, bg: COLORS.greenSoft, onClick: onStudents },
    { icon: FileText, title: "Review Applications", subtitle: "Check new applications", color: COLORS.orange, bg: COLORS.orangeSoft, onClick: onApplications },
    { icon: CalendarPlus, title: "Schedule Meeting", subtitle: "Plan a trainer meeting", color: COLORS.pink, bg: COLORS.pinkSoft, onClick: () => {} },
  ];
  return <Card title="Quick Actions" subtitle="Common trainer tasks"><div className="mt-4 grid grid-cols-2 gap-2.5">{actions.map((item) => { const Icon = item.icon; return <button key={item.title} type="button" onClick={item.onClick} className="group rounded-[15px] border border-[#EEF1F5] bg-[#FCFCFE] p-3 text-left transition hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_8px_20px_rgba(34,42,70,0.06)]"><span className="flex h-9 w-9 items-center justify-center rounded-[11px]" style={{ backgroundColor: item.bg, color: item.color }}><Icon size={17} /></span><p className="mt-2.5 text-[10px] font-extrabold text-[#344054]">{item.title}</p><p className="mt-0.5 text-[8px] leading-3 text-[#8B94A6]">{item.subtitle}</p></button>; })}</div></Card>;
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

  useEffect(() => {
    setDashboard(DUMMY_TRAINER_DASHBOARD); setApplications(DUMMY_TRAINER_APPLICATIONS); setStudents(DUMMY_TRAINER_STUDENTS); setTasks(DUMMY_TRAINER_TASKS); setLoading(false);
  }, []);

  const action = async (id, type) => {
    setActingId(id);
    try {
      if (!String(id).startsWith("dummy-")) { if (type === "approve") await trainerAPI.approveApplication(id); else await trainerAPI.rejectApplication(id); }
      setApplications((previous) => previous.filter((application) => application.id !== id));
      showToast(type === "approve" ? "Application approved." : "Application rejected.", "success");
    } catch (error) { showToast(error?.message || "Action failed.", "error"); } finally { setActingId(null); }
  };

  const stats = dashboard?.stats || {};
  const companyName = dashboard?.company?.name || "Your Company";
  const signOut = () => { logout(); navigate("/login"); };

  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-[#F7F8FC] font-['Inter']">
      <Sidebar navItems={trainerNavItems} footerItems={[]} user={trainerUser} {...trainerSidebarProps} onSignOut={signOut} />
      <main className="relative z-10 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-[1320px] px-5 py-5 sm:px-7 lg:px-8 lg:py-7">
          <PageHeader loading={loading} profile={user} fullName={fullName} studentUser={trainerUser} searchValue="" onSearchChange={() => {}} chatBadge={0} notificationBadge={stats.pendingApplications ?? applications.length} />
          <div className="mt-6 grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_330px]">
            <div className="min-w-0 space-y-5">
              <InternshipBanner companyName={companyName} />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <MetricCard icon={GraduationCap} label="Total Trainees" value={stats.totalStudents ?? students.length} detail="Currently assigned to you" color={COLORS.primary} bg={COLORS.primarySoft} onClick={() => navigate("/company/trainer/students")} />
                <MetricCard icon={ClipboardList} label="Total Tasks" value={Number(stats.activeTasks ?? 5) + Number(stats.completedTasks ?? 1)} detail={`${stats.activeTasks ?? 5} active · ${stats.completedTasks ?? 1} completed`} color={COLORS.green} bg={COLORS.greenSoft} onClick={() => navigate("/company/trainer/tasks")} />
                <MetricCard icon={UserCheck} label="Pending Applications" value={stats.pendingApplications ?? applications.length} detail="Waiting for your review" color={COLORS.orange} bg={COLORS.orangeSoft} onClick={() => navigate("/company/trainer/applications")} />
              </div>
              <TaskSubmissionChart tasks={tasks} onViewTasks={() => navigate("/company/trainer/tasks")} />
            </div>
            <aside className="min-w-0 space-y-5">
              <CalendarCard />
              <QuickActions onCreateTask={() => navigate("/company/trainer/tasks")} onApplications={() => navigate("/company/trainer/applications")} onStudents={() => navigate("/company/trainer/students")} />
              <div className="relative overflow-hidden rounded-[20px] border border-[#E9E5FF] bg-gradient-to-br from-[#F3F1FF] via-white to-[#F9F7FF] p-5 shadow-[0_8px_30px_rgba(34,42,70,0.04)]"><div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-[#635BFF]/10" /><div className="relative flex items-center gap-3"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-[#EFEEFF] text-[#635BFF]"><Check size={23} /></div><div><p className="text-[11px] font-extrabold text-[#172033]">You’re doing great!</p><p className="mt-1 text-[9px] leading-4 text-[#7B8497]">Keep guiding your trainees toward a successful internship.</p></div></div></div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
