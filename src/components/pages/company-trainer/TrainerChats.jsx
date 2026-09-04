// src/components/pages/company-trainer/TrainerChats.jsx
import React, { useEffect, useRef, useState } from "react";
import {
  Search,
  MoreHorizontal,
  Phone,
  Paperclip,
  Image as ImageIcon,
  Smile,
  Send,
  Check,
  CheckCheck,
  ChevronRight,
  Filter,
  Bell,
  ChevronDown,
  Settings,
  Clock,
  BriefcaseBusiness,
  MessageCircle,
  ListTodo,
  UserRound,
} from "lucide-react";
import Sidebar from "../../layout/Sidebar";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const COLORS = {
  primary: "#0475FB",
  primaryDark: "#035CC9",
  primarySoft: "#EAF3FF",
  accent: "#FFAD4E",
  green: "#22C55E",
  text: "#172033",
  muted: "#7B8497",
  border: "#E9EDF4",
  background: "#F5F7FB",
};

const DUMMY_CHATS = [
  {
    id: 1,
    name: "Omar Khaled",
    role: "Software Engineering Trainee",
    avatar: "https://i.pravatar.cc/150?u=omar-khaled",
    lastMessage: "I have finished the task and submitted it.",
    time: "11:19 AM",
    unread: 0,
    status: "online",
  },
  {
    id: 2,
    name: "Sara Ahmad",
    role: "Computer Science Trainee",
    avatar: "https://i.pravatar.cc/150?u=sara-ahmad",
    lastMessage: "Could you review my latest submission?",
    time: "11:30 AM",
    unread: 1,
    status: "offline",
  },
  {
    id: 3,
    name: "Yousef Ali",
    role: "Information Technology Trainee",
    avatar: "https://i.pravatar.cc/150?u=yousef-ali",
    lastMessage: "Thank you for the feedback!",
    time: "11:29 AM",
    unread: 1,
    status: "online",
  },
];

const DUMMY_MESSAGES = [
  {
    id: 1,
    senderId: 1,
    text: "Can we schedule a 30-minute review for my latest task?",
    time: "11:18 AM",
    isMe: false,
  },
  {
    id: 2,
    senderId: "me",
    text: "Sure. What about 2:30 PM?",
    time: "11:18 AM",
    isMe: true,
  },
  {
    id: 3,
    senderId: 1,
    text: "That works for me. I will prepare the updated version before then.",
    time: "11:19 AM",
    isMe: false,
  },
  {
    id: 4,
    senderId: "me",
    text: "Perfect. I will review it during our meeting.",
    time: "11:20 AM",
    isMe: true,
  },
];

const getInitials = (name) =>
  name
    ?.split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "U";

export default function TrainerChats() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [chats, setChats] = useState(DUMMY_CHATS);
  const [activeChat, setActiveChat] = useState(DUMMY_CHATS[0]);
  const [messages, setMessages] = useState(DUMMY_MESSAGES);
  const [newMessage, setNewMessage] = useState("");
  const [search, setSearch] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const filteredChats = chats.filter((chat) =>
    `${chat.name} ${chat.role}`.toLowerCase().includes(search.toLowerCase())
  );

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const time = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    const newMsg = {
      id: messages.length + 1,
      senderId: "me",
      text: newMessage.trim(),
      time,
      isMe: true,
    };

    setMessages((current) => [...current, newMsg]);
    setNewMessage("");
    setChats((current) =>
      current.map((chat) =>
        chat.id === activeChat.id
          ? { ...chat, lastMessage: newMsg.text, time, unread: 0 }
          : chat
      )
    );
    setActiveChat((current) => ({ ...current, lastMessage: newMsg.text, time, unread: 0 }));
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const fullName = `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "Trainer";
  const trainerUser = {
    name: fullName,
    role: "Company Trainer",
    avatar: user?.profileImage || "",
  };

  const handleSignOut = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex h-screen w-full overflow-hidden" style={{ backgroundColor: COLORS.background }}>
      <Sidebar
        navItems={[
          { label: "Dashboard", icon: BriefcaseBusiness, path: "/company/trainer/dashboard" },
        ]}
        footerItems={[
          { label: "Chat", icon: MessageCircle, path: "/company/trainer/chat" },
          { label: "Settings", icon: Settings, path: "/company/trainer/settings" },
        ]}
        user={trainerUser}
        profilePath="/company/trainer/settings"
        brandPath="/company/trainer/dashboard"
        storageKey="sidebar-company-trainer"
        onSignOut={handleSignOut}
      />

      <main className="flex-1 overflow-hidden p-4">
        <div className="flex h-full w-full overflow-hidden rounded-[24px] border bg-white shadow-sm" style={{ borderColor: COLORS.border }}>
          <div className="flex w-[320px] shrink-0 flex-col border-r" style={{ borderColor: COLORS.border }}>
            <div className="p-4">
              <div className="relative mb-4">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  type="text"
                  placeholder="Search conversations..."
                  className="h-10 w-full rounded-full border border-gray-200 bg-gray-50 pl-10 pr-4 text-[13px] outline-none transition focus:border-[#0475FB] focus:ring-1 focus:ring-[#0475FB]"
                />
              </div>
              <div className="flex items-center justify-between pb-2">
                <h3 className="text-[13px] font-extrabold text-[#172033]">
                  Unread <span className="ml-1 text-gray-400">{chats.filter((chat) => chat.unread).length}</span>
                </h3>
                <Filter size={14} className="cursor-pointer text-gray-400 hover:text-[#0475FB]" />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-2 pb-4">
              {filteredChats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => {
                    setActiveChat(chat);
                    setMessages(chat.id === 1 ? DUMMY_MESSAGES : []);
                    setChats((current) => current.map((item) => item.id === chat.id ? { ...item, unread: 0 } : item));
                  }}
                  className={`relative mb-1 flex cursor-pointer items-center gap-3 rounded-xl p-3 transition-colors ${
                    activeChat.id === chat.id ? "bg-[#EAF3FF]" : "hover:bg-gray-50"
                  }`}
                >
                  <div className="relative">
                    <img src={chat.avatar} alt={chat.name} className="h-10 w-10 rounded-full object-cover" />
                    {chat.status === "online" && (
                      <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-green-500" />
                    )}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="truncate text-[13px] font-bold text-[#172033]">{chat.name}</h4>
                      <span className="shrink-0 text-[10px] font-semibold text-gray-400">{chat.time}</span>
                    </div>
                    <p className={`truncate text-[12px] ${chat.unread ? "font-bold text-[#172033]" : "font-medium text-gray-500"}`}>
                      {chat.lastMessage}
                    </p>
                  </div>
                  {chat.unread > 0 && (
                    <span className="absolute right-4 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full bg-[#FFAD4E] text-[10px] font-bold text-white">
                      {chat.unread}
                    </span>
                  )}
                </div>
              ))}
              {filteredChats.length === 0 && (
                <div className="px-4 py-10 text-center text-xs text-gray-400">No conversations found.</div>
              )}
            </div>
          </div>

          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex h-[72px] shrink-0 items-center justify-between border-b px-6" style={{ borderColor: COLORS.border }}>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img src={activeChat.avatar} alt={activeChat.name} className="h-10 w-10 rounded-full object-cover" />
                  {activeChat.status === "online" && <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-green-500" />}
                </div>
                <div>
                  <h2 className="text-[14px] font-extrabold text-[#172033]">{activeChat.name}</h2>
                  <p className="mt-0.5 text-[10px] font-medium text-[#7B8497]">{activeChat.status === "online" ? "Online" : "Offline"} · {activeChat.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="flex h-8 items-center gap-1.5 rounded-full border border-gray-200 px-3 text-[11px] font-semibold text-gray-600 hover:border-[#0475FB] hover:text-[#0475FB]"><Phone size={13} /> Call</button>
                <button className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:text-[#0475FB]"><MoreHorizontal size={15} /></button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-[#F9FAFD] p-6">
              <div className="mb-5 text-center"><span className="rounded-full bg-white px-3 py-1 text-[10px] font-semibold text-gray-400 shadow-sm">Today</span></div>
              {messages.length === 0 ? (
                <div className="flex h-[60%] flex-col items-center justify-center text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EAF3FF] text-[#0475FB]"><MessageCircle size={22} /></div>
                  <h3 className="mt-3 text-sm font-extrabold text-[#172033]">No messages yet</h3>
                  <p className="mt-1 max-w-xs text-[11px] leading-5 text-[#7B8497]">Start a conversation with {activeChat.name}.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map((message) => (
                    <div key={message.id} className={`flex ${message.isMe ? "justify-end" : "justify-start"}`}>
                      <div className="max-w-[70%]">
                        <div className={`rounded-2xl px-4 py-2.5 text-[12px] leading-5 ${message.isMe ? "rounded-tr-sm bg-[#0475FB] text-white" : "rounded-tl-sm bg-white text-[#172033] shadow-sm"}`}>
                          {message.text}
                        </div>
                        <div className={`mt-1 flex items-center gap-1 text-[9px] text-gray-400 ${message.isMe ? "justify-end" : "justify-start"}`}>
                          {message.time}
                          {message.isMe && <CheckCheck size={12} className="text-[#0475FB]" />}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            <div className="border-t p-4" style={{ borderColor: COLORS.border }}>
              <div className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 focus-within:border-[#0475FB] focus-within:ring-1 focus-within:ring-[#0475FB]">
                <button className="text-gray-400 hover:text-[#0475FB]"><Paperclip size={17} /></button>
                <input
                  value={newMessage}
                  onChange={(event) => setNewMessage(event.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Message ${activeChat.name}...`}
                  className="h-8 flex-1 bg-transparent px-1 text-[12px] outline-none"
                />
                <button className="text-gray-400 hover:text-[#0475FB]"><ImageIcon size={17} /></button>
                <button className="text-gray-400 hover:text-[#0475FB]"><Smile size={17} /></button>
                <button onClick={handleSendMessage} className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0475FB] text-white transition hover:bg-[#035CC9]"><Send size={15} /></button>
              </div>
            </div>
          </div>

          <aside className="hidden w-[280px] shrink-0 border-l xl:block" style={{ borderColor: COLORS.border }}>
            <div className="flex h-[72px] items-center justify-between border-b px-6" style={{ borderColor: COLORS.border }}>
              <h3 className="text-[13px] font-extrabold text-[#172033]">Contact info</h3>
              <MoreHorizontal size={16} className="text-gray-400" />
            </div>
            <div className="p-6">
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5 text-center">
                <img src={activeChat.avatar} alt={activeChat.name} className="mx-auto h-16 w-16 rounded-full object-cover" />
                <h3 className="mt-3 text-sm font-extrabold text-[#172033]">{activeChat.name}</h3>
                <p className="mt-1 text-[10px] text-[#7B8497]">{activeChat.role}</p>
                <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#EAF9EF] px-2.5 py-1 text-[9px] font-semibold text-[#22C55E]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#22C55E]" /> {activeChat.status === "online" ? "Online" : "Offline"}
                </span>
              </div>

              <div className="mt-6 space-y-4">
                <div><p className="text-[9px] font-bold uppercase tracking-wide text-gray-400">Internship</p><p className="mt-1 text-[11px] font-semibold text-[#172033]">Frontend Development Internship</p></div>
                <div><p className="text-[9px] font-bold uppercase tracking-wide text-gray-400">University</p><p className="mt-1 text-[11px] font-semibold text-[#172033]">Tadreeby University</p></div>
                <div><p className="text-[9px] font-bold uppercase tracking-wide text-gray-400">Tasks</p><p className="mt-1 text-[11px] font-semibold text-[#172033]">4 assigned · 2 completed</p></div>
                <div><p className="text-[9px] font-bold uppercase tracking-wide text-gray-400">Attendance</p><p className="mt-1 text-[11px] font-semibold text-[#172033]">92% attendance</p></div>
              </div>

              <button onClick={() => navigate(`/company/trainer/students/${activeChat.id}`)} className="mt-7 flex w-full items-center justify-between rounded-xl border border-gray-200 px-3 py-2.5 text-[11px] font-bold text-[#172033] hover:border-[#0475FB] hover:text-[#0475FB]">
                View trainee profile <ChevronRight size={14} />
              </button>
            </div>
          </aside>
        </div>
        <p className="px-1 pt-2 text-[10px] text-[#98A1B0]">Chat is currently a frontend demo using dummy conversations and messages; it is not connected to the backend.</p>
      </main>
    </div>
  );
}
