import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  ClipboardList,
  FileText,
  Paperclip,
  Plus,
  UserRound,
} from "lucide-react";

import Sidebar from "../../layout/Sidebar";
import PageHeader from "../../common/pagesAssets/PageHeader";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../context/ToastContext";
import { Button } from "../../common/Button";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:6060";

const COLORS = {
  primary: "#0475FB",
  primarySoft: "#EAF3FF",
  accent: "#FFAD4E",
  text: "#172033",
  muted: "#7B8497",
  border: "#E9EDF4",
  background: "#F5F7FB",
};

const trainerNavItems = [
  {
    label: "Dashboard",
    icon: ClipboardList,
    path: "/company/trainer/dashboard",
  },
  { label: "My Students", icon: UserRound, path: "/company/trainer/students" },
  { label: "Tasks", icon: ClipboardList, path: "/company/trainer/tasks" },
];

const trainerFooterItems = [
  { label: "Settings", icon: ClipboardList, path: "/company/trainer/settings" },
];

async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem("accessToken");
  const headers = {
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (response.status === 401) {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    window.location.href = "/login";
    throw new Error("Session expired. Please log in again.");
  }

  if (!response.ok) {
    throw new Error(
      data?.message || data?.error || `Request failed with status ${response.status}`,
    );
  }

  return data;
}

function getList(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  return [];
}

export default function CreateTask() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { showToast } = useToast();

  const [trainees, setTrainees] = useState([]);
  const [loadingTrainees, setLoadingTrainees] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [attachment, setAttachment] = useState(null);

  const [formData, setFormData] = useState({
    internshipId: "",
    title: "",
    description: "",
    deadline: "",
    status: "TODO",
    traineeId: "",
  });

  const fullName =
    `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "Trainer";

  const trainerUser = {
    name: fullName,
    role: "Company Trainer",
    avatar: user?.profileImage || "",
  };

  const internships = useMemo(() => {
    const map = new Map();

    trainees.forEach((trainee) => {
      const internship = trainee?.internship;
      if (!internship?.id) return;

      if (!map.has(internship.id)) {
        map.set(internship.id, internship);
      }
    });

    return Array.from(map.values());
  }, [trainees]);

  const selectedInternshipTrainees = useMemo(() => {
    if (!formData.internshipId) return [];
    return trainees.filter(
      (trainee) => String(trainee?.internshipId || trainee?.internship?.id) === String(formData.internshipId),
    );
  }, [formData.internshipId, trainees]);

  useEffect(() => {
    const loadTrainees = async () => {
      setLoadingTrainees(true);
      setError("");

      try {
        const response = await apiRequest("/company/trainer/trainees", {
          method: "GET",
        });
        setTrainees(getList(response));
      } catch (err) {
        console.error("Failed to load trainer trainees:", err);
        setError(err?.message || "Failed to load your internships.");
      } finally {
        setLoadingTrainees(false);
      }
    };

    loadTrainees();
  }, []);

  const handleSignOut = () => {
    logout();
    navigate("/login");
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
      ...(name === "internshipId" ? { traineeId: "" } : {}),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!formData.internshipId) {
      setError("Please select an internship.");
      return;
    }

    if (!formData.title.trim()) {
      setError("Please enter a task title.");
      return;
    }

    if (!formData.description.trim()) {
      setError("Please enter a task description.");
      return;
    }

    setSubmitting(true);

    try {
      const createdResponse = await apiRequest("/company/trainer/tasks", {
        method: "POST",
        body: JSON.stringify({
          internshipId: Number(formData.internshipId),
          title: formData.title.trim(),
          description: formData.description.trim(),
          deadline: formData.deadline || undefined,
          status: formData.status,
        }),
      });

      const task = createdResponse?.data || createdResponse;
      const taskId = task?.id;

      if (!taskId) {
        throw new Error("The task was created, but no task ID was returned.");
      }

      if (formData.traineeId) {
        await apiRequest(`/company/trainer/tasks/${taskId}/assign`, {
          method: "POST",
          body: JSON.stringify({ traineeId: Number(formData.traineeId) }),
        });
      }

      if (attachment) {
        const uploadData = new FormData();
        uploadData.append("file", attachment);

        await apiRequest(`/company/trainer/tasks/${taskId}/attachments`, {
          method: "POST",
          body: uploadData,
        });
      }

      showToast("Task created successfully.", "success");
      navigate("/company/trainer/tasks");
    } catch (err) {
      console.error("Failed to create task:", err);
      const message = err?.message || "Failed to create task.";
      setError(message);
      showToast(message, "error");
    } finally {
      setSubmitting(false);
    }
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
        <div className="mx-auto w-full max-w-[1100px] px-5 py-5 sm:px-7 lg:px-8 lg:py-7">
          <PageHeader
            loading={loadingTrainees}
            profile={user}
            fullName={fullName}
            studentUser={trainerUser}
            searchValue=""
            onSearchChange={() => {}}
            chatBadge={0}
            notificationBadge={0}
          />

          <div className="mt-5 flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/company/trainer/tasks")}
              className="flex h-9 w-9 items-center justify-center rounded-xl border bg-white text-[#7B8497] transition hover:border-[#0475FB] hover:text-[#0475FB]"
              style={{ borderColor: COLORS.border }}
              aria-label="Back to tasks"
            >
              <ArrowLeft size={17} />
            </button>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#7B8497]">
                Task Management
              </p>
              <h1 className="text-[25px] font-extrabold tracking-[-0.6px] text-[#172033]">
                Create Task
              </h1>
              <p className="mt-1 text-[13px] font-medium text-[#7B8497]">
                Create a task and optionally assign it to one of your trainees.
              </p>
            </div>
          </div>

          {error && (
            <div className="mt-5 flex items-start gap-2 rounded-xl border border-[#F8D5D5] bg-[#FEF7F7] px-4 py-3 text-[11px] text-[#B42318]">
              <AlertCircle size={15} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_330px]">
            <section
              className="rounded-[18px] border bg-white p-5 shadow-sm sm:p-6"
              style={{ borderColor: COLORS.border }}
            >
              <div className="mb-5 flex items-center gap-3 border-b pb-4" style={{ borderColor: COLORS.border }}>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: COLORS.primarySoft }}>
                  <FileText size={18} style={{ color: COLORS.primary }} />
                </div>
                <div>
                  <h2 className="text-[15px] font-extrabold text-[#172033]">Task Details</h2>
                  <p className="mt-0.5 text-[10px] text-[#7B8497]">Provide the information trainees need to complete the task.</p>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label htmlFor="internshipId" className="mb-2 block text-[11px] font-bold text-[#172033]">
                    Internship <span className="text-[#EF4444]">*</span>
                  </label>
                  <select
                    id="internshipId"
                    name="internshipId"
                    value={formData.internshipId}
                    onChange={handleChange}
                    disabled={loadingTrainees || submitting}
                    className="w-full rounded-xl border bg-white px-3.5 py-3 text-[12px] text-[#172033] outline-none transition focus:border-[#0475FB] focus:ring-2 focus:ring-[#0475FB]/10 disabled:bg-[#F8FAFC]"
                    style={{ borderColor: COLORS.border }}
                  >
                    <option value="">
                      {loadingTrainees ? "Loading internships..." : "Select an internship"}
                    </option>
                    {internships.map((internship) => (
                      <option key={internship.id} value={internship.id}>
                        {internship.title || internship.name || `Internship #${internship.id}`}
                      </option>
                    ))}
                  </select>
                  {!loadingTrainees && internships.length === 0 && (
                    <p className="mt-2 text-[10px] text-[#7B8497]">
                      You do not have any assigned internships yet.
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="title" className="mb-2 block text-[11px] font-bold text-[#172033]">
                    Task Title <span className="text-[#EF4444]">*</span>
                  </label>
                  <input
                    id="title"
                    name="title"
                    type="text"
                    value={formData.title}
                    onChange={handleChange}
                    disabled={submitting}
                    placeholder="e.g. Build the login page"
                    className="w-full rounded-xl border bg-white px-3.5 py-3 text-[12px] text-[#172033] outline-none transition placeholder:text-[#B1B8C5] focus:border-[#0475FB] focus:ring-2 focus:ring-[#0475FB]/10 disabled:bg-[#F8FAFC]"
                    style={{ borderColor: COLORS.border }}
                  />
                </div>

                <div>
                  <label htmlFor="description" className="mb-2 block text-[11px] font-bold text-[#172033]">
                    Description <span className="text-[#EF4444]">*</span>
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    disabled={submitting}
                    rows={7}
                    placeholder="Describe what the trainee needs to do, expected output, and any useful instructions..."
                    className="w-full resize-y rounded-xl border bg-white px-3.5 py-3 text-[12px] leading-5 text-[#172033] outline-none transition placeholder:text-[#B1B8C5] focus:border-[#0475FB] focus:ring-2 focus:ring-[#0475FB]/10 disabled:bg-[#F8FAFC]"
                    style={{ borderColor: COLORS.border }}
                  />
                </div>

                <div>
                  <label htmlFor="attachment" className="mb-2 block text-[11px] font-bold text-[#172033]">
                    Attachment <span className="font-normal text-[#7B8497]">(optional)</span>
                  </label>
                  <label
                    htmlFor="attachment"
                    className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed bg-[#FAFBFD] px-4 py-4 transition hover:border-[#0475FB] hover:bg-[#F7FAFF]"
                    style={{ borderColor: COLORS.border }}
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white">
                      <Paperclip size={16} className="text-[#7B8497]" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-[11px] font-bold text-[#172033]">
                        {attachment ? attachment.name : "Choose a file"}
                      </p>
                      <p className="mt-0.5 text-[10px] text-[#7B8497]">
                        {attachment ? `${Math.ceil(attachment.size / 1024)} KB` : "The file will be uploaded after the task is created."}
                      </p>
                    </div>
                    <input
                      id="attachment"
                      type="file"
                      className="hidden"
                      disabled={submitting}
                      onChange={(event) => setAttachment(event.target.files?.[0] || null)}
                    />
                  </label>
                </div>
              </div>
            </section>

            <aside className="h-fit space-y-5">
              <section
                className="rounded-[18px] border bg-white p-5 shadow-sm"
                style={{ borderColor: COLORS.border }}
              >
                <div className="mb-4 flex items-center gap-2">
                  <Calendar size={16} style={{ color: COLORS.primary }} />
                  <h2 className="text-[14px] font-extrabold text-[#172033]">Task Settings</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="deadline" className="mb-2 block text-[11px] font-bold text-[#172033]">
                      Deadline <span className="font-normal text-[#7B8497]">(optional)</span>
                    </label>
                    <input
                      id="deadline"
                      name="deadline"
                      type="datetime-local"
                      value={formData.deadline}
                      onChange={handleChange}
                      disabled={submitting}
                      className="w-full rounded-xl border bg-white px-3 py-3 text-[11px] text-[#172033] outline-none focus:border-[#0475FB] focus:ring-2 focus:ring-[#0475FB]/10"
                      style={{ borderColor: COLORS.border }}
                    />
                  </div>

                  <div>
                    <label htmlFor="status" className="mb-2 block text-[11px] font-bold text-[#172033]">
                      Initial Status
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      disabled={submitting}
                      className="w-full rounded-xl border bg-white px-3 py-3 text-[11px] text-[#172033] outline-none focus:border-[#0475FB] focus:ring-2 focus:ring-[#0475FB]/10"
                      style={{ borderColor: COLORS.border }}
                    >
                      <option value="TODO">To Do</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="DONE">Done</option>
                    </select>
                  </div>
                </div>
              </section>

              <section
                className="rounded-[18px] border bg-white p-5 shadow-sm"
                style={{ borderColor: COLORS.border }}
              >
                <div className="mb-4 flex items-center gap-2">
                  <UserRound size={16} style={{ color: COLORS.accent }} />
                  <h2 className="text-[14px] font-extrabold text-[#172033]">Assign Trainee</h2>
                </div>

                <label htmlFor="traineeId" className="mb-2 block text-[11px] font-bold text-[#172033]">
                  Trainee <span className="font-normal text-[#7B8497]">(optional)</span>
                </label>
                <select
                  id="traineeId"
                  name="traineeId"
                  value={formData.traineeId}
                  onChange={handleChange}
                  disabled={!formData.internshipId || submitting}
                  className="w-full rounded-xl border bg-white px-3 py-3 text-[11px] text-[#172033] outline-none focus:border-[#0475FB] focus:ring-2 focus:ring-[#0475FB]/10 disabled:bg-[#F8FAFC]"
                  style={{ borderColor: COLORS.border }}
                >
                  <option value="">
                    {formData.internshipId ? "Select a trainee" : "Select an internship first"}
                  </option>
                  {selectedInternshipTrainees.map((trainee) => {
                    const firstName = trainee?.student?.user?.firstName || "";
                    const lastName = trainee?.student?.user?.lastName || "";
                    const name = `${firstName} ${lastName}`.trim() || `Trainee #${trainee.id}`;
                    return (
                      <option key={trainee.id} value={trainee.id}>
                        {name}
                      </option>
                    );
                  })}
                </select>
                <p className="mt-2 text-[10px] leading-4 text-[#7B8497]">
                  If no trainee is selected, the task is created for the internship and can be assigned later.
                </p>
              </section>

              <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
                <Button
                  type="submit"
                  variant="gold"
                  disabled={submitting || loadingTrainees || internships.length === 0}
                  className="flex w-full items-center justify-center gap-2 px-4 py-3 text-[12px] font-bold"
                >
                  <Plus size={16} />
                  {submitting ? "Creating Task..." : "Create Task"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  disabled={submitting}
                  onClick={() => navigate("/company/trainer/tasks")}
                  className="w-full px-4 py-3 text-[12px] font-bold"
                >
                  Cancel
                </Button>
              </div>
            </aside>
          </form>
        </div>
      </main>
    </div>
  );
}
