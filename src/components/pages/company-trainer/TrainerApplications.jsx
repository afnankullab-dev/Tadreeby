import React, { useEffect, useState } from "react";
import { Check, X, UserCheck, RefreshCw, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../layout/Sidebar";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../context/ToastContext";
import { trainerAPI } from "../../../services/api";

const navItems = [
  { label: "Dashboard", icon: () => <span>▦</span>, path: "/company/trainer/dashboard" },
  { label: "Trainees", icon: () => <span>◉</span>, path: "/company/trainer/students" },
  { label: "Tasks", icon: () => <span>✓</span>, path: "/company/trainer/tasks" },
  { label: "Applications", icon: UserCheck, path: "/company/trainer/applications" },
];
const nameOf = (a) => `${a?.student?.user?.firstName || ""} ${a?.student?.user?.lastName || ""}`.trim() || "Student";

export default function TrainerApplications() {
  const navigate = useNavigate(); const { user, logout } = useAuth(); const { showToast } = useToast();
  const [items, setItems] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState(""); const [acting, setActing] = useState(null);
  const load = async () => { setLoading(true); setError(""); try { const r = await trainerAPI.getPendingApplications(1, 50); setItems(r?.data || r || []); } catch (e) { setError(e?.message || "Unable to load applications."); } finally { setLoading(false); } };
  useEffect(() => { load(); }, []);
  const act = async (id, type) => { setActing(id); try { if (type === "approve") await trainerAPI.approveApplication(id); else await trainerAPI.rejectApplication(id); showToast(type === "approve" ? "Application approved." : "Application rejected.", "success"); setItems(x => x.filter(a => a.id !== id)); } catch (e) { showToast(e?.message || "Action failed.", "error"); } finally { setActing(null); } };
  const fullName = `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "Trainer";
  return <div className="flex min-h-screen w-full bg-[#F5F7FB] font-['Inter'] text-[#172033]"><Sidebar navItems={navItems} footerItems={[]} user={{name:fullName,role:"Company Trainer",avatar:user?.profileImage||""}} profilePath="/company/trainer/dashboard" onSignOut={()=>{logout();navigate("/login")}} brandPath="/company/trainer/dashboard" storageKey="sidebar-company-trainer"/><main className="min-w-0 flex-1 overflow-y-auto"><div className="mx-auto max-w-[1100px] px-5 py-6 sm:px-8 lg:px-10"><header className="mb-8 flex items-end justify-between"><div><p className="text-[11px] font-bold uppercase tracking-[.14em] text-[#7B8497]">Review queue</p><h1 className="mt-1 text-2xl font-extrabold">Applications</h1><p className="mt-1 text-sm text-[#7B8497]">Review students requesting to join your internship.</p></div><button onClick={load} className="flex items-center gap-2 rounded-xl border bg-white px-3 py-2 text-xs font-bold hover:bg-slate-50"><RefreshCw size={14}/> Refresh</button></header>{error&&<div className="mb-4 flex gap-2 rounded-xl border border-red-100 bg-red-50 p-3 text-xs text-red-700"><AlertCircle size={15}/>{error}</div>}<section className="overflow-hidden rounded-2xl border bg-white shadow-sm" style={{borderColor:"#E9EDF4"}}>{loading?<div className="p-10 text-center text-sm text-[#7B8497]">Loading applications...</div>:items.length===0?<div className="p-14 text-center"><UserCheck size={32} className="mx-auto text-[#C9D0DB]"/><p className="mt-3 text-sm font-bold">Your review queue is clear</p><p className="mt-1 text-xs text-[#7B8497]">New internship applications will appear here.</p></div>:<div className="divide-y">{items.map(a=><div key={a.id} className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center"><div className="flex min-w-0 flex-1 items-center gap-3"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#EAF3FF] text-sm font-extrabold text-[#0475FB]">{nameOf(a).charAt(0)}</div><div className="min-w-0"><p className="truncate text-sm font-extrabold">{nameOf(a)}</p><p className="mt-0.5 truncate text-xs text-[#7B8497]">{a?.student?.major || "Major not provided"}</p></div></div><div className="flex gap-2"><button disabled={acting===a.id} onClick={()=>act(a.id,"reject")} className="flex items-center gap-1.5 rounded-xl border border-red-100 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 disabled:opacity-50"><X size={14}/> Reject</button><button disabled={acting===a.id} onClick={()=>act(a.id,"approve")} className="flex items-center gap-1.5 rounded-xl bg-[#0475FB] px-3 py-2 text-xs font-bold text-white hover:bg-[#035CC9] disabled:opacity-50"><Check size={14}/> Approve</button></div></div>)}</div>}</section></div></main></div>;
}
