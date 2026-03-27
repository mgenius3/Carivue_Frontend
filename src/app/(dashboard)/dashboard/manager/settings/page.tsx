"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Camera, Copy, Check, ChevronDown, Mail, Lock, Users, Trash2, Edit2, Building2 } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { 
  InviteMemberModal, 
  StatusModal, 
  EditMemberRoleModal, 
  RemoveMemberModal 
} from "@/components/dashboard/TeamModals";
import { apiFetch } from "@/lib/api";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function ManagerSettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [modalActionLoading, setModalActionLoading] = useState<null | "invite" | "remove">(null);
  const [profile, setProfile] = useState<any>(null);
  const [teamRefreshKey, setTeamRefreshKey] = useState(0);
  const [inviteOptions, setInviteOptions] = useState<any>({ roleOptions: ["coordinator"], sites: [] });
  
  const [modalState, setModalState] = useState<{
    type: string | null;
    isOpen: boolean;
    data?: any;
    config?: any;
  }>({ type: null, isOpen: false });

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || "";
      const [profileData, teamOptions] = await Promise.all([
        apiFetch<any>('/settings/profile', { token }),
        apiFetch<any>('/settings/team/options', { token }),
      ]);
      setProfile(profileData);
      setInviteOptions(teamOptions);
    } catch (err) {
      console.error("Settings fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCopy = () => {
    if (!profile?.organisation_name) return;
    const slug = profile.organisation_name.toLowerCase().replace(/\s+/g, '-');
    navigator.clipboard.writeText(`${window.location.origin}/signal-input/${slug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openModal = (type: string, data?: any, config?: any) => {
    setModalState({ type, isOpen: true, data, config });
  };

  const closeModal = () => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  };

  const refreshTeamMembers = () => {
    setTeamRefreshKey((prev) => prev + 1);
  };

  const tabs = [
    { id: "profile", name: "Profile" },
    { id: "team", name: "Team Members" },
    { id: "security", name: "Security" },
    { id: "general", name: "General" },
    { id: "preferences", name: "Preferences" },
  ];

  if (loading || !profile) {
    return (
      <DashboardLayout title="Manager Dashboard" role="manager">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Manager Dashboard" role="manager">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-2xl font-bold text-[#1F3A4A] mb-1">Settings</h1>
          <p className="text-sm text-gray-400 font-medium tracking-wide">Configure system settings and preferences</p>
        </div>

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
          {activeTab === "profile" && <ManagerProfileTab profile={profile} onUpdate={fetchData} handleCopy={handleCopy} copied={copied} />}
          {activeTab === "security" && <SecurityTab />}
          {activeTab === "general" && <GeneralTab />}
          {activeTab === "team" && <TeamMembersTab openModal={openModal} refreshKey={teamRefreshKey} />}
          {activeTab === "preferences" && <PreferencesTab />}
        </div>
      </div>

      <InviteMemberModal 
        isOpen={modalState.type === "invite" && modalState.isOpen} 
        onClose={closeModal}
        onInvite={async (data: any) => {
          setModalActionLoading("invite");
          try {
            const token = localStorage.getItem('token') || "";
            const result = await apiFetch<{ action?: string; emailStatus?: string; warning?: string }>('/settings/team/invite', {
              method: 'POST',
              body: JSON.stringify(data),
              token
            });
            refreshTeamMembers();
            fetchData();
            openModal("status", null, {
                type: "success",
                title: result.action === "assigned" ? "Assignment Added!" : "Invitation Saved!",
                message: result.action === "assigned"
                  ? `<b>${data.email}</b> already exists in this organisation and has been assigned to the selected units.`
                  : result.action === "updated_invite"
                    ? result.emailStatus === "failed"
                      ? `The pending invitation for <b>${data.email}</b> has been updated with the new unit assignments, but the email could not be sent.`
                      : `The pending invitation for <b>${data.email}</b> has been updated with the new unit assignments.`
                    : result.emailStatus === "failed"
                      ? `The invitation for <b>${data.email}</b> has been saved, but the email could not be sent.`
                      : `An email invite has been sent to <b>${data.email}</b> to join your team.`,
                buttonText: "Awesome"
            });
          } catch (err: any) {
            alert(err.message);
          } finally {
            setModalActionLoading(null);
          }
        }}
        roleOptions={inviteOptions}
        loading={modalActionLoading === "invite"}
      />
      <EditMemberRoleModal 
        isOpen={modalState.type === "edit" && modalState.isOpen} 
        onClose={closeModal}
        name={modalState.data?.name}
        onSave={() => openModal("status", null, { type: "success", title: "Changes Saved", buttonText: "Awesome" })}
      />
      <RemoveMemberModal 
        isOpen={modalState.type === "remove" && modalState.isOpen} 
        onClose={closeModal}
        name={modalState.data?.name}
        onConfirm={async () => {
          setModalActionLoading("remove");
          try {
            const token = localStorage.getItem('token') || "";
            const result = await apiFetch<{ type?: string }>(`/settings/team/${modalState.data.id}`, {
              method: 'DELETE',
              token
            });
            refreshTeamMembers();
            fetchData();
            openModal("status", null, {
                type: "success",
                title:
                  result.type === "invite"
                    ? "Invitation Removed!"
                    : result.type === "assignment"
                      ? "Assignment Removed!"
                      : "Member Removed!",
                message:
                  result.type === "invite"
                    ? `<b>${modalState.data?.email || 'Invitation'}</b> has been removed from your pending invites.`
                    : result.type === "assignment"
                      ? `<b>${modalState.data?.name || 'Coordinator'}</b> has been removed from the sites and units you manage.`
                      : `<b>${modalState.data?.name || 'Member'}</b> has been removed from your team.`,
                buttonText: "Done"
            });
          } catch (err: any) {
            alert(err.message);
          } finally {
            setModalActionLoading(null);
          }
        }}
        loading={modalActionLoading === "remove"}
      />
      <StatusModal 
        isOpen={modalState.type === "status" && modalState.isOpen} 
        onClose={closeModal}
        {...modalState.config}
      />
    </DashboardLayout>
  );
}

/* Manager-specific Profile Tab */
function ManagerProfileTab({ profile, onUpdate, handleCopy, copied }: { profile: any; onUpdate: () => void; handleCopy: () => void; copied: boolean }) {
  const [formData, setFormData] = useState({
    firstName: profile.first_name,
    lastName: profile.last_name,
    organisationName: profile.organisation_name || ""
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('token') || "";
      await apiFetch('/settings/profile', {
        method: 'PUT',
        body: JSON.stringify(formData),
        token
      });
      onUpdate();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

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
              <div className="w-full h-full rounded-full bg-secondary/10 flex items-center justify-center text-secondary text-2xl font-bold">
                 {profile.first_name[0]}{profile.last_name[0]}
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#1F3A4A]">{profile.first_name} {profile.last_name}</h3>
            <p className="text-sm text-gray-400 font-bold uppercase">{profile.role}</p>
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

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
        <Input 
          label="First Name" 
          value={formData.firstName}
          onChange={(e: any) => setFormData({...formData, firstName: e.target.value})}
        />
        <Input 
          label="Last Name" 
          value={formData.lastName}
          onChange={(e: any) => setFormData({...formData, lastName: e.target.value})}
        />
        <div className="md:col-span-2">
            <Input 
              label="Organisation Name" 
              icon={Users} 
              value={formData.organisationName}
              onChange={(e: any) => setFormData({...formData, organisationName: e.target.value})}
            />
        </div>
        
        <div className="md:col-span-2 pt-6">
          <button
            type="submit"
            disabled={saving}
            className="bg-[#1F3A4A] text-white px-10 py-3 rounded-xl text-sm font-bold shadow-lg hover:bg-[#2c4e62] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

function SecurityTab() {
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    setSaving(true);
    try {
      const token = localStorage.getItem('token') || "";
      await apiFetch('/settings/security', {
        method: 'PUT',
        body: JSON.stringify(passwords),
        token
      });
      alert("Password updated");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-10 animate-fade-in max-w-2xl">
      <div>
        <h2 className="text-lg font-bold text-[#1F3A4A] mb-1">Security Settings</h2>
        <p className="text-xs text-gray-400 font-bold uppercase tracking-wide">Manage your password and security preferences</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-8">
        <Input 
          label="Current Password" 
          type="password" 
          placeholder="••••••••" 
          icon={Lock} 
          value={passwords.currentPassword}
          onChange={(e: any) => setPasswords({...passwords, currentPassword: e.target.value})}
        />
        <Input 
          label="New Password" 
          type="password" 
          placeholder="••••••••" 
          icon={Lock} 
          value={passwords.newPassword}
          onChange={(e: any) => setPasswords({...passwords, newPassword: e.target.value})}
        />
        <Input 
          label="Confirm New Password" 
          type="password" 
          placeholder="••••••••" 
          icon={Lock} 
          value={passwords.confirmPassword}
          onChange={(e: any) => setPasswords({...passwords, confirmPassword: e.target.value})}
        />
        <div className="pt-6">
          <button
            type="submit"
            disabled={saving}
            className="bg-[#1F3A4A] text-white px-10 py-3 rounded-xl text-sm font-bold shadow-lg hover:bg-[#2c4e62] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Save Changes"}
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
            <SettingRow label="Default Language" desc="Set the default language for the system" value="English (US)" options={["English (US)", "English (UK)", "French"]} />
            <SettingRow label="Time Zone" desc="Set the default time zone for the system" value="West African Time (WAT)" options={["West African Time (WAT)", "GMT", "UTC"]} />
            <SettingRow label="Date Format" desc="Set the default date format" value="DD/MM/YYYY" options={["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"]} />
            <SettingRow label="Auto-logout Timer" desc="Set the time of inactivity before automatic logout" value="15 minutes" options={["15 minutes", "30 minutes", "1 hour"]} />
          </div>
        </section>
        <div className="flex justify-end gap-4 pt-4">
          <button className="px-8 py-3 rounded-xl text-sm font-bold text-gray-400 bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-100">Reset to Defaults</button>
          <button className="bg-[#1F3A4A] text-white px-10 py-3 rounded-xl text-sm font-bold shadow-lg hover:bg-[#2c4e62] transition-all">Save Changes</button>
        </div>
      </div>
    </div>
  );
}

function TeamMembersTab({ openModal, refreshKey }: { openModal: any; refreshKey: number }) {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMembers = async () => {
    try {
      const token = localStorage.getItem('token') || "";
      const data = await apiFetch<any[]>('/settings/team', { token });
      setMembers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchMembers();
  }, [refreshKey]);

  if (loading) return null;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-[#1F3A4A] mb-1">Team Members</h2>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wide">Manage user access and roles across your services.</p>
        </div>
        <button onClick={() => openModal("invite")} className="bg-[#1F3A4A] text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-lg hover:bg-[#2c4e62] transition-colors flex items-center gap-2">
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
                <td className="py-5 text-sm font-medium text-gray-400">{new Date(member.date_invited).toLocaleDateString()}</td>
                <td className="py-5 text-sm font-bold text-[#1F3A4A]">{member.name || (member.first_name ? `${member.first_name} ${member.last_name}` : "Pending Invite")}</td>
                <td className="py-5 text-sm font-medium text-gray-400">{member.email}</td>
                <td className="py-5 text-sm font-medium text-gray-500 uppercase">{member.role}</td>
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
                    <button onClick={() => openModal("edit", member)} className="p-2 text-gray-400 hover:text-primary transition-colors border border-transparent hover:border-gray-100 rounded-lg"><Edit2 size={16} /></button>
                    <button onClick={() => openModal("remove", member)} className="p-2 text-red-400 hover:text-red-500 transition-colors border border-transparent hover:border-red-50 rounded-lg"><Trash2 size={16} /></button>
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

function PreferencesTab() {
  const [preferences, setPreferences] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchPrefs = async () => {
    try {
      const token = localStorage.getItem('token') || "";
      const data = await apiFetch<any>('/settings/preferences', { token });
      setPreferences(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrefs();
  }, []);

  const handleToggle = (key: string) => {
    setPreferences((prev: any) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token') || "";
      await apiFetch('/settings/preferences', {
        method: 'PUT',
        body: JSON.stringify(preferences),
        token
      });
      alert('Preferences saved');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !preferences) return null;

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
            <div className="flex items-center justify-between">
              <div><p className="text-sm font-bold text-[#1F3A4A] mb-1">Email Notifications</p><p className="text-[12px] text-gray-400 font-medium">Receive email updates for important events</p></div>
              <Toggle enabled={preferences.email_notifications} onChange={() => handleToggle('email_notifications')} />
            </div>
            <div className="flex items-center justify-between">
              <div><p className="text-sm font-bold text-[#1F3A4A] mb-1">In-App Notifications</p><p className="text-[12px] text-gray-400 font-medium">Show notifications within the application</p></div>
              <Toggle enabled={preferences.in_app_notifications} onChange={() => handleToggle('in_app_notifications')} />
            </div>
          </div>
        </section>
        <div className="flex gap-4 pt-10">
          <button className="px-8 py-3 rounded-xl text-sm font-bold text-gray-400 bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-100">Reset to Defaults</button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#1F3A4A] text-white px-10 py-3 rounded-xl text-sm font-bold shadow-lg hover:bg-[#2c4e62] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* Reusable Components */
function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!enabled)} className={cn("relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none", enabled ? "bg-[#1F3A4A]" : "bg-gray-200")}>
      <div className={cn("absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200", enabled ? "translate-x-6" : "translate-x-0")} />
    </button>
  );
}

function Input({ label, icon: Icon, type = "text", ...props }: any) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-bold text-[#1F3A4A]">{label}</label>
      <div className="relative">
        {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />}
        <input type={type} className={cn("w-full border border-gray-100 rounded-xl py-3.5 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all text-sm font-medium", Icon ? "pl-12 pr-4" : "px-4")} {...props} />
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

function SettingRow({ label, desc, value, options }: any) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-50">
      <div>
        <p className="text-sm font-bold text-[#1F3A4A]">{label}</p>
        <p className="text-xs text-gray-400 font-medium">{desc}</p>
      </div>
      <div className="relative min-w-[200px]">
        <select className="appearance-none w-full border border-gray-100 rounded-xl px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all text-xs font-bold text-gray-500 pr-10 shadow-sm">
          {options.map((opt: any) => <option key={opt} value={opt}>{opt}</option>)}
        </select>
        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
      </div>
    </div>
  );
}
