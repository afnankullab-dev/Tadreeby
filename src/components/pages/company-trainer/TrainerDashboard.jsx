import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  Building2,
  Check,
  ClipboardList,
  Clock3,
  FileCheck2,
  GraduationCap,
  MoreHorizontal,
  Plus,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import Sidebar from "../../layout/Sidebar";
import PageHeader from "../../common/pagesAssets/PageHeader";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../context/ToastContext";
import { Button } from "../../common/Button";
import { trainerAPI } from "../../../services/api";
import { trainerNavItems, trainerSidebarProps } from "./trainerNavigation";
import {
  DUMMY_TRAINER_APPLICATIONS,
  DUMMY_TRAINER_DASHBOARD,
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
  <section
    className={`rounded-[20px] border bg-white p-5 shadow-sm ${className}`}
    style={{ borderColor: COLORS.border }}
  >
    <div className="flex items-start justify-between gap-3">
      <div>
        <h2 className="text-[16px] font-extrabold text-[#172033]">{title}</h2>
        {subtitle && (
          <p className="mt-1 text-[10px] font-medium text-[#7B8497]">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
    {children}
  </section>
);

const StatCard = ({ icon: Icon, label, value, color, bg, sub, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="rounded-[18px] border bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    style={{ borderColor: COLORS.border }}
  >
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#7B8497]">
          {label}
        </p>
        <p className="mt-1 text-[23px] font-extrabold tracking-[-0.4px] text-[#172033]">
          {value}
        </p>
        {sub && <p className="mt-1 text-[10px] font-medium text-[#7B8497]">{sub}</p>}
      </div>
      <div className="rounded-full p-2.5" style={{ backgroundColor: bg }}>
        <Icon size={17} style={{ color }} />
      </div>
    </div>
  </button>
);

function InternshipTimeGauge({ startDate, endDate }) {
  const progress = useMemo(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    const totalMs = Math.max(1, end.getTime() - start.getTime());
    const elapsedMs = Math.min(
      totalMs,
      Math.max(0, today.getTime() - start.getTime())
    );
    const percent = Math.round((elapsedMs / totalMs) * 100);
    const daysPassed = Math.floor(elapsedMs / 86400000);
    const daysRemaining = Math.max(
      0,
      Math.ceil(
        (end.getTime() - Math.max(today.getTime(), start.getTime())) / 86400000
      )
    );
    const totalDays = Math.ceil(totalMs / 86400000);
    return { percent, daysPassed, daysRemaining, totalDays, start, end };
  }, [startDate, endDate]);

  // A 180-degree gauge, inspired by the reference dashboard's time tracker.
  const radius = 78;
  const circumference = Math.PI * radius;
  const dash = (progress.percent / 100) * circumference;

  return (
    <Card
      title="Internship Time"
      subtitle="Overall progress through the training period"
      action={
        <button
          type="button"
          className="rounded-full p-1.5 text-[#596274] hover:bg-[#F7F9FC]"
          aria-label="More internship time options"
        >
          <MoreHorizontal size={17} />
        </button>
      }
    >
      <div className="mt-3 flex flex-col items-center">
        <div className="relative h-[150px] w-full max-w-[330px] overflow-hidden">
          <svg viewBox="0 0 200 115" className="absolute inset-x-0 top-1 h-[180px] w-full">
            <path
              d="M 22 100 A 78 78 0 0 1 178 100"
              fill="none"
              stroke="#EEF1F5"
              strokeWidth="14"
              strokeLinecap="round"
            />
            <path
              d="M 22 100 A 78 78 0 0 1 178 100"
              fill="none"
              stroke={COLORS.primary}
              strokeWidth="14"
              strokeLinecap="round"
              strokeDasharray={`${dash} ${circumference}`}
            />
            <circle cx="22" cy="100" r="4" fill="#D9E8FA" />
            <circle cx="178" cy="100" r="4" fill="#D9E8FA" />
          </svg>
          <div className="absolute inset-x-0 bottom-1 text-center">
            <p className="text-[30px] font-extrabold tracking-[-1px] text-[#172033]">
              {progress.percent}%
            </p>
            <p className="text-[10px] font-semibold text-[#7B8497]">Time Passed</p>
          </div>
        </div>

        <div className="mt-1 grid w-full grid-cols-2 gap-3">
          <div className="rounded-xl bg-[#F7F9FC] p-3">
            <p className="text-[9px] font-medium text-[#7B8497]">Start Date</p>
            <p className="mt-1 text-[11px] font-bold text-[#172033]">
              {progress.start.toLocaleDateString()}
            </p>
          </div>
          <div className="rounded-xl bg-[#F7F9FC] p-3">
            <p className="text-[9px] font-medium text-[#7B8497]">End Date</p>
            <p className="mt-1 text-[11px] font-bold text-[#172033]">
              {progress.end.toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="mt-3 flex w-full items-center justify-between text-[9px] text-[#7B8497]">
          <span>{progress.daysPassed} days passed</span>
          <span>{progress.daysRemaining} days remaining</span>
        </div>
        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[#EEF1F5]">
          <div
            className="h-full rounded-full bg-[#0475FB]"
            style={{ width: `${progress.percent}%` }}
          />
        </div>
        <p className="mt-1.5 self-end text-[9px] font-medium text-[#7B8497]">
          {progress.totalDays} days total
        </p>
      </div>
    </Card>
  );
}

function TaskSubmissionChart({ tasks, onViewTasks }) {
  const rows = tasks.slice(0, 6).map((task) => {
    const total = Number(task.totalStudents ?? task.assignedStudentsCount ?? 24);
    const submitted = Math.min(
      total,
      Number(task.submittedCount ?? task.submissionsCount ?? 0)
    );
    const percent = total ? Math.round((submitted / total) * 100) : 0;
    return { ...task, total, submitted, remaining: Math.max(0, total - submitted), percent };
  });

  return (
    <Card
      title="Task Submissions"
      subtitle="Submitted work compared with outstanding submissions"
      action={
        <button
          type="button"
          onClick={onViewTasks}
          className="rounded-lg border border-[#E4E8EF] bg-white px-3 py-2 text-[10px] font-bold text-[#596274] hover:bg-[#F7F9FC]"
        >
          All Tasks <span className="ml-1">⌄</span>
        </button>
      }
    >
      <div className="mt-5 flex items-end gap-3 border-b border-[#EEF1F5] px-1 pb-2">
        <div className="flex w-8 flex-col justify-between text-[8px] font-medium text-[#A0A8B8]" style={{ height: 172 }}>
          <span>100%</span>
          <span>75%</span>
          <span>50%</span>
          <span>25%</span>
          <span>0%</span>
        </div>
        <div className="flex h-[172px] min-w-0 flex-1 items-end justify-around gap-2">
          {rows.map((task, index) => {
            const submittedHeight = Math.max(8, (task.percent / 100) * 150);
            const remainingHeight = task.remaining ? Math.max(4, 150 - submittedHeight) : 0;
            return (
              <div key={task.id || index} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end">
                <div className="mb-1 text-[8px] font-extrabold text-[#596274]">
                  {task.percent}%
                </div>
                <div className="flex w-full max-w-[38px] flex-col justify-end overflow-hidden rounded-t-[7px] bg-[#F1F4F8]" style={{ height: 150 }}>
                  <div className="w-full rounded-t-[7px] bg-[#0475FB] transition-all" style={{ height: submittedHeight }} title={`${task.submitted} submitted`} />
                  {remainingHeight > 0 && (
                    <div className="w-full bg-[#DDE3EC]" style={{ height: remainingHeight }} title={`${task.remaining} remaining`} />
                  )}
                </div>
                <span className="mt-2 w-full truncate text-center text-[8px] font-semibold text-[#7B8497]" title={task.title}>
                  {`T${index + 1}`}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4 text-[9px] font-semibold text-[#596274]">
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-[#0475FB]" /> Submitted</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-[#DDE3EC]" /> Remaining</span>
        </div>
        {rows.length > 0 && (
          <span className="text-[9px] font-medium text-[#7B8497]">T1–T{rows.length} · 24 trainees</span>
        )}
      </div>

      <div className="mt-4 space-y-2 border-t border-[#EEF1F5] pt-3">
        {rows.slice(0, 3).map((task) => (
          <div key={task.id} className="flex items-center gap-2 text-[9px]">
            <span className="w-6 shrink-0 font-extrabold text-[#A0A8B8]">{task.percent}%</span>
            <span className="min-w-0 flex-1 truncate font-semibold text-[#344054]">{task.title}</span>
            <span className="shrink-0 text-[#7B8497]">{task.submitted}/{task.total}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function AttendanceGauge({ attendanceRate, onViewAttendance }) {
  const value = Number(attendanceRate ?? 86.7);
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const dash = (Math.min(100, Math.max(0, value)) / 100) * circumference;

  return (
    <Card
      title="Attendance"
      subtitle="Average trainee attendance"
      action={
        <button
          type="button"
          onClick={onViewAttendance}
          className="text-[10px] font-extrabold text-[#0475FB]"
        >
          View Details
        </button>
      }
    >
      <div className="mt-4 flex items-center gap-5">
        <div className="relative h-[112px] w-[112px] shrink-0">
          <svg viewBox="0 0 112 112" className="h-full w-full -rotate-90">
            <circle cx="56" cy="56" r={radius} fill="none" stroke="#EEF1F5" strokeWidth="10" />
            <circle
              cx="56"
              cy="56"
              r={radius}
              fill="none"
              stroke={COLORS.green}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${dash} ${circumference}`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[21px] font-extrabold text-[#172033]">{value}%</span>
            <span className="text-[8px] font-semibold text-[#7B8497]">Present</span>
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[20px] font-extrabold tracking-[-0.4px] text-[#172033]">Good</p>
          <p className="mt-1 text-[10px] leading-4 text-[#7B8497]">
            Your trainees are maintaining a strong attendance rate across the internship.
          </p>
          <div className="mt-3 flex items-center gap-2 text-[9px] font-bold text-[#22A75A]">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#EAF9EF]">↑</span>
            On track
          </div>
        </div>
      </div>
    </Card>
  );
}

function RecentActivity({ applications, tasks }) {
  const items = [
    ...tasks
      .filter((task) => Number(task.submittedCount ?? 0) > 0)
      .slice(0, 2)
      .map((task) => ({
        icon: Check,
        bg: COLORS.greenSoft,
        color: COLORS.green,
        text: `${task.submittedCount} trainees submitted “${task.title}”`,
        tag: "Task Submission",
      })),
    ...applications.slice(0, 2).map((application) => ({
      icon: UserCheck,
      bg: COLORS.accentSoft,
      color: "#A45A00",
      text: `New application from ${application.student?.user?.firstName || "Student"} ${application.student?.user?.lastName || ""}`,
      tag: "New Application",
    })),
  ].slice(0, 4);

  return (
    <Card
      title="Recent Activity"
      subtitle="Latest activity from your internship"
      action={<span className="text-[10px] font-extrabold text-[#0475FB]">Today</span>}
    >
      <div className="mt-3 divide-y divide-[#EEF1F5]">
        {items.map((item, index) => {
          const Icon = item.icon;
          return (
            <div key={index} className="flex items-center gap-3 py-3 first:pt-1">
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: item.bg, color: item.color }}
              >
                <Icon size={14} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[11px] font-semibold text-[#344054]">{item.text}</p>
                <p className="mt-0.5 text-[9px] text-[#7B8497]">Recently</p>
              </div>
              <span className="hidden rounded-full bg-[#F2EDFF] px-2 py-1 text-[9px] font-bold text-[#6D4AE8] sm:block">
                {item.tag}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function TraineeOverview({ students, onViewAll, onOpenStudent }) {
  return (
    <Card
      title="Trainee Overview"
      subtitle="Interns currently under your supervision"
      action={
        <button type="button" onClick={onViewAll} className="text-[10px] font-extrabold text-[#0475FB]">
          View all
        </button>
      }
      className="overflow-hidden"
    >
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[680px] border-collapse text-left">
          <thead>
            <tr className="border-b border-[#EEF1F5] text-[9px] font-bold uppercase tracking-[0.06em] text-[#9AA2B1]">
              <th className="px-2 pb-3">Trainee</th>
              <th className="px-2 pb-3">Major</th>
              <th className="px-2 pb-3">Tasks</th>
              <th className="px-2 pb-3">Attendance</th>
              <th className="px-2 pb-3">Status</th>
              <th className="px-2 pb-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {students.slice(0, 5).map((item, index) => {
              const student = item.student || item;
              const name = `${student.user?.firstName || ""} ${student.user?.lastName || ""}`.trim() || "Student";
              const attendance = [92, 88, 84, 91, 79][index % 5];
              const completed = [5, 4, 4, 5, 3][index % 5];
              const status = attendance >= 80 ? "On Track" : "Needs Attention";
              return (
                <tr key={item.id || index} className="border-b border-[#F1F3F7] last:border-0">
                  <td className="px-2 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EAF3FF] text-[10px] font-extrabold text-[#0475FB]">
                        {name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-[10px] font-bold text-[#172033]">{name}</p>
                        <p className="truncate text-[9px] text-[#7B8497]">{student.email || "—"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-2 py-3 text-[10px] font-semibold text-[#596274]">{student.major || "—"}</td>
                  <td className="px-2 py-3 text-[10px] font-bold text-[#596274]">{completed}/6</td>
                  <td className="px-2 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-14 overflow-hidden rounded-full bg-[#EEF1F5]">
                        <div className="h-full rounded-full bg-[#22C55E]" style={{ width: `${attendance}%` }} />
                      </div>
                      <span className="text-[9px] font-bold text-[#596274]">{attendance}%</span>
                    </div>
                  </td>
                  <td className="px-2 py-3">
                    <span className={`rounded-full px-2 py-1 text-[8px] font-extrabold ${status === "On Track" ? "bg-[#EAF9EF] text-[#19964A]" : "bg-[#FFF4E5] text-[#A45A00]"}`}>
                      {status}
                    </span>
                  </td>
                  <td className="px-2 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => onOpenStudent(item.id)}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-full text-[#7B8497] hover:bg-[#F7F9FC] hover:text-[#0475FB]"
                      aria-label={`Open ${name}`}
                    >
                      <ArrowUpRight size={13} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
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
  const trainerUser = {
    name: fullName,
    role: "Company Trainer",
    avatar: user?.profileImage || "",
  };

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
  const signOut = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-gradient-to-b from-[#F2F7FF] via-[#F8FAFC] to-[#FFF8F4] font-['Inter']">
      <Sidebar
        navItems={trainerNavItems}
        footerItems={[]}
        user={trainerUser}
        {...trainerSidebarProps}
        onSignOut={signOut}
      />
      <main className="relative z-10 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-[1240px] px-5 py-5 sm:px-7 lg:px-8 lg:py-7">
          <PageHeader
            loading={loading}
            profile={user}
            fullName={fullName}
            studentUser={trainerUser}
            searchValue=""
            onSearchChange={() => {}}
            chatBadge={0}
            notificationBadge={stats.pendingApplications ?? applications.length}
          />

          <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7B8497]">Trainer Dashboard</p>
              <h1 className="text-[25px] font-extrabold tracking-[-0.6px] text-[#172033]">Internship Overview</h1>
              <p className="mt-1.5 flex items-center gap-1.5 text-[13px] font-medium text-[#7B8497]">
                <Building2 size={14} /> {companyName} · Company Trainer
              </p>
            </div>
            <Button
              variant="gold"
              onClick={() => navigate("/company/trainer/tasks")}
              className="flex items-center gap-1.5 px-4 py-2.5 text-[12px] font-bold"
            >
              <Plus size={16} /> Create Task
            </Button>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 xl:grid-cols-4">
            <StatCard
              icon={GraduationCap}
              label="Total Trainees"
              value={stats.totalStudents ?? students.length}
              color={COLORS.primary}
              bg={COLORS.primarySoft}
              sub="Assigned to you"
              onClick={() => navigate("/company/trainer/students")}
            />
            <StatCard
              icon={ClipboardList}
              label="Tasks"
              value={(stats.activeTasks ?? 5) + (stats.completedTasks ?? 1)}
              color={COLORS.green}
              bg={COLORS.greenSoft}
              sub={`${stats.activeTasks ?? 5} active · ${stats.completedTasks ?? 1} completed`}
              onClick={() => navigate("/company/trainer/tasks")}
            />
            <StatCard
              icon={UserCheck}
              label="Pending Applications"
              value={stats.pendingApplications ?? applications.length}
              color={COLORS.accent}
              bg={COLORS.accentSoft}
              sub="Waiting for your review"
              onClick={() => navigate("/company/trainer/applications")}
            />
            <StatCard
              icon={Clock3}
              label="Attendance"
              value={`${stats.attendanceRate ?? 86.7}%`}
              color={COLORS.primary}
              bg={COLORS.primarySoft}
              sub="Average attendance"
              onClick={() => navigate("/company/trainer/attendance")}
            />
          </div>

          <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[0.9fr_1.1fr]">
            <InternshipTimeGauge startDate={internship.startDate} endDate={internship.endDate} />
            <TaskSubmissionChart tasks={tasks} onViewTasks={() => navigate("/company/trainer/tasks")} />
          </div>

          <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
            <AttendanceGauge
              attendanceRate={stats.attendanceRate}
              onViewAttendance={() => navigate("/company/trainer/attendance")}
            />
            <RecentActivity applications={applications} tasks={tasks} />
          </div>

          <div className="mt-5">
            <TraineeOverview
              students={students}
              onViewAll={() => navigate("/company/trainer/students")}
              onOpenStudent={(id) => navigate(`/company/trainer/students/${id}`)}
            />
          </div>

          <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
            <Card
              title="Pending Applications"
              subtitle="Students requesting to join your internship"
              action={
                <button
                  type="button"
                  onClick={() => navigate("/company/trainer/applications")}
                  className="text-[10px] font-extrabold text-[#0475FB]"
                >
                  View all
                </button>
              }
            >
              <div className="mt-3 divide-y divide-[#EEF1F5]">
                {applications.slice(0, 4).map((application) => {
                  const student = application.student || {};
                  const name = `${student.user?.firstName || ""} ${student.user?.lastName || ""}`.trim() || "Student";
                  const busy = actingId === application.id;
                  return (
                    <div key={application.id} className="flex items-center justify-between gap-3 py-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EAF3FF] text-[11px] font-extrabold text-[#0475FB]">
                          {name[0]}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-[11px] font-bold text-[#172033]">{name}</p>
                          <p className="truncate text-[10px] text-[#7B8497]">{student.major || "—"}</p>
                        </div>
                      </div>
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => action(application.id, "reject")}
                          className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FEF0F0] text-[#EF4444] disabled:opacity-50"
                          aria-label={`Reject ${name}`}
                        >
                          <X size={13} />
                        </button>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => action(application.id, "approve")}
                          className="flex h-7 w-7 items-center justify-center rounded-full bg-[#EAF9EF] text-[#22C55E] disabled:opacity-50"
                          aria-label={`Approve ${name}`}
                        >
                          <Check size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card
              title="Task Review"
              subtitle="Assignments with the most work ready to review"
              action={<FileCheck2 size={17} className="text-[#22C55E]" />}
            >
              <div className="mt-3 space-y-2.5">
                {[...tasks]
                  .sort((a, b) => Number(b.submittedCount ?? 0) - Number(a.submittedCount ?? 0))
                  .slice(0, 4)
                  .map((task) => {
                    const total = Number(task.totalStudents ?? 24);
                    const submitted = Number(task.submittedCount ?? 0);
                    const percent = total ? Math.round((submitted / total) * 100) : 0;
                    return (
                      <button
                        type="button"
                        key={task.id}
                        onClick={() => navigate("/company/trainer/tasks")}
                        className="w-full rounded-xl border border-[#E9EDF4] p-3 text-left transition hover:border-[#CFE1FA] hover:bg-[#FBFDFF]"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="truncate text-[10px] font-bold text-[#344054]">{task.title}</span>
                          <span className="shrink-0 text-[9px] font-extrabold text-[#0475FB]">{percent}%</span>
                        </div>
                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#EEF1F5]">
                          <div className="h-full rounded-full bg-[#0475FB]" style={{ width: `${percent}%` }} />
                        </div>
                        <p className="mt-1.5 text-[9px] text-[#7B8497]">{submitted} of {total} submissions received</p>
                      </button>
                    );
                  })}
              </div>
            </Card>
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-[#E9EDF4] py-4 text-[10px] font-medium text-[#7B8497]">
            <span>Manage your internship activities from the trainer workspace.</span>
            <button
              type="button"
              onClick={() => navigate("/company/trainer/tasks")}
              className="flex items-center gap-1 font-extrabold text-[#0475FB]"
            >
              Go to Tasks <ArrowUpRight size={11} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
