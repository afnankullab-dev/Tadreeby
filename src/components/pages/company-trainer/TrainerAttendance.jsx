import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarCheck2, Check, Clock3, Search, Users, X, Save, RotateCw } from "lucide-react";
import Sidebar from "../../layout/Sidebar";
import PageHeader from "../../common/pagesAssets/PageHeader";
import { Button } from "../../common/Button";
import { useAuth } from "../../../context/AuthContext";
import { trainerAPI } from "../../../services/api";
import { trainerNavItems, trainerSidebarProps } from "./trainerNavigation";

const STORAGE_KEY = "tadreeby-trainer-attendance";
const STATUSES = [
  { value: "PRESENT", label: "Present", icon: Check, className: "bg-[#EAF9EF] text-[#16833A] border-[#CDEED8]" },
  { value: "LATE", label: "Late", icon: Clock3, className: "bg-[#FFF4E5] text-[#A45A00] border-[#F6D8AD]" },
  { value: "ABSENT", label: "Absent", icon: X, className: "bg-[#FEF0F0] text-[#C33B3B] border-[#F3D1D1]" },
];

const today = () => new Date().toISOString().slice(0, 10);

export default function TrainerAttendance() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [students, setStudents] = useState([]);
  const [date, setDate] = useState(today());
  const [query, setQuery] = useState("");
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const fullName = `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "Trainer";

  useEffect(() => {
    try { setAttendance(JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}")); } catch { setAttendance({}); }
  }, []);

  const loadStudents = async () => {
    setLoading(true); setError("");
    try { const response = await trainerAPI.getMyStudents(1, 100); setStudents(response?.data || response || []); }
    catch (e) { setError(e?.message || "Unable to load trainees."); }
    finally { setLoading(false); }
  };
  useEffect(() => { loadStudents(); }, []);

  const normalized = useMemo(() => students.map(item => item.student || item), [students]);
  const filtered = useMemo(() => normalized.filter(s => { const name = `${s.user?.firstName || ""} ${s.user?.lastName || ""}`; return `${name} ${s.major || ""}`.toLowerCase().includes(query.toLowerCase()); }), [normalized, query]);
  const keyFor = (student) => `${date}:${student.id}`;
  const getStatus = (student) => attendance[keyFor(student)] || "";
  const setStatus = (student, status) => { setSaved(false); setAttendance(prev => ({ ...prev, [keyFor(student)]: status })); };
  const markAll = (status) => { setSaved(false); setAttendance(prev => { const next = { ...prev }; filtered.forEach(s => { next[keyFor(s)] = status; }); return next; }); };
  const save = () => { setSaving(true); try { localStorage.setItem(STORAGE_KEY, JSON.stringify(attendance)); setSaved(true); } finally { setSaving(false); } };
  const signOut = () => { logout(); navigate("/login"); };
  const counts = filtered.reduce((acc, s) => { const status = getStatus(s); if (status) acc[status] += 1; else acc.UNMARKED += 1; return acc; }, { PRESENT: 0, LATE: 0, ABSENT: 0, UNMARKED: 0 });

  return <div className="flex h-screen w-full overflow-hidden bg-[#F7F9FC]"><Sidebar navItems={trainerNavItems} footerItems={[]} user={{ name: fullName, role: "Company Trainer", avatar: user?.profileImage || "" }} {...trainerSidebarProps} onSignOut={signOut}/><main className="flex-1 overflow-y-auto"><div className="mx-auto max-w-[1240px] px-5 py-5 sm:px-7 lg:px-8 lg:py-7"><PageHeader loading={loading} profile={user} fullName={fullName} studentUser={{ name: fullName, role: "Company Trainer", avatar: user?.profileImage || "" }} searchValue="" onSearchChange={() => {}} chatBadge={0} notificationBadge={0}/>
    <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-xs font-bold uppercase tracking-[.12em] text-[#7B8497]">Trainee supervision</p><h1 className="mt-1 text-2xl font-extrabold text-[#172033]">Attendance</h1><p className="mt-1 text-sm text-[#7B8497]">Track daily attendance for the trainees assigned to you.</p></div><div className="flex items-center gap-2"><button onClick={loadStudents} className="inline-flex items-center gap-2 rounded-xl border border-[#E4E8EF] bg-white px-3 py-2.5 text-xs font-bold text-[#596274]"><RotateCw size={14}/> Refresh</button><Button variant="primary" onClick={save} disabled={saving} className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold"><Save size={15}/>{saving ? "Saving..." : saved ? "Saved" : "Save attendance"}</Button></div></div>
    <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4"><div className="rounded-2xl border border-[#E9EDF4] bg-white p-4"><p className="text-[10px] font-bold uppercase tracking-wider text-[#7B8497]">Trainees</p><p className="mt-1 text-xl font-extrabold text-[#172033]">{filtered.length}</p></div><div className="rounded-2xl border border-[#CDEED8] bg-[#F7FCF8] p-4"><p className="text-[10px] font-bold uppercase tracking-wider text-[#16833A]">Present</p><p className="mt-1 text-xl font-extrabold text-[#16833A]">{counts.PRESENT}</p></div><div className="rounded-2xl border border-[#F6D8AD] bg-[#FFFBF5] p-4"><p className="text-[10px] font-bold uppercase tracking-wider text-[#A45A00]">Late</p><p className="mt-1 text-xl font-extrabold text-[#A45A00]">{counts.LATE}</p></div><div className="rounded-2xl border border-[#F3D1D1] bg-[#FFF9F9] p-4"><p className="text-[10px] font-bold uppercase tracking-wider text-[#C33B3B]">Absent</p><p className="mt-1 text-xl font-extrabold text-[#C33B3B]">{counts.ABSENT}</p></div></div>
    <div className="mt-5 rounded-2xl border border-[#E9EDF4] bg-white p-4"><div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><div className="relative flex-1"><Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A1A9B8]"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search trainee..." className="h-11 w-full rounded-xl border border-[#E4E8EF] bg-[#FAFBFD] pl-10 pr-4 text-sm outline-none focus:border-[#0475FB]"/></div><div className="flex items-center gap-2"><label className="text-xs font-bold text-[#596274]">Date</label><input type="date" value={date} onChange={e=>{setDate(e.target.value);setSaved(false)}} className="h-11 rounded-xl border border-[#E4E8EF] px-3 text-sm outline-none focus:border-[#0475FB]"/></div></div><div className="mt-3 flex flex-wrap gap-2"><button onClick={()=>markAll("PRESENT")} className="rounded-lg bg-[#EAF9EF] px-3 py-2 text-[10px] font-bold text-[#16833A]">Mark all present</button><button onClick={()=>markAll("ABSENT")} className="rounded-lg bg-[#FEF0F0] px-3 py-2 text-[10px] font-bold text-[#C33B3B]">Mark all absent</button></div></div>
    {error&&<div className="mt-4 rounded-xl border border-[#F4D0D0] bg-[#FFF7F7] p-3 text-xs text-[#B42318]">{error}</div>}
    <div className="mt-5 overflow-hidden rounded-2xl border border-[#E9EDF4] bg-white"><div className="border-b border-[#E9EDF4] px-5 py-4"><h2 className="text-sm font-extrabold text-[#172033]">Daily attendance</h2><p className="mt-1 text-xs text-[#7B8497]">{date} · {counts.UNMARKED} not marked</p></div>{loading?<div className="space-y-3 p-5">{[1,2,3].map(i=><div key={i} className="h-16 animate-pulse rounded-xl bg-[#F3F5F8]"/>)}</div>:filtered.length===0?<div className="p-12 text-center"><Users className="mx-auto text-[#C8CFDA]"/><p className="mt-3 text-sm font-bold text-[#596274]">{query?"No matching trainees":"No trainees assigned yet"}</p></div>:<div className="divide-y divide-[#EEF1F5]">{filtered.map(student=>{const name=`${student.user?.firstName||""} ${student.user?.lastName||""}`.trim()||"Trainee";const current=getStatus(student);return <div key={student.id} className="flex flex-col gap-4 px-5 py-4 lg:flex-row lg:items-center"><div className="flex min-w-0 flex-1 items-center gap-3"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#EAF3FF] text-sm font-extrabold text-[#0475FB]">{name.charAt(0)}</div><div className="min-w-0"><p className="truncate text-sm font-bold text-[#172033]">{name}</p><p className="mt-1 truncate text-xs text-[#7B8497]">{student.major||"Major not provided"}</p></div></div><div className="flex flex-wrap gap-2">{STATUSES.map(({value,label,icon:Icon,className})=><button key={value} onClick={()=>setStatus(student,value)} className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-[10px] font-bold transition ${current===value?`${className} ring-2 ring-[#DCEBFA]`:"border-[#E4E8EF] bg-white text-[#7B8497] hover:bg-[#FAFBFD]"}`}><Icon size={13}/>{label}</button>)}</div></div>})}</div>}</div>
    <p className="mt-4 text-[10px] text-[#98A1B0]">Attendance changes are currently saved in this browser. Trainer attendance API support is not present in the connected backend yet.</p>
  </div></main></div>;
}
