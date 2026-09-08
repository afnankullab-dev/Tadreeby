import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  Clock3,
  File,
  FileText,
  Paperclip,
  Plus,
  Send,
  Trash2,
  Upload,
  Users,
} from "lucide-react";
import Sidebar from "../../layout/Sidebar";
import PageHeader from "../../common/pagesAssets/PageHeader";
import { Button } from "../../common/Button";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../context/ToastContext";
import { trainerAPI } from "../../../services/api";
import { trainerNavItems, trainerSidebarProps } from "./trainerNavigation";
import { DUMMY_TRAINER_DASHBOARD, DUMMY_TRAINER_STUDENTS } from "./trainerMockData";

const first = (...values) => values.find((value) => value !== undefined && value !== null && value !== "");
const unwrap = (value) => value?.data ?? value;

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const getWeeks = (start, end) => {
  if (!start || !end) return "—";
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) return "—";
  const days = Math.max(0, Math.ceil((endDate - startDate) / 86400000));
  return `${Math.max(1, Math.ceil(days / 7))} weeks`;
};

const getFileTone = (name = "") => {
  const extension = name.split(".").pop()?.toLowerCase();
  if (extension === "pdf") return "bg-[#FFF0F0] text-[#EF3340]";
  if (["fig", "figma"].includes(extension)) return "bg-[#F1EEFF] text-[#6C4CF1]";
  if (["doc", "docx"].includes(extension)) return "bg-[#EAF3FF] text-[#1677FF]";
  return "bg-[#F3F5F8] text-[#667085]";
};

export default function TrainerCreateTask() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const [dashboard, setDashboard] = useState(DUMMY_TRAINER_DASHBOARD);
  const [students, setStudents] = useState(DUMMY_TRAINER_STUDENTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [internshipOpen, setInternshipOpen] = useState(false);
  const [files, setFiles] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    status: "Not started",
  });

  const fullName = `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "Trainer";
  const signOut = () => {
    logout();
    navigate("/login");
  };

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const [dashboardResponse, studentsResponse] = await Promise.all([
          trainerAPI.getDashboard(),
          trainerAPI.getMyStudents(1, 100),
        ]);
        if (!mounted) return;
        const dashboardData = unwrap(dashboardResponse) || {};
        const studentsData = unwrap(studentsResponse);
        setDashboard(dashboardData);
        if (Array.isArray(studentsData)) setStudents(studentsData);
      } catch (error) {
        // Keep the screen usable with the same temporary trainer data used by the other trainer pages.
        console.warn("Trainer create-task data unavailable; using temporary demo data.", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const internship = dashboard?.internship || dashboard?.opportunity || dashboard?.trainingOpportunity || dashboard;
  const internshipTitle = first(
    internship?.title,
    internship?.name,
    internship?.opportunity?.title,
    "Frontend Development Trainer"
  );
  const companyName = first(internship?.company?.name, dashboard?.company?.name, "Atlas Technologies");
  const startDate = first(internship?.startDate, internship?.start_date, "2026-08-15");
  const endDate = first(internship?.endDate, internship?.end_date, "2026-11-30");
  const duration = getWeeks(startDate, endDate);
  const totalStudents = first(
    dashboard?.stats?.totalStudents,
    dashboard?.totalStudents,
    students.length,
    6
  );
  const status = form.status || "Not started";

  const summaryPeriod = useMemo(() => {
    if (!form.startDate && !form.endDate) return "—";
    return `${formatDate(form.startDate)}${form.endDate ? ` — ${formatDate(form.endDate)}` : ""}`;
  }, [form.startDate, form.endDate]);

  const updateForm = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const onFilesSelected = (event) => {
    const selected = Array.from(event.target.files || []);
    setFiles((current) => [...current, ...selected]);
    event.target.value = "";
  };

  const removeFile = (index) => setFiles((current) => current.filter((_, fileIndex) => fileIndex !== index));

  const createTask = async (event) => {
    event.preventDefault();
    if (!form.title.trim()) {
      showToast("Enter a task title.", "error");
      return;
    }
    if (!form.description.trim()) {
      showToast("Add a task description.", "error");
      return;
    }
    if (form.startDate && form.endDate && new Date(form.endDate) < new Date(form.startDate)) {
      showToast("The end date must be after the start date.", "error");
      return;
    }

    setSaving(true);
    try {
      await trainerAPI.createTask({
        title: form.title.trim(),
        description: form.description.trim(),
        dueDate: form.endDate || undefined,
      });
      showToast(`Task created for all ${totalStudents} students.`, "success");
      navigate("/company/trainer/tasks");
    } catch (error) {
      console.warn("Create task API unavailable.", error);
      showToast("Task details are ready, but the backend task endpoint is unavailable.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#F7F9FC]">
      <Sidebar
        navItems={trainerNavItems}
        footerItems={trainerSidebarProps.footerItems}
        user={{ name: fullName, role: "Company Trainer", avatar: user?.profileImage || "" }}
        {...trainerSidebarProps}
        onSignOut={signOut}
      />

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[1350px] px-5 py-5 sm:px-7 lg:px-8 lg:py-7">
          <PageHeader
            loading={loading}
            profile={user}
            fullName={fullName}
            studentUser={{ name: fullName, role: "Company Trainer", avatar: user?.profileImage || "" }}
            searchValue=""
            onSearchChange={() => {}}
            chatBadge={0}
            notificationBadge={0}
            onLogout={signOut}
          />

          <button
            type="button"
            onClick={() => navigate("/company/trainer/tasks")}
            className="mt-1 inline-flex items-center gap-1.5 text-xs font-semibold text-[#4E78A9] transition hover:text-[#1677FF]"
          >
            <ArrowLeft size={15} />
            Back to Tasks
          </button>

          <div className="mt-2">
            <h1 className="text-[30px] font-extrabold leading-tight tracking-[-0.02em] text-[#172033]">Create Task</h1>
            <p className="mt-1 text-sm text-[#7B8497]">
              Assign a new task to all students in this internship and track their progress.
            </p>
          </div>

          <form onSubmit={createTask} className="mt-5 grid items-start gap-5 lg:grid-cols-[minmax(0,1.55fr)_minmax(390px,1fr)]">
            <section className="rounded-2xl border border-[#E9EDF4] bg-white p-5 shadow-[0_8px_30px_rgba(30,75,130,0.04)] sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#7F72FF] to-[#4E7CF5] text-white shadow-[0_6px_14px_rgba(78,124,245,0.22)]">
                  <FileText size={18} />
                </div>
                <h2 className="text-sm font-extrabold text-[#172033]">Task Details</h2>
              </div>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <div className="relative">
                  <label className="mb-1.5 block text-xs font-bold text-[#18335C]">Internship <span className="text-[#F04444]">*</span></label>
                  <button
                    type="button"
                    onClick={() => setInternshipOpen((value) => !value)}
                    className="flex h-11 w-full items-center justify-between rounded-xl border border-[#DCE5F0] bg-white px-3 text-left transition hover:border-[#B9D0EC]"
                  >
                    <span className="flex min-w-0 items-center gap-2.5">
                      <BriefcaseBusiness size={17} className="shrink-0 text-[#4D78AC]" />
                      <span className="min-w-0">
                        <span className="block truncate text-xs font-bold text-[#294A75]">{internshipTitle}</span>
                        <span className="mt-0.5 block truncate text-[10px] text-[#8A9AB1]">{companyName} · {totalStudents} students</span>
                      </span>
                    </span>
                    <ChevronDown size={15} className={`shrink-0 text-[#6D86A5] transition-transform ${internshipOpen ? "rotate-180" : ""}`} />
                  </button>
                  {internshipOpen && (
                    <div className="absolute left-0 right-0 top-[68px] z-20 rounded-xl border border-[#E2E8F0] bg-white p-2 shadow-xl">
                      <button
                        type="button"
                        onClick={() => setInternshipOpen(false)}
                        className="flex w-full items-center gap-2 rounded-lg bg-[#F7FAFF] px-3 py-2.5 text-left"
                      >
                        <BriefcaseBusiness size={15} className="text-[#1677FF]" />
                        <span>
                          <span className="block text-xs font-bold text-[#294A75]">{internshipTitle}</span>
                          <span className="block text-[10px] text-[#8A9AB1]">Current internship</span>
                        </span>
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold text-[#18335C]">Title <span className="text-[#F04444]">*</span></label>
                  <div className="flex h-11 items-center gap-2.5 rounded-xl border border-[#DCE5F0] bg-white px-3">
                    <FileText size={17} className="shrink-0 text-[#4D78AC]" />
                    <input
                      value={form.title}
                      onChange={(event) => updateForm("title", event.target.value)}
                      placeholder="Enter task title"
                      className="min-w-0 flex-1 bg-transparent text-xs font-medium text-[#172033] outline-none placeholder:text-[#9AABC0]"
                      maxLength={120}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <label className="mb-1.5 block text-xs font-bold text-[#18335C]">Description <span className="text-[#F04444]">*</span></label>
                </div>
                <div className="relative rounded-xl border border-[#DCE5F0] bg-white">
                  <div className="absolute left-3 top-3 text-[#4D78AC]"><FileText size={17} /></div>
                  <textarea
                    value={form.description}
                    onChange={(event) => updateForm("description", event.target.value)}
                    placeholder="Describe the task, goals and expectations..."
                    rows={4}
                    maxLength={500}
                    className="min-h-[80px] w-full resize-none bg-transparent px-10 py-3 pr-16 text-xs font-medium leading-5 text-[#172033] outline-none placeholder:text-[#9AABC0]"
                  />
                  <span className="absolute bottom-2 right-3 text-[9px] font-semibold text-[#8D9DB2]">{form.description.length}/500</span>
                </div>
              </div>

              <div className="mt-4 grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-[#18335C]">Start Date <span className="text-[#F04444]">*</span></label>
                  <div className="relative flex h-11 items-center rounded-xl border border-[#DCE5F0] bg-white px-3">
                    <CalendarDays size={17} className="mr-2.5 shrink-0 text-[#4D78AC]" />
                    <input
                      type="date"
                      value={form.startDate}
                      onChange={(event) => updateForm("startDate", event.target.value)}
                      className="w-full bg-transparent text-xs font-medium text-[#7488A2] outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-[#18335C]">End Date <span className="text-[#F04444]">*</span></label>
                  <div className="relative flex h-11 items-center rounded-xl border border-[#DCE5F0] bg-white px-3">
                    <CalendarDays size={17} className="mr-2.5 shrink-0 text-[#4D78AC]" />
                    <input
                      type="date"
                      value={form.endDate}
                      onChange={(event) => updateForm("endDate", event.target.value)}
                      className="w-full bg-transparent text-xs font-medium text-[#7488A2] outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 max-w-[50%] min-w-[240px]">
                <label className="mb-1.5 block text-xs font-bold text-[#18335C]">Status</label>
                <div className="relative flex h-11 items-center rounded-xl border border-[#DCE5F0] bg-white px-3">
                  <Clock3 size={17} className="mr-2.5 shrink-0 text-[#4D78AC]" />
                  <select
                    value={form.status}
                    onChange={(event) => updateForm("status", event.target.value)}
                    className="w-full appearance-none bg-transparent text-xs font-bold text-[#294A75] outline-none"
                  >
                    <option>Not started</option>
                    <option>In progress</option>
                  </select>
                  <ChevronDown size={15} className="pointer-events-none absolute right-3 text-[#6D86A5]" />
                </div>
              </div>

              <div className="mt-4 rounded-xl bg-[#F4F8FE] p-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E5F0FF] text-[#1677FF]"><Paperclip size={16} /></div>
                  <div>
                    <h3 className="text-xs font-extrabold text-[#294A75]">Task Files</h3>
                    <p className="mt-0.5 text-[10px] text-[#8A9AB1]">Add supporting files, documents or resources for this task.</p>
                  </div>
                </div>

                <label className="mt-3 flex min-h-[58px] cursor-pointer items-center justify-between gap-3 rounded-xl border border-dashed border-[#C8DAF0] bg-white px-3 transition hover:border-[#8CB8EB] hover:bg-[#FBFDFF]">
                  <input type="file" multiple className="hidden" onChange={onFilesSelected} accept=".pdf,.doc,.docx,.zip,.jpg,.jpeg,.png,.fig,.figma" />
                  <span className="flex items-center gap-2.5">
                    <Paperclip size={18} className="text-[#2F578A]" />
                    <span>
                      <span className="block text-[10px] font-bold text-[#385A82]">Drag and drop files here, or click to upload</span>
                      <span className="mt-0.5 block text-[8px] text-[#93A4B9]">You can attach multiple files (PDF, DOC, DOCX, ZIP, JPG, PNG)</span>
                    </span>
                  </span>
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-[#EAF3FF] px-3 py-2 text-[9px] font-bold text-[#1677FF]"><Plus size={13} /> Add Files</span>
                </label>

                {files.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {files.map((file, index) => (
                      <div key={`${file.name}-${index}`} className="flex min-w-[150px] flex-1 items-center gap-2 rounded-lg border border-[#E5EAF1] bg-white px-2.5 py-2">
                        <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${getFileTone(file.name)}`}><File size={14} /></span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[9px] font-bold text-[#294A75]">{file.name}</span>
                          <span className="block text-[8px] text-[#8A9AB1]">{(file.size / 1024 / 1024).toFixed(1)} MB</span>
                        </span>
                        <button type="button" onClick={() => removeFile(index)} className="text-[#91A0B2] hover:text-[#EF4444]" aria-label={`Remove ${file.name}`}><Trash2 size={13} /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/company/trainer/tasks")}
                  className="inline-flex items-center justify-center rounded-xl border border-[#E2E8F0] bg-white px-5 py-2.5 text-xs font-bold text-[#71829A] transition hover:bg-[#F8FAFC]"
                >
                  Cancel
                </button>
                <Button type="submit" variant="gold" disabled={saving} className="rounded-xl px-5 py-2.5 text-xs font-bold">
                  <Send size={15} />
                  {saving ? "Creating..." : "Create Task"}
                </Button>
              </div>
            </section>

            <aside className="space-y-4">
              <section className="rounded-2xl border border-[#E9EDF4] bg-white p-5 shadow-[0_8px_30px_rgba(30,75,130,0.04)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#EAF3FF] text-[#1677FF]"><BriefcaseBusiness size={17} /></div>
                    <h2 className="text-sm font-extrabold text-[#172033]">Internship Information</h2>
                  </div>
                  <ChevronRight size={16} className="text-[#B3C2D5]" />
                </div>

                <div className="mt-4 flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#73A7FF] to-[#5B86E8] text-white"><BriefcaseBusiness size={20} /></div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="truncate text-xs font-extrabold text-[#294A75]">{internshipTitle}</p>
                        <p className="mt-0.5 text-[10px] text-[#8A9AB1]">{companyName}</p>
                      </div>
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#EAF9EF] px-2 py-1 text-[9px] font-bold text-[#16833A]"><span className="h-1.5 w-1.5 rounded-full bg-[#22C55E]" /> Active</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 divide-x divide-[#E7ECF3] rounded-xl bg-[#FBFCFE] py-1">
                  <div className="px-2.5 py-2">
                    <CalendarDays size={15} className="text-[#4D78AC]" />
                    <p className="mt-1.5 text-[8px] font-semibold text-[#8998AB]">Start Date</p>
                    <p className="mt-0.5 text-[10px] font-bold text-[#294A75]">{formatDate(startDate)}</p>
                  </div>
                  <div className="px-2.5 py-2">
                    <CalendarDays size={15} className="text-[#4D78AC]" />
                    <p className="mt-1.5 text-[8px] font-semibold text-[#8998AB]">End Date</p>
                    <p className="mt-0.5 text-[10px] font-bold text-[#294A75]">{formatDate(endDate)}</p>
                  </div>
                  <div className="px-2.5 py-2">
                    <Clock3 size={15} className="text-[#4D78AC]" />
                    <p className="mt-1.5 text-[8px] font-semibold text-[#8998AB]">Duration</p>
                    <p className="mt-0.5 text-[10px] font-bold text-[#294A75]">{duration}</p>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-[#E9EDF4] bg-white p-5 shadow-[0_8px_30px_rgba(30,75,130,0.04)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#EAF3FF] text-[#1677FF]"><Users size={17} /></div>
                    <div>
                      <h2 className="text-sm font-extrabold text-[#172033]">Total Students Assigned</h2>
                      <p className="mt-0.5 text-[10px] text-[#8A9AB1]">All students in this internship will receive this task.</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-[#B3C2D5]" />
                </div>
                <div className="mt-4 flex items-center gap-4">
                  <div className="flex h-14 min-w-[112px] items-center justify-center gap-2 rounded-xl bg-[#F4F8FE] px-4">
                    <Users size={21} className="text-[#1677FF]" />
                    <div>
                      <p className="text-2xl font-extrabold leading-none text-[#172033]">{totalStudents}</p>
                      <p className="mt-1 text-[10px] font-bold text-[#294A75]">students</p>
                    </div>
                  </div>
                  <div className="flex min-w-0 flex-1 items-center -space-x-1.5 overflow-hidden pl-1">
                    {Array.from({ length: Math.min(Number(totalStudents) || 0, 6) }).map((_, index) => (
                      <span key={index} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-white bg-[#F1F6FE] text-[#1677FF] shadow-sm"><Users size={13} /></span>
                    ))}
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-[#E9EDF4] bg-white p-5 shadow-[0_8px_30px_rgba(30,75,130,0.04)]">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#EAF3FF] text-[#1677FF]"><FileText size={17} /></div>
                  <h2 className="text-sm font-extrabold text-[#172033]">Task Summary</h2>
                </div>
                <div className="mt-4 space-y-3">
                  <div className="grid grid-cols-[110px_minmax(0,1fr)] items-center gap-2">
                    <span className="flex items-center gap-2 text-[10px] font-semibold text-[#8A9AB1]"><BriefcaseBusiness size={15} /> Internship</span>
                    <span className="truncate text-right text-[10px] font-bold text-[#294A75]">{internshipTitle}</span>
                  </div>
                  <div className="grid grid-cols-[110px_minmax(0,1fr)] items-center gap-2">
                    <span className="flex items-center gap-2 text-[10px] font-semibold text-[#8A9AB1]"><FileText size={15} /> Title</span>
                    <span className="truncate text-right text-[10px] font-bold text-[#294A75]">{form.title || "-"}</span>
                  </div>
                  <div className="grid grid-cols-[110px_minmax(0,1fr)] items-center gap-2">
                    <span className="flex items-center gap-2 text-[10px] font-semibold text-[#8A9AB1]"><CalendarDays size={15} /> Period</span>
                    <span className="truncate text-right text-[10px] font-bold text-[#294A75]">{summaryPeriod}</span>
                  </div>
                  <div className="grid grid-cols-[110px_minmax(0,1fr)] items-center gap-2">
                    <span className="flex items-center gap-2 text-[10px] font-semibold text-[#8A9AB1]"><Clock3 size={15} /> Status</span>
                    <span className="justify-self-end rounded-lg bg-[#EAF3FF] px-2.5 py-1 text-[9px] font-bold text-[#1677FF]">{status}</span>
                  </div>
                </div>
              </section>
            </aside>
          </form>
        </div>
      </main>
    </div>
  );
}
