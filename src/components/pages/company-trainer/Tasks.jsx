import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  ClipboardCheck,
  ClipboardList,
  Clock3,
  FileText,
  Plus,
  Search,
  Sparkles,
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
  blue: "#0475FB",
  blueSoft: "#EEF6FF",
  navy: "#172033",
  muted: "#7B8497",
  border: "#E8ECF2",
  gold: "#FFAD4E",
  goldSoft: "#FFF6EA",
  green: "#2FAE66",
  greenSoft: "#EEF9F3",
  red: "#D94A4A",
  redSoft: "#FFF2F2",
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
  TODO: { label: "To Do", icon: Clock3, color: COLORS.blue, bg: COLORS.blueSoft },
  IN_PROGRESS: { label: "In Progress", icon: Clock3, color: COLORS.gold, bg: COLORS.goldSoft },
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

function TaskCard({ task, featured = false, compact = false }) {
  const overdue = isOverdue(task);

  return (
    <article
      className={`group relative overflow-hidden rounded-[22px] border bg-white shadow-[0_8px_28px_rgba(23,32,51,0.045)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_35px_rgba(23,32,51,0.09)] ${
        featured ? "min-h-[250px] p-6" : compact ? "min-h-[175px] p-4" : "min-h-[215px] p-5"
      }`}
      style={{ borderColor: COLORS.border }}
    >
      <div
        className={`absolute left-0 top-0 w-full ${featured ? "h-1.5" : "h-1"}`}
        style={{ backgroundColor: overdue ? COLORS.red : task.status === "DONE" || task.status === "COMPLETED" ? COLORS.green : COLORS.blue }}
      />

      <div className="flex h-full flex-col">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={task.status} />
              {overdue && (
                <span className="rounded-full px-2.5 py-1 text-[10px] font-bold" style={{ color: COLORS.red, backgroundColor: COLORS.redSoft }}>
                  Overdue
                </span>
              )}
            </div>
            <h3 className={`${featured ? "mt-4 text-[19px]" : "mt-3 text-[15px]"} truncate font-extrabold tracking-[-0.25px]`} style={{ color: COLORS.navy }}>
              {task.title || "Untitled task"}
            </h3>
            <p className={`${featured ? "mt-2 line-clamp-3 text-[12px]" : "mt-1.5 line-clamp-2 text-[11px]"} leading-5`} style={{ color: COLORS.muted }}>
              {task.description || "No description provided."}
            </p>
          </div>

          <div
            className={`flex shrink-0 items-center justify-center rounded-2xl transition ${featured ? "h-12 w-12" : "h-10 w-10"}`}
            style={{ backgroundColor: COLORS.blueSoft, color: COLORS.blue }}
          >
            <FileText size={featured ? 20 : 17} />
          </div>
        </div>

        <div className="mt-auto grid grid-cols-1 gap-2 border-t pt-4 sm:grid-cols-3" style={{ borderColor: COLORS.border }}>
          <div className="flex min-w-0 items-center gap-2">
            <ClipboardList size={13} className="shrink-0" style={{ color: COLORS.muted }} />
            <span className="truncate text-[10px] font-semibold" style={{ color: COLORS.muted }}>{getInternshipName(task)}</span>
          </div>
          <div className="flex min-w-0 items-center gap-2">
            <UserRound size={13} className="shrink-0" style={{ color: COLORS.muted }} />
            <span className="truncate text-[10px] font-semibold" style={{ color: COLORS.muted }}>{getTaskName(task)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={13} className="shrink-0" style={{ color: COLORS.muted }} />
            <span className="text-[10px] font-semibold" style={{ color: overdue ? COLORS.red : COLORS.muted }}>{formatDate(task.deadline)}</span>
          </div>
        </div>
      </div>
    </article>
  );
}

function Overview() {
  return null;
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
      const normalizedStatus = String(task.status || "TODO").toUpperCase();
      const matchesStatus = statusFilter === "ALL" || normalizedStatus === statusFilter;
      if (!matchesStatus) return false;
      if (!query) return true;
      return [task.title, task.description, getTaskName(task), getInternshipName(task)]
        .filter(Boolean).join(" ").toLowerCase().includes(query);
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

  const completedRate = counts.total ? Math.round((counts.DONE / counts.total) * 100) : 0;
  const underReview = counts.DONE;

  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-[#F8FAFC] font-['Inter']">
      <div className="pointer-events-none absolute -left-32 top-40 h-72 w-72 rounded-full bg-blue-100/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-20 h-80 w-80 rounded-full bg-orange-100/25 blur-3xl" />

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

          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: COLORS.blue }}>
                <Sparkles size={14} />
                Trainer Workspace
              </div>
              <h1 className="mt-1 text-[28px] font-extrabold tracking-[-0.8px]" style={{ color: COLORS.navy }}>Tasks</h1>
              <p className="mt-1.5 max-w-[600px] text-[13px] font-medium" style={{ color: COLORS.muted }}>
                Follow the work your trainees are completing and quickly see what needs your attention.
              </p>
            </div>
            <Button variant="gold" onClick={() => navigate("/company/trainer/tasks/create")} className="flex items-center gap-1.5 px-4 py-2.5 text-[12px] font-bold">
              <Plus size={16} />
              Create Task
            </Button>
          </div>

          {error && (
            <div className="mt-4 flex items-start gap-2 rounded-xl border bg-white px-4 py-3 text-[10px]" style={{ borderColor: "#F4D0D0", color: COLORS.red }}>
              <AlertCircle size={14} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <section className="mt-6 grid grid-cols-1 gap-3 lg:grid-cols-[1.45fr_0.8fr_0.8fr]">
            <div className="relative min-h-[190px] overflow-hidden rounded-[24px] bg-[#0475FB] p-6 text-white shadow-[0_16px_35px_rgba(4,117,251,0.14)]">
              <div className="absolute -right-14 -top-20 h-48 w-48 rounded-full border-[30px] border-white/10" />
              <div className="absolute bottom-[-55px] right-[25%] h-32 w-32 rounded-full bg-white/5" />
              <div className="relative flex h-full items-center justify-between gap-5">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/65">Overall Progress</p>
                  <p className="mt-3 text-[42px] font-extrabold leading-none tracking-[-1.5px]">{loading ? "—" : `${completedRate}%`}</p>
                  <p className="mt-2 max-w-[220px] text-[11px] font-medium leading-5 text-white/70">
                    {loading ? "Loading task activity..." : `${counts.DONE} of ${counts.total} tasks have been completed.`}
                  </p>
                </div>
                <div className="relative flex h-28 w-28 shrink-0 items-center justify-center rounded-full bg-white/10">
                  <div className="absolute inset-1 rounded-full" style={{ background: `conic-gradient(#fff ${completedRate * 3.6}deg, rgba(255,255,255,.13) 0deg)` }} />
                  <div className="relative flex h-[82px] w-[82px] flex-col items-center justify-center rounded-full bg-[#0475FB]">
                    <ClipboardCheck size={20} />
                    <span className="mt-1 text-[9px] font-bold text-white/65">completion</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="min-h-[190px] rounded-[24px] border bg-white p-5 shadow-[0_8px_28px_rgba(23,32,51,0.045)]" style={{ borderColor: COLORS.border }}>
              <div className="flex h-full flex-col justify-between">
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl" style={{ backgroundColor: COLORS.greenSoft, color: COLORS.green }}>
                    <CheckCircle2 size={19} />
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-[0.12em]" style={{ color: COLORS.muted }}>Student output</span>
                </div>
                <div>
                  <p className="text-[34px] font-extrabold leading-none tracking-[-1px]" style={{ color: COLORS.navy }}>{loading ? "—" : counts.DONE}</p>
                  <p className="mt-2 text-[11px] font-bold" style={{ color: COLORS.navy }}>Done by students</p>
                  <p className="mt-1 text-[10px] leading-4" style={{ color: COLORS.muted }}>Work marked complete by trainees.</p>
                </div>
              </div>
            </div>

            <div className="min-h-[190px] rounded-[24px] border bg-[#FFFDF9] p-5 shadow-[0_8px_28px_rgba(23,32,51,0.045)]" style={{ borderColor: "#F2E6D4" }}>
              <div className="flex h-full flex-col justify-between">
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl" style={{ backgroundColor: COLORS.goldSoft, color: COLORS.gold }}>
                    <Clock3 size={19} />
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-[0.12em]" style={{ color: COLORS.muted }}>Trainer attention</span>
                </div>
                <div>
                  <p className="text-[34px] font-extrabold leading-none tracking-[-1px]" style={{ color: COLORS.navy }}>{loading ? "—" : underReview}</p>
                  <p className="mt-2 text-[11px] font-bold" style={{ color: COLORS.navy }}>Under review</p>
                  <p className="mt-1 text-[10px] leading-4" style={{ color: COLORS.muted }}>Completed work ready for trainer review.</p>
                </div>
              </div>
            </div>
          </section>

          <div className="mt-6 rounded-[20px] border bg-white p-4 shadow-[0_6px_22px_rgba(23,32,51,0.035)]" style={{ borderColor: COLORS.border }}>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative w-full lg:max-w-[380px]">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: COLORS.muted }} />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by task, trainee, or internship..."
                  className="h-10 w-full rounded-xl border bg-[#FAFBFD] pl-9 pr-3 text-[11px] font-medium outline-none transition focus:border-[#0475FB]"
                  style={{ borderColor: COLORS.border, color: COLORS.navy }}
                />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {["ALL", "TODO", "IN_PROGRESS", "DONE"].map((status) => {
                  const active = statusFilter === status;
                  return (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setStatusFilter(status)}
                      className="rounded-full px-3 py-2 text-[10px] font-bold transition"
                      style={{ backgroundColor: active ? COLORS.navy : "#F5F7FA", color: active ? "#fff" : COLORS.muted }}
                    >
                      {status === "ALL" ? "All Tasks" : status === "TODO" ? "To Do" : status === "IN_PROGRESS" ? "In Progress" : "Completed"}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <div>
              <h2 className="text-[16px] font-extrabold" style={{ color: COLORS.navy }}>Recent Tasks</h2>
              <p className="mt-1 text-[10px] font-medium" style={{ color: COLORS.muted }}>{filteredTasks.length} task{filteredTasks.length === 1 ? "" : "s"} shown</p>
            </div>
            <button type="button" onClick={() => setStatusFilter("ALL")} className="flex items-center gap-1 text-[10px] font-bold" style={{ color: COLORS.blue }}>
              View all <ArrowUpRight size={13} />
            </button>
          </div>

          <div className="mt-3 pb-10">
            {loading ? (
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                {[1, 2, 3].map((item) => (
                  <div key={item} className={`${item === 1 ? "lg:col-span-2 h-60" : "h-52"} animate-pulse rounded-[22px] border bg-white`} style={{ borderColor: COLORS.border }} />
                ))}
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="rounded-[22px] border bg-white px-6 py-16 text-center shadow-[0_8px_28px_rgba(23,32,51,0.04)]" style={{ borderColor: COLORS.border }}>
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl" style={{ backgroundColor: COLORS.blueSoft, color: COLORS.blue }}>
                  <ClipboardList size={24} />
                </div>
                <h2 className="mt-4 text-[16px] font-extrabold" style={{ color: COLORS.navy }}>{tasks.length === 0 ? "No tasks yet" : "No matching tasks"}</h2>
                <p className="mx-auto mt-1.5 max-w-[420px] text-[11px] leading-5" style={{ color: COLORS.muted }}>
                  {tasks.length === 0 ? "Create your first task and start tracking trainee progress." : "Try a different search term or status filter."}
                </p>
                {tasks.length === 0 && (
                  <Button variant="gold" onClick={() => navigate("/company/trainer/tasks/create")} className="mt-5 px-4 py-2 text-[11px] font-bold">
                    <span className="flex items-center gap-1.5"><Plus size={14} /> Create your first task</span>
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                {filteredTasks.map((task, index) => (
                  <div key={task.id || `${task.title}-${index}`} className={index === 0 ? "lg:col-span-2" : ""}>
                    <TaskCard task={task} featured={index === 0} compact={index === 3 || index === 4} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
