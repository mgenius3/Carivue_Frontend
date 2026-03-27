"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Camera, Copy, Check, ChevronDown, Mail, Lock, Globe, Users, Trash2, Edit2, Plus } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { 
  InviteMemberModal, 
  StatusModal, 
  EditMemberRoleModal, 
  RemoveMemberModal 
} from "@/components/dashboard/TeamModals";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [copied, setCopied] = useState(false);
  
  // Modal States
  const [modalState, setModalState] = useState<{
    type: string | null;
    isOpen: boolean;
    data?: any;
    config?: any;
  }>({
    type: null,
    isOpen: false
  });

  const handleCopy = () => {
    navigator.clipboard.writeText("https://carivue.com/signal-input/meridian");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openModal = (type: string, data?: any, config?: any) => {
    setModalState({ type, isOpen: true, data, config });
  };

  const closeModal = () => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  };

  const tabs = [
    { id: "profile", name: "Profile" },
    { id: "team", name: "Team Members" },
    { id: "security", name: "Security" },
    { id: "general", name: "General" },
    { id: "preferences", name: "Preferences" },
  ];

  return (
    <DashboardLayout title="Executive Dashboard">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-2xl font-bold text-[#1F3A4A] mb-1">Settings</h1>
          <p className="text-sm text-gray-400 font-medium tracking-wide">Configure system settings and preferences</p>
        </div>

        {/* Tabs Bar */}
        <div className="flex items-center gap-1 bg-[#F9FAFB] p-1 rounded-xl w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-6 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap",
                activeTab === tab.id
                  ? "bg-white text-[#1F3A4A] shadow-sm"
                  : "text-gray-400 hover:text-[#1F3A4A]"
              )}
            >
              {tab.name}
            </button>
          ))}
        </div>

        <div className="bg-white p-10 rounded-3xl border border-gray-100 shadow-sm min-h-[600px]">
          {activeTab === "profile" && <ProfileTab handleCopy={handleCopy} copied={copied} />}
          {activeTab === "security" && <SecurityTab />}
          {activeTab === "general" && <GeneralTab />}
          {activeTab === "team" && <TeamMembersTab openModal={openModal} />}
          {activeTab === "preferences" && <PreferencesTab />}
        </div>
      </div>

      {/* Global Modals */}
      <InviteMemberModal 
        isOpen={modalState.type === "invite" && modalState.isOpen} 
        onClose={closeModal}
        onInvite={() => openModal("status", null, {
            type: "success",
            title: "Invitation Sent!",
            message: "An email invite has been sent to <br/><b>loremipsum@gmail.com</b> to join your team.",
            buttonText: "Awesome"
        })}
      />

      <EditMemberRoleModal 
        isOpen={modalState.type === "edit" && modalState.isOpen} 
        onClose={closeModal}
        name={modalState.data?.name}
        onSave={() => openModal("status", null, {
            type: "success",
            title: "Changes Saved",
            buttonText: "Awesome"
        })}
      />

      <RemoveMemberModal 
        isOpen={modalState.type === "remove" && modalState.isOpen} 
        onClose={closeModal}
        name={modalState.data?.name}
        onConfirm={() => openModal("status", null, {
            type: "success",
            title: "Member Removed!",
            message: `<b>${modalState.data?.name || 'Member'}</b> has been removed from your team.<br/> They no longer have access to the dashboard.`,
            buttonText: "Done"
        })}
      />

      <StatusModal 
        isOpen={modalState.type === "status" && modalState.isOpen} 
        onClose={closeModal}
        {...modalState.config}
      />
    </DashboardLayout>
  );
}

function PreferencesTab() {
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [inAppEnabled, setInAppEnabled] = useState(true);

  return (
    <div className="space-y-10 animate-fade-in max-w-4xl">
      <div>
        <h2 className="text-lg font-bold text-[#1F3A4A] mb-1">User Preferences</h2>
        <p className="text-xs text-gray-400 font-bold uppercase tracking-wide">Customize your application experience</p>
      </div>

      <div className="space-y-12">
        <section>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-8">Notifications Preferences</p>
          
          <div className="space-y-10">
            <div className="flex items-center justify-between group">
              <div>
                <p className="text-sm font-bold text-[#1F3A4A] mb-1">Email Notifications</p>
                <p className="text-[12px] text-gray-400 font-medium">Receive email updates for important events</p>
              </div>
              <Toggle enabled={emailEnabled} onChange={setEmailEnabled} />
            </div>

            <div className="flex items-center justify-between group">
              <div>
                <p className="text-sm font-bold text-[#1F3A4A] mb-1">In-App Notifications</p>
                <p className="text-[12px] text-gray-400 font-medium">Show notifications within the application</p>
              </div>
              <Toggle enabled={inAppEnabled} onChange={setInAppEnabled} />
            </div>
          </div>
        </section>

        <div className="flex gap-4 pt-10">
          <button className="px-8 py-3 rounded-xl text-sm font-bold text-gray-400 bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-100">
            Reset to Defaults
          </button>
          <button className="bg-[#1F3A4A] text-white px-10 py-3 rounded-xl text-sm font-bold shadow-lg hover:bg-[#2c4e62] transition-all">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
    return (
        <button
            onClick={() => onChange(!enabled)}
            className={cn(
                "relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none",
                enabled ? "bg-[#1F3A4A]" : "bg-gray-200"
            )}
        >
            <div 
                className={cn(
                    "absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200",
                    enabled ? "translate-x-6" : "translate-x-0"
                )}
            />
        </button>
    );
}

function ProfileTab({ handleCopy, copied }: { handleCopy: () => void; copied: boolean }) {
  return (
    <div className="space-y-10 animate-fade-in">
      <div>
        <h2 className="text-lg font-bold text-[#1F3A4A] mb-1">Organisation Information</h2>
        <p className="text-xs text-gray-400 font-bold uppercase tracking-wide">Update your organization details</p>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-10 border-b border-gray-50">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-[#FFF8F1] flex items-center justify-center border-4 border-white shadow-md">
                   <img src="/avatar-placeholder.png" alt="Profile" className="w-full h-full rounded-full object-cover hidden" />
                   <div className="w-full h-full rounded-full bg-secondary/10 flex items-center justify-center text-secondary text-2xl font-bold">HA</div>
            </div>
            <button className="absolute bottom-0 right-0 p-1.5 bg-white rounded-full shadow-lg border border-gray-100 text-gray-400 hover:text-primary transition-colors">
              <Camera size={14} />
            </button>
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#1F3A4A]">Helen Anthony</h3>
            <p className="text-sm text-gray-400 font-bold">Executive</p>
            <p className="text-[10px] text-gray-400 font-medium mt-1">Joined July 2025</p>
          </div>
        </div>

        <button 
          onClick={handleCopy}
          className="flex items-center gap-2 bg-white border border-gray-100 px-5 py-3 rounded-xl text-xs font-bold text-[#1F3A4A] shadow-sm hover:bg-gray-50 transition-all active:scale-95"
        >
          {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} className="text-gray-400" />}
          Copy Weekly Signal Input Link
        </button>
      </div>

      <form className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
        <Input label="First Name" placeholder="Helen" />
        <Input label="Last Name" placeholder="Anthony" />
        <div className="md:col-span-2">
            <Input label="Organisation Name" placeholder="Meridian Care Group" icon={Users} />
        </div>
        <Select label="Sector Type" value="Residential Care" options={["Residential Care", "Domiciliary", "Supported Living"]} />
        <Input label="Email Address" placeholder="info@marigoldhospital.ng" icon={Mail} />
        <Input label="Total Staffing Size" placeholder="12" />
        <Input label="Size of Residence" placeholder="00" />
        <Input label="Average care hours per week**" placeholder="00" />
        <Select label="Country*" value="Nigeria" options={["Nigeria", "United Kingdom", "United States"]} />
        
        <div className="md:col-span-2 pt-6">
          <button type="submit" className="bg-[#1F3A4A] text-white px-10 py-3 rounded-xl text-sm font-bold shadow-lg hover:bg-[#2c4e62] transition-all">
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}

function SecurityTab() {
  return (
    <div className="space-y-10 animate-fade-in max-w-2xl">
      <div>
        <h2 className="text-lg font-bold text-[#1F3A4A] mb-1">Security Settings</h2>
        <p className="text-xs text-gray-400 font-bold uppercase tracking-wide">Manage your password and security preferences</p>
      </div>

      <form className="space-y-8">
        <Input label="Current Password" type="password" placeholder="••••••••" icon={Lock} />
        <Input label="New Password" type="password" placeholder="••••••••" icon={Lock} />
        <Input label="Confirm New Password" type="password" placeholder="••••••••" icon={Lock} />
        
        <div className="pt-6">
          <button type="submit" className="bg-[#1F3A4A] text-white px-10 py-3 rounded-xl text-sm font-bold shadow-lg hover:bg-[#2c4e62] transition-all">
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}

function GeneralTab() {
  return (
    <div className="space-y-10 animate-fade-in">
      <div>
        <h2 className="text-lg font-bold text-[#1F3A4A] mb-1">General Settings</h2>
        <p className="text-xs text-gray-400 font-bold uppercase tracking-wide">Configure basic system settings and preferences</p>
      </div>

      <div className="space-y-12">
        <section>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-6">System Preferences</p>
          <div className="space-y-6">
             <div className="flex items-center justify-between py-2 border-b border-gray-50">
                <div>
                   <p className="text-sm font-bold text-[#1F3A4A]">Default Language</p>
                   <p className="text-xs text-gray-400 font-medium">Set the default language for the system</p>
                </div>
                <SelectPlain value="English (US)" options={["English (US)", "English (UK)", "French"]} />
             </div>
             <div className="flex items-center justify-between py-2 border-b border-gray-50">
                <div>
                   <p className="text-sm font-bold text-[#1F3A4A]">Time Zone</p>
                   <p className="text-xs text-gray-400 font-medium">Set the default time zone for the system</p>
                </div>
                <SelectPlain value="West African Time (WAT)" options={["West African Time (WAT)", "GMT", "UTC"]} />
             </div>
             <div className="flex items-center justify-between py-2 border-b border-gray-50">
                <div>
                   <p className="text-sm font-bold text-[#1F3A4A]">Date Format</p>
                   <p className="text-xs text-gray-400 font-medium">Set the default date format</p>
                </div>
                <SelectPlain value="DD/MM/YYYY" options={["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"]} />
             </div>
             <div className="flex items-center justify-between py-2 border-b border-gray-50">
                <div>
                   <p className="text-sm font-bold text-[#1F3A4A]">Auto-logout Timer</p>
                   <p className="text-xs text-gray-400 font-medium">Set the time of inactivity before automatic logout</p>
                </div>
                <SelectPlain value="15 minutes" options={["15 minutes", "30 minutes", "1 hour"]} />
             </div>
          </div>
        </section>

        <div className="flex justify-end gap-4 pt-4">
          <button className="px-8 py-3 rounded-xl text-sm font-bold text-gray-400 bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-100">
            Reset to Defaults
          </button>
          <button className="bg-[#1F3A4A] text-white px-10 py-3 rounded-xl text-sm font-bold shadow-lg hover:bg-[#2c4e62] transition-all">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

function TeamMembersTab({ openModal }: { openModal: any }) {
  const members = [
    { name: "Marvin McKinney", email: "Lorem@ipsum.com", role: "Executive", status: "Accepted", date: "10/04/2025" },
    { name: "Savannah Nguyen", email: "Lorem@ipsum.com", role: "Manager", status: "Accepted", date: "10/04/2025" },
    { name: "Annette Black", email: "Lorem@ipsum.com", role: "Manager", status: "Pending", date: "10/04/2025" },
    { name: "Cody Fisher", email: "Lorem@ipsum.com", role: "Manager", status: "Accepted", date: "10/04/2025" },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-[#1F3A4A] mb-1">Team Members</h2>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wide">Manage user access and roles across your services.</p>
        </div>
        <button 
          onClick={() => openModal("invite")}
          className="bg-[#1F3A4A] text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-lg hover:bg-[#2c4e62] transition-colors flex items-center gap-2"
        >
           Invite Someone
        </button>
      </div>

      <div className="overflow-x-auto pt-6">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date Invited</th>
              <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Name</th>
              <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email Address</th>
              <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Role</th>
              <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
              <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {members.map((member, i) => (
              <tr key={i} className="hover:bg-gray-50/30 transition-colors">
                <td className="py-5 text-sm font-medium text-gray-400">{member.date}</td>
                <td className="py-5 text-sm font-bold text-[#1F3A4A]">{member.name}</td>
                <td className="py-5 text-sm font-medium text-gray-400">{member.email}</td>
                <td className="py-5 text-sm font-medium text-gray-500">{member.role}</td>
                <td className="py-5">
                   <span className={cn(
                     "text-[10px] font-bold px-3 py-1 rounded-md uppercase tracking-wide",
                     member.status === "Accepted" ? "bg-green-50 text-green-600" : "bg-orange-50 text-orange-600"
                   )}>
                     {member.status}
                   </span>
                </td>
                <td className="py-5">
                   <div className="flex items-center gap-2">
                      <button 
                        onClick={() => openModal("edit", member)}
                        className="p-2 text-gray-400 hover:text-primary transition-colors border border-transparent hover:border-gray-100 rounded-lg"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => openModal("remove", member)}
                        className="p-2 text-red-400 hover:text-red-500 transition-colors border border-transparent hover:border-red-50 rounded-lg"
                      >
                        <Trash2 size={16} />
                      </button>
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Reusable Controls
function Input({ label, icon: Icon, type = "text", ...props }: any) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-bold text-[#1F3A4A]">{label}</label>
      <div className="relative">
        {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />}
        <input 
          type={type} 
          className={cn(
            "w-full border border-gray-100 rounded-xl py-3.5 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all text-sm font-medium",
            Icon ? "pl-12 pr-4" : "px-4"
          )}
          {...props}
        />
      </div>
    </div>
  );
}

function Select({ label, value, options }: any) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-bold text-[#1F3A4A]">{label}</label>
      <div className="relative">
        <select className="appearance-none w-full border border-gray-100 rounded-xl px-4 py-3.5 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all text-sm font-medium pr-10">
          {options.map((opt: any) => <option key={opt} value={opt}>{opt}</option>)}
        </select>
        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
      </div>
    </div>
  );
}

function SelectPlain({ value, options }: any) {
  return (
    <div className="relative min-w-[200px]">
      <select className="appearance-none w-full border border-gray-100 rounded-xl px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all text-xs font-bold text-gray-500 pr-10 shadow-sm">
        {options.map((opt: any) => <option key={opt} value={opt}>{opt}</option>)}
      </select>
      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
    </div>
  );
}
