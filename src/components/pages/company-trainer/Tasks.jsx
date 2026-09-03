import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  ClipboardList,
  Clock3,
  FileText,
  Plus,
  Search,
  UserRound,
  XCircle,
} from "lucide-react";

import Sidebar from "../../layout/Sidebar";
import PageHeader from "../../common/pagesAssets/PageHeader";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../context/ToastContext";
import { Button } from "../../common/Button";
import { apiRequest } from "../../../services/api";

const COLORS = {
  primary: "#0475FB",
  primarySoft: "#EAF3FF",
  accent: "#FFAD4E",
  accentSoft: "#FFF4E5",
  green: "#22C55E",
  greenSoft: "#EAF9EF",
  red: "#EF4444",
  redSoft: "#FEF0F0",
  text: "#172033",
  muted: "#7B8497",
  border: "#E9EDF4",
};

const trainerNavItems = [
  { label: "Dashboard", icon: ClipboardList, path: "/company/trainer/dashboard" },
  { label: "My Students", icon: UserRound, path: "/company/trainer/students" },
  { label: "Tasks", icon: ClipboardList, path: "/company/trainer/tasks" },
];

const trainerFooterItems = [
  { label: "Settings", icon: ClipboardList, path: "/company/trainer/settings" },
];

const STATUS_META = {
  TODO: { label: "To Do", icon: Clock3, color: COLORS.primary, bg: COLORS.primarySoft },
  IN_PROGRESS: { label: "In Progress", icon: Clock3, color: COLORS.accent, bg: COLORS.accentSoft },
  DONE: { label: "Completed", icon: CheckCircle2, color: COLORS.green, bg: COLORS.greenSoft },
  COMPLETED: { label: "Completed", icon: CheckCircle2, color: COLORS.green, bg: COLORS.greenSoft },
  CANCELLED: { label: "Cancelled", icon: XCircle, color: COLORS.red, bg: COLORS.redSoft },
};

function getList(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  return [];
}

function getTaskName(task) {
  const student = task?.internshipStudent?.student?.user || task?.internshipStudent?.user;
  if (!student) return "Unassigned";
  return `${student.firstName || ""} ${student.lastName || ""}`.trim() || "Student";
}

function getInternshipName(task) {
  return (
    task?.internship?.title ||
    task?.internship?.opportunity?.title ||
    task?.internship?.opportunity?.position ||
    task?.internship?.company?.name ||
    (task?.internshipId ? `Internship #${task.internshipId}` : "Internship")
  );
}

function formatDate(value) {
  if (!value) return "No deadline";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No deadline";
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function isOverdue(task) {
  if (!task?.deadline) return false;
  const status = String(task.status || "").toUpperCase();
  if (["DONE", "COMPLETED", "CANCELLED"].includes(status)) return false;
  return new Date(task.deadline).getTime() < Date.now();
}

function StatusBadge({ status }) {
  const normalized = String(status || "TODO").toUpperCase();
  const meta = STATUS_META[normalized] || STATUS_META.TODO;
  const Icon = meta.icon;
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold"
      style={{ color: meta.color, backgroundColor: meta.bg }}
    >
      <Icon size={12} />
      {meta.label}
    </span>
  );
}

function TaskCard({ task, onOpen }) {
  const overdue = isOverdue(task);
  return (
    <button
      type="button"
      onClick={() => onOpen(task)}
      className="w-full rounded-[18px] border bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
      style={{ borderColor: COLORS.border }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={task.status} />
            {overdue && (
              <span className="rounded-full bg-[#FEF0F0] px-2.5 py-1 text-[10px] font-bold text-[#EF4444]">
                Overdue
              </span>
            )}
          </div>
          <h3 className="mt-3 truncate text-[15px] font-extrabold text-[#172033]">
            {task.title || "Untitled task"}
          </h3>
          <p className="mt-1 line-clamp-2 text-[11px] leading-5 text-[#7B8497]">
            {task.description || "No description provided."}
          </p>
        </div>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F5F7FB] text-[#7B8497]">
          <FileText size={17} />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-2 border-t pt-4 sm:grid-cols-3" style={{ borderColor: COLORS.border }}>
        <div className="flex min-w-0 items-center gap-2">
          <ClipboardList size={13} className="shrink-0 text-[#9AA3B2]" />
          <span className="truncate text-[10px] font-semibold text-[#7B8497]">{getInternshipName(task)}</span>
        </div>
        <div className="flex min-w-0 items-center gap-2">
          <UserRound size={13} className="shrink-0 text-[#9AA3B2]" />
          <span className="truncate text-[10px] font-semibold text-[#7B8497]">{getTaskName(task)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar size={13} className="shrink-0 text-[#9AA3B2]" />
          <span className={`text-[10px] font-semibold ${overdue ? "text-[#EF4444]" : "text-[#7B8497]"}`}>
            {formatDate(task.deadline)}
          </span>
        </div>
      </div>
    </button>
  );
}

export default function Tasks() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { showToast } = useToast();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const fullName = `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "Trainer";
  const trainerUser = { name: fullName, role: "Company Trainer", avatar: user?.profileImage || "" };

  const handleSignOut = () => {
    logout();
    navigate("/login");
  };

  const loadTasks = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await apiRequest("/company/trainer/tasks?page=1&limit=100", { method: "GET" });
      setTasks(getList(response));
    } catch (err) {
      console.error("Failed to load trainer tasks:", err);
      setError(err?.message || "Failed to load tasks.");
      showToast(err?.message || "Failed to load tasks.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const filteredTasks = useMemo(() => {
    const query = search.trim().toLowerCase();
    return tasks.filter((task) => {
      const matchesStatus = statusFilter === "ALL" || String(task.status || "TODO").toUpperCase() === statusFilter;
      if (!matchesStatus) return false;
      if (!query) return true;
      const haystack = [task.title, task.description, getTaskName(task), getInternshipName(task)].filter(Boolean).join(" ").toLowerCase();
      return haystack.includes(query);
    });
  }, [tasks, search, statusFilter]);

  const counts = useMemo(() => {
    const result = { total: tasks.length, TODO: 0, IN_PROGRESS: 0, DONE: 0 };
    tasks.forEach((task) => {
      const status = String(task.status || "TODO").toUpperCase();
      if (status === "COMPLETED") result.DONE += 1;
      else if (result[status] !== undefined) result[status] += 1;
    });
    return result;
  }, [tasks]);

  const openTask = (task) => {
    if (task?.id) navigate(`/company/trainer/tasks/${task.id}`);
  };

  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-gradient-to-b from-[#F2F7FF] via-[#F8FAFC] to-[#FFF8F4] font-['Inter']">
      <div className="pointer-events-none absolute -left-20 top-1/4 h-80 w-80 rounded-full bg-blue-400/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-1/4 h-96 w-96 rounded-full bg-orange-400/10 blur-3xl" />

      <Sidebar
        navItems={trainerNavItems}
        footerItems={trainerFooterItems}
        user={trainerUser}
        profilePath="/company/trainer/profile"
        onSignOut={handleSignOut}
        chatPath="/company/trainer/chats"
        brandPath="/company/trainer/dashboard"
        storageKey="sidebar-company-trainer"
      />

      <main className="relative z-10 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-[1240px] px-5 py-5 sm:px-7 lg:px-8 lg:py-7">
          <PageHeader
            loading={loading}
            profile={user}
            fullName={fullName}
            studentUser={trainerUser}
            searchValue={search}
            onSearchChange={(event) => setSearch(event?.target?.value ?? event ?? "")}
            chatBadge={0}
            notificationBadge={0}
          />

          <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#7B8497]">Task Management</p>
              <h1 className="mt-1 text-[25px] font-extrabold tracking-[-0.6px] text-[#172033]">Tasks</h1>
              <p className="mt-1.5 text-[13px] font-medium text-[#7B8497]">Create, assign, and track tasks for your trainees.</p>
            </div>
            <Button
              variant="gold"
              onClick={() => navigate("/company/trainer/tasks/create")}
              className="flex items-center gap-1.5 px-4 py-2.5 text-[12px] font-bold"
            >
              <Plus size={16} />
              Create Task
            </Button>
          </div>

          {error && (
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-[#F8D5D5] bg-[#FEF7F7] px-4 py-3 text-[10px] text-[#B42318]">
              <AlertCircle size={14} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              ["Total Tasks", counts.total, COLORS.primary, COLORS.primarySoft],
              ["To Do", counts.TODO, COLORS.primary, COLORS.primarySoft],
              ["In Progress", counts.IN_PROGRESS, COLORS.accent, COLORS.accentSoft],
              ["Completed", counts.DONE, COLORS.green, COLORS.greenSoft],
            ].map(([label, value, color, bg]) => (
              <div key={label} className="rounded-[18px] border bg-white p-4 shadow-sm" style={{ borderColor: COLORS.border }}>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#7B8497]">{label}</p>
                <p className="mt-1 text-[21px] font-extrabold" style={{ color }}>{loading ? "—" : value}</p>
                <div className="mt-2 h-1.5 rounded-full" style={{ backgroundColor: bg }} />
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-[18px] border bg-white p-4 shadow-sm" style={{ borderColor: COLORS.border }}>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative w-full lg:max-w-[360px]">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9AA3B2]" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search tasks..."
                  className="h-10 w-full rounded-xl border bg-[#FAFBFD] pl-9 pr-3 text-[11px] outline-none transition focus:border-[#0475FB]"
                  style={{ borderColor: COLORS.border }}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {["ALL", "TODO", "IN_PROGRESS", "DONE"].map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setStatusFilter(status)}
                    className={`rounded-full px-3 py-2 text-[10px] font-bold transition ${statusFilter === status ? "bg-[#0475FB] text-white" : "bg-[#F5F7FB] text-[#7B8497] hover:bg-[#EAF3FF]"}`}
                  >
                    {status === "ALL" ? "All" : status === "TODO" ? "To Do" : status === "IN_PROGRESS" ? "In Progress" : "Completed"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5 pb-8">
            {loading ? (
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                {[1, 2, 3, 4].map((item) => (
                  <div key={item} className="h-48 animate-pulse rounded-[18px] border bg-white" style={{ borderColor: COLORS.border }} />
                ))}
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="rounded-[18px] border bg-white px-6 py-14 text-center shadow-sm" style={{ borderColor: COLORS.border }}>
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#EAF3FF] text-[#0475FB]">
                  <ClipboardList size={22} />
                </div>
                <h2 className="mt-4 text-[15px] font-extrabold text-[#172033]">
                  {tasks.length === 0 ? "No tasks yet" : "No matching tasks"}
                </h2>
                <p className="mx-auto mt-1 max-w-[420px] text-[11px] leading-5 text-[#7B8497]">
                  {tasks.length === 0 ? "Create your first task and assign it to a trainee." : "Try another search term or status filter."}
                </p>
                {tasks.length === 0 && (
                  <Button variant="gold" onClick={() => navigate("/company/trainer/tasks/create")} className="mt-5 inline-flex items-center gap-1.5 px-4 py-2.5 text-[11px] font-bold">
                    <Plus size={15} /> Create Task
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                {filteredTasks.map((task) => <TaskCard key={task.id} task={task} onOpen={openTask} />)}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
