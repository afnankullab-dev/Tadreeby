import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BriefcaseBusiness, CalendarDays, MapPin, Users, UserCheck, Clock3, AlertCircle, RefreshCw } from "lucide-react";
import Sidebar from "../../layout/Sidebar";
import PageHeader from "../../common/pagesAssets/PageHeader";
import { useAuth } from "../../../context/AuthContext";
import { trainerAPI } from "../../../services/api";
import { trainerNavItems, trainerSidebarProps } from "./trainerNavigation";

const first = (...values) => values.find(v => v !== undefined && v !== null && v !== "");
const unwrap = value => value?.data || value || {};

export default function TrainerInternshipDetails() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [dashboard, setDashboard] = useState({});
  const [students, setStudents] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const fullName = `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "Trainer";
  const signOut = () => { logout(); navigate("/login"); };

  const load = async () => { setLoading(true); setError(""); try { const [d, s, a] = await Promise.all([trainerAPI.getDashboard(), trainerAPI.getMyStudents(1, 100), trainerAPI.getPendingApplications(1, 100)]); setDashboard(unwrap(d)); setStudents(unwrap(s) instanceof Array ? unwrap(s) : []); setApplications(unwrap(a) instanceof Array ? unwrap(a) : []); } catch (e) { setError(e?.message || "Unable to load internship details."); } finally { setLoading(false); } };
  useEffect(() => { load(); }, []);

  const source = dashboard?.internship || dashboard?.opportunity || dashboard?.trainingOpportunity || dashboard?.currentInternship || dashboard?.currentOpportunity || dashboard;
  const title = first(source?.title, source?.name, source?.opportunity?.title, "Current Internship");
  const description = first(source?.description, source?.details, "No internship description is available from the current trainer API.");
  const company = first(source?.company?.name, dashboard?.company?.name, "Your Company");
  const location = first(source?.location, source?.address, "Not specified");
  const start = first(source?.startDate, source?.start_date);
  const end = first(source?.endDate, source?.end_date);
  const capacity = first(source?.capacity, source?.maxStudents, source?.slots, source?.numberOfStudents);
  const accepted = first(dashboard?.stats?.totalStudents, students.length, 0);
  const pending = first(dashboard?.stats?.pendingApplications, applications.length, 0);
  const status = first(source?.status, "ACTIVE");

  return <div className="flex h-screen w-full overflow-hidden bg-[#F7F9FC]"><Sidebar navItems={trainerNavItems} footerItems={trainerSidebarProps.footerItems} user={{ name: fullName, role: "Company Trainer", avatar: user?.profileImage || "" }} {...trainerSidebarProps} onSignOut={signOut}/><main className="flex-1 overflow-y-auto"><div className="mx-auto max-w-[1240px] px-5 py-5 sm:px-7 lg:px-8 lg:py-7"><PageHeader loading={loading} profile={user} fullName={fullName} studentUser={{ name: fullName, role: "Company Trainer", avatar: user?.profileImage || "" }} searchValue="" onSearchChange={()=>{}} chatBadge={0} notificationBadge={pending}/><div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[.12em] text-[#7B8497]">Training opportunity</p><h1 className="mt-1 text-2xl font-extrabold text-[#172033]">Internship Details</h1><p className="mt-1 text-sm text-[#7B8497]">Everything you need to know about the internship you are supervising.</p></div><button onClick={load} className="inline-flex items-center gap-2 rounded-xl border border-[#E4E8EF] bg-white px-4 py-2.5 text-xs font-bold"><RefreshCw size={15}/> Refresh</button></div>{error&&<div className="mt-4 flex gap-2 rounded-xl border border-[#F4D0D0] bg-[#FFF7F7] p-3 text-xs text-[#B42318]"><AlertCircle size={15}/>{error}</div>}<div className="mt-5 rounded-2xl bg-[#172033] p-6 text-white"><div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"><div><span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold">{status}</span><h2 className="mt-3 text-2xl font-extrabold">{title}</h2><p className="mt-1 text-sm text-white/70">{company}</p></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-3"><div className="rounded-xl bg-white/10 px-4 py-3"><p className="text-[10px] text-white/60">Accepted</p><p className="mt-1 text-xl font-extrabold">{accepted}</p></div><div className="rounded-xl bg-white/10 px-4 py-3"><p className="text-[10px] text-white/60">Pending review</p><p className="mt-1 text-xl font-extrabold">{pending}</p></div><div className="rounded-xl bg-white/10 px-4 py-3"><p className="text-[10px] text-white/60">Capacity</p><p className="mt-1 text-xl font-extrabold">{capacity ?? "—"}</p></div></div></div></div><div className="mt-5 grid gap-5 lg:grid-cols-[1.5fr_1fr]"><section className="rounded-2xl border border-[#E9EDF4] bg-white p-5"><h3 className="text-sm font-extrabold text-[#172033]">About this internship</h3><p className="mt-3 whitespace-pre-line text-sm leading-6 text-[#596274]">{description}</p><div className="mt-6 grid gap-3 sm:grid-cols-2"><div className="rounded-xl bg-[#FAFBFD] p-4"><CalendarDays size={17} className="text-[#0475FB]"/><p className="mt-2 text-[10px] font-bold uppercase text-[#8A93A4]">Training period</p><p className="mt-1 text-xs font-bold text-[#172033]">{start||"Not specified"}{end?` — ${end}`:""}</p></div><div className="rounded-xl bg-[#FAFBFD] p-4"><MapPin size={17} className="text-[#0475FB]"/><p className="mt-2 text-[10px] font-bold uppercase text-[#8A93A4]">Location</p><p className="mt-1 text-xs font-bold text-[#172033]">{location}</p></div></div></section><section className="rounded-2xl border border-[#E9EDF4] bg-white p-5"><h3 className="text-sm font-extrabold text-[#172033]">Internship overview</h3><div className="mt-4 space-y-3"><div className="flex items-center justify-between rounded-xl bg-[#EAF3FF] p-3"><span className="flex items-center gap-2 text-xs font-bold text-[#596274]"><Users size={15}/> Accepted trainees</span><strong className="text-[#0475FB]">{accepted}</strong></div><div className="flex items-center justify-between rounded-xl bg-[#FFF4E5] p-3"><span className="flex items-center gap-2 text-xs font-bold text-[#596274]"><UserCheck size={15}/> Applications awaiting review</span><strong className="text-[#A45A00]">{pending}</strong></div><div className="flex items-center justify-between rounded-xl bg-[#F3F5F8] p-3"><span className="flex items-center gap-2 text-xs font-bold text-[#596274]"><Clock3 size={15}/> Status</span><strong className="text-[#172033]">{status}</strong></div></div><button onClick={()=>navigate("/company/trainer/applications")} className="mt-5 w-full rounded-xl bg-[#0475FB] px-4 py-3 text-xs font-bold text-white">Review applications</button></section></div></div></main></div>;
}
