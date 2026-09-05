import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  GraduationCap,
  UserCheck,
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

function Sparkline({ points, color, fill }) {
  const width = 112;
  const height = 30;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;
  const coords = points.map((point, index) => {
    const x = (index / (points.length - 1)) * width;
    const y = 3 + ((max - point) / range) * 20;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const line = coords.join(" ");
  const area = `0,${height} ${line} ${width},${height}`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-[32px] w-full overflow-visible" preserveAspectRatio="none" aria-hidden="true">
      <polygon points={area} fill={fill} opacity="0.5" />
      <polyline points={line} fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={coords[coords.length - 1].split(",")[0]} cy={coords[coords.length - 1].split(",")[1]} r="2" fill={color} />
    </svg>
  );
}

const MetricCard = ({ icon: Icon, label, value, detail, color, bg, fill, trend, onClick }) => (
  <button type="button" onClick={onClick} className="group min-h-[185px] overflow-hidden rounded-[20px] border bg-white p-5 text-left shadow-[0_8px_30px_rgba(34,42,70,0.05)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_35px_rgba(34,42,70,0.09)]" style={{ borderColor: "#E9EDF4" }}>
    <div className="flex items-start justify-between">
      <span className="flex h-12 w-12 items-center justify-center rounded-[15px]" style={{ backgroundColor: bg, color }}><Icon size={23} /></span>
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F7F8FB] text-[#7B8497] transition group-hover:bg-[#EFEEFF] group-hover:text-[#635BFF]"><ArrowUpRight size={15} /></span>
    </div>
    <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.08em] text-[#8B94A6]">{label}</p>
    <p className="mt-1 text-[30px] font-extrabold leading-none tracking-[-1px] text-[#172033]">{value}</p>
    <p className="mt-2 text-[9px] font-semibold text-[#7B8497]">{detail}</p>
    <div className="mt-2 -mx-1 h-[32px]"><Sparkline points={trend} color={color} fill={fill} /></div>
  </button>
);

function InternshipBanner({ companyName }) {
  return (
    <section className="relative h-[142px] overflow-visible rounded-[22px] px-7 py-5 text-white sm:px-8" style={{ background: "linear-gradient(145deg, rgb(16, 43, 79) 0%, rgb(18, 62, 112) 60%, rgb(4, 117, 251) 140%)", boxShadow: "rgba(15, 45, 80, 0.16) 0px 10px 28px" }}>
      <div className="absolute inset-0 overflow-hidden rounded-[22px]">
        <div className="absolute -right-12 -top-20 h-52 w-52 rounded-full bg-white/[0.07]" />
        <div className="absolute right-[20%] -bottom-24 h-52 w-52 rounded-full bg-[#0475FB]/20" />
      </div>
      <div className="relative z-10 max-w-[62%]">
        <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[9px] font-extrabold uppercase tracking-[0.1em]">Current Internship</span>
        <h2 className="mt-3 text-[24px] font-extrabold tracking-[-0.7px] sm:text-[27px]">Frontend Developer Trainer</h2>
        <p className="mt-2 text-[11px] font-medium text-white/80 sm:text-[12px]">{companyName}<span className="mx-2 text-white/45">•</span>Field Training<span className="mx-2 text-white/45">•</span>Week 8 of 12</p>
      </div>
      <img src="/assets/trainer-dashboard-character.png" alt="" aria-hidden="true" className="pointer-events-none absolute bottom-0 right-[-4px] z-[20] hidden h-[190px] w-auto max-w-[46%] object-contain object-bottom sm:block" />
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
    <Card title="Tasks Submission Overview" subtitle="Track trainee progress across current assignments" action={<button type="button" onClick={onViewTasks} className="rounded-lg border border-[#E4E8EF] bg-white px-3 py-2 text-[10px] font-bold text-[#596274] hover:bg-[#F7F9FC]">This Month <span className="ml-1">⌄</span></button>} className="min-h-[390px]">
      <div className="mt-5 flex items-center gap-5 text-[10px] font-semibold text-[#596274]">
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-[4px] bg-[#F97316]" />Submitted</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-[4px] bg-orange-200/50" />Remaining</span>
      </div>
      <div className="mt-5 flex gap-4">
        <div className="flex h-[250px] w-8 flex-col justify-between pb-9 text-[8px] font-semibold text-[#A0A8B8]"><span>100%</span><span>75%</span><span>50%</span><span>25%</span><span>0%</span></div>
        <div className="relative flex h-[250px] min-w-0 flex-1 items-end justify-between gap-3 border-b border-[#EEF1F5] bg-[linear-gradient(to_bottom,transparent_24.5%,#F0F2F6_25%,transparent_25.5%,transparent_49.5%,#F0F2F6_50%,transparent_50.5%,transparent_74.5%,#F0F2F6_75%,transparent_75.5%)] px-2 sm:gap-5 sm:px-4">
          {rows.map((task, index) => {
            const submittedHeight = (task.percent / 100) * 190;
            const remainingHeight = ((100 - task.percent) / 100) * 190;
            const label = task.title?.replace(/weekly report\s*[–-]\s*/i, "Week ") || `Task ${index + 1}`;
            return (
              <div key={task.id || index} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end">
                <span className="mb-2 text-[9px] font-extrabold text-[#172033]">{task.percent}%</span>
                <div className="flex h-[190px] w-[34px] flex-col justify-end overflow-hidden rounded-t-[9px] bg-orange-200/50 shadow-inner sm:w-[42px]">
                  {remainingHeight > 0 && <div className="w-full bg-orange-200/50" style={{ height: `${remainingHeight}px` }} />}
                  <div className="w-full bg-[#F97316] transition-all duration-500" style={{ height: `${submittedHeight}px` }} />
                </div>
                <span className="mt-3 line-clamp-2 h-7 w-[58px] text-center text-[8px] font-bold leading-3 text-[#667085] sm:w-[72px]" title={task.title}>{label}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-x-5 gap-y-2 border-t border-[#EEF1F5] pt-3 sm:grid-cols-3">
        {rows.map((task, index) => <div key={task.id || index} className="flex min-w-0 items-center justify-between gap-2 text-[9px]"><span className="min-w-0 truncate font-semibold text-[#596274]">T{index + 1} · {task.title}</span><span className="shrink-0 font-extrabold text-[#172033]">{task.submitted}/{task.total}</span></div>)}
      </div>
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
  const signOut = () => { logout(); navigate("/login"); };

  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-[#F7F8FC] font-['Inter']">
      <Sidebar navItems={trainerNavItems} footerItems={[]} user={trainerUser} {...trainerSidebarProps} onSignOut={signOut} />
      <main className="relative z-10 flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="mx-auto flex min-h-0 w-full max-w-[1320px] flex-1 flex-col px-5 py-5 sm:px-7 lg:px-8 lg:py-7">
          <div className="shrink-0">
            <PageHeader loading={loading} profile={user} fullName={fullName} studentUser={trainerUser} searchValue="" onSearchChange={() => {}} chatBadge={0} notificationBadge={stats.pendingApplications ?? applications.length} />
          </div>

          <div className="mt-6 min-h-0 flex-1 grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_330px]">
            <div className="min-h-0 min-w-0 overflow-y-auto overscroll-contain pr-1 pb-8 scrollbar-thin">
              <div className="space-y-5">
                <div className="px-1 pb-0.5">
                  <p className="text-[12px] font-extrabold tracking-[0.01em] text-[#5C667A]">Trainer Dashboard</p>
                  <h1 className="mt-1 text-[30px] font-extrabold tracking-[-1.1px] text-[#101828] sm:text-[34px]">Welcome back, {fullName}</h1>
                  <p className="mt-1.5 text-[13px] font-semibold text-[#667085]">Full Stack developer <span className="mx-2 text-[#B0B7C3]">·</span> Atlas Company</p>
                </div>
                <InternshipBanner companyName={companyName} />
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <MetricCard icon={GraduationCap} label="Total Trainees" value={stats.totalStudents ?? students.length} detail="Currently assigned to you" color={COLORS.primary} bg={COLORS.primarySoft} fill="#635BFF" trend={[20, 24, 22, 26, 24, 27, 25, 30, 28, 32]} onClick={() => navigate("/company/trainer/students")} />
                  <MetricCard icon={ClipboardList} label="Total Tasks" value={Number(stats.activeTasks ?? 5) + Number(stats.completedTasks ?? 1)} detail={`${stats.activeTasks ?? 5} active · ${stats.completedTasks ?? 1} completed`} color={COLORS.green} bg={COLORS.greenSoft} fill="#19B978" trend={[8, 12, 10, 15, 13, 17, 14, 18, 16, 20]} onClick={() => navigate("/company/trainer/tasks")} />
                  <MetricCard icon={UserCheck} label="Pending Applications" value={stats.pendingApplications ?? applications.length} detail="Waiting for your review" color={COLORS.orange} bg={COLORS.orangeSoft} fill="#FF9B4A" trend={[3, 5, 4, 7, 6, 9, 7, 10, 8, 11]} onClick={() => navigate("/company/trainer/applications")} />
                </div>
                <TaskSubmissionChart tasks={tasks} onViewTasks={() => navigate("/company/trainer/tasks")} />
              </div>
            </div>

            <aside className="min-h-0 min-w-0 overflow-y-auto overscroll-contain pr-1 pb-8 scrollbar-thin">
              <div className="space-y-5">
                <CalendarCard />
                <div className="relative overflow-hidden rounded-[20px] border border-[#E9E5FF] bg-gradient-to-br from-[#F3F1FF] via-white to-[#F9F7FF] p-5 shadow-[0_8px_30px_rgba(34,42,70,0.04)]"><div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-[#635BFF]/10" /><div className="relative flex items-center gap-3"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-[#EFEEFF] text-[#635BFF]"><Check size={23} /></div><div><p className="text-[11px] font-extrabold text-[#172033]">You’re doing great!</p><p className="mt-1 text-[9px] leading-4 text-[#7B8497]">Keep guiding your trainees toward a successful internship.</p></div></div></div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}