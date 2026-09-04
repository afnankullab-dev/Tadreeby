import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Users, RefreshCw, AlertCircle, ArrowRight } from "lucide-react";
import Sidebar from "../../layout/Sidebar";
import PageHeader from "../../common/pagesAssets/PageHeader";
import { useAuth } from "../../../context/AuthContext";
import { trainerAPI } from "../../../services/api";
import { trainerNavItems, trainerSidebarProps } from "./trainerNavigation";
import { DUMMY_TRAINER_STUDENTS } from "./trainerMockData";

export default function TrainerStudents() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [students, setStudents] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [usingDummy, setUsingDummy] = useState(false);

  const load = async () => {
    setLoading(true); setError("");
    try {
      const response = await trainerAPI.getMyStudents(1, 50);
      const data = response?.data || response || [];
      setStudents(Array.isArray(data) ? data : []);
      setUsingDummy(false);
    } catch (e) {
      console.warn("Trainer students API unavailable; using temporary dummy data.", e);
      setStudents(DUMMY_TRAINER_STUDENTS);
      setUsingDummy(true);
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);
  const filtered = useMemo(() => students.filter((item) => { const s = item.student || item; const name = `${s.user?.firstName || ""} ${s.user?.lastName || ""}`; return `${name} ${s.major || ""}`.toLowerCase().includes(query.toLowerCase()); }), [students, query]);
  const fullName = `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "Trainer";
  const signOut = () => { logout(); navigate("/login"); };

  return <div className="flex h-screen w-full overflow-hidden bg-[#F7F9FC]"><Sidebar navItems={trainerNavItems} footerItems={[]} user={{ name: fullName, role: "Company Trainer", avatar: user?.profileImage || "" }} {...trainerSidebarProps} onSignOut={signOut} /><main className="flex-1 overflow-y-auto"><div className="mx-auto max-w-[1240px] px-5 py-5 sm:px-7 lg:px-8 lg:py-7"><PageHeader loading={loading} profile={user} fullName={fullName} studentUser={{ name: fullName, role: "Company Trainer", avatar: user?.profileImage || "" }} searchValue="" onSearchChange={() => {}} chatBadge={0} notificationBadge={0} /><div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[.12em] text-[#7B8497]">Supervision</p><h1 className="mt-1 text-2xl font-extrabold text-[#172033]">My Trainees</h1><p className="mt-1 text-sm text-[#7B8497]">Find a trainee quickly and open their supervision workspace.</p></div><button onClick={load} className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#E5E9F0] bg-white px-4 py-2.5 text-xs font-bold text-[#172033] hover:bg-[#F8FAFD]"><RefreshCw size={15}/> Refresh</button></div>{usingDummy&&<div className="mt-4 flex gap-2 rounded-xl border border-[#F6D8AD] bg-[#FFFBF5] p-3 text-xs text-[#8A5A00]"><AlertCircle size={15}/> Backend trainees endpoint is not available yet. Temporary demo trainees are shown for the UI.</div>}<div className="mt-5 rounded-2xl border border-[#E9EDF4] bg-white p-4"><div className="relative"><Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A1A9B8]"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search by trainee name or major..." className="h-11 w-full rounded-xl border border-[#E4E8EF] bg-[#FAFBFD] pl-10 pr-4 text-sm outline-none focus:border-[#0475FB]"/></div></div><div className="mt-5 overflow-hidden rounded-2xl border border-[#E9EDF4] bg-white"><div className="flex items-center justify-between border-b border-[#E9EDF4] px-5 py-4"><div><h2 className="text-sm font-extrabold text-[#172033]">Assigned trainees</h2><p className="text-xs text-[#7B8497]">{loading ? "Loading..." : `${filtered.length} trainee${filtered.length === 1 ? "" : "s"}`}</p></div></div>{loading?<div className="space-y-3 p-5">{[1,2,3].map(i=><div key={i} className="h-16 animate-pulse rounded-xl bg-[#F3F5F8]"/>)}</div>:filtered.length===0?<div className="p-12 text-center"><Users className="mx-auto text-[#C8CFDA]"/><p className="mt-3 text-sm font-bold text-[#596274]">{query?"No matching trainees":"No trainees assigned yet"}</p></div>:<div className="divide-y divide-[#EEF1F5]">{filtered.map(item=>{const s=item.student||item;const name=`${s.user?.firstName||""} ${s.user?.lastName||""}`.trim()||"Trainee";return <button key={item.id} onClick={()=>navigate(`/company/trainer/students/${item.id}`,{state:{student:item}})} className="flex w-full items-center gap-4 px-5 py-4 text-left hover:bg-[#FAFBFD]"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#EAF3FF] text-sm font-extrabold text-[#0475FB]">{name.charAt(0)}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-[#172033]">{name}</p><p className="mt-1 truncate text-xs text-[#7B8497]">{s.major||"Major not provided"}</p></div><span className="hidden rounded-full bg-[#EAF9EF] px-2.5 py-1 text-[10px] font-bold text-[#16833A] sm:block">Assigned</span><ArrowRight size={17} className="text-[#A1A9B8]"/></button>})}</div>}</div></div></main></div>;
}
