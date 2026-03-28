"use client";

import React from "react";
import { X, Check, Users, UserPlus, AlertCircle, Mail, Shield, Trash2 } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

function ModalBase({ isOpen, onClose, children }: ModalProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#1F3A4A]/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-[32px] w-full max-w-md p-10 shadow-2xl animate-in fade-in zoom-in duration-200">
        {children}
      </div>
    </div>
  );
}

// 1. Invite Team Member
export function InviteMemberModal({ isOpen, onClose, onInvite, roleOptions, loading = false }: any) {
  const inviteConfig =
    roleOptions && !Array.isArray(roleOptions)
      ? roleOptions
      : { roleOptions: roleOptions || ["manager", "coordinator"], sites: [] };
  const roles = inviteConfig.roleOptions || ["manager", "coordinator"];
  const [email, setEmail] = React.useState("");
  const [role, setRole] = React.useState(roles[0]);
  const [selectedSiteIds, setSelectedSiteIds] = React.useState<number[]>([]);
  const [selectedUnitIds, setSelectedUnitIds] = React.useState<number[]>([]);

  const sites = Array.isArray(inviteConfig.sites) ? inviteConfig.sites : [];

  React.useEffect(() => {
    setRole(roles[0]);
  }, [isOpen]); // reset role when re-opened

  React.useEffect(() => {
    setSelectedSiteIds([]);
    setSelectedUnitIds([]);
  }, [role]);

  const normalizedRole = String(role).toLowerCase();
  const displayLabel = normalizedRole === "coordinator" ? "Care Coordinator" : "Manager";

  const toggleSite = (siteId: number) => {
    setSelectedSiteIds((prev) =>
      prev.includes(siteId) ? prev.filter((id) => id !== siteId) : [...prev, siteId]
    );
  };

  const toggleUnit = (unitId: number) => {
    setSelectedUnitIds((prev) =>
      prev.includes(unitId) ? prev.filter((id) => id !== unitId) : [...prev, unitId]
    );
  };

  const handleSubmit = async () => {
    if (!email.trim()) return;
    if (normalizedRole === "manager" && selectedSiteIds.length === 0) return;
    if (normalizedRole === "coordinator" && selectedUnitIds.length === 0) return;

    await onInvite({
      email: email.trim(),
      role: normalizedRole,
      siteIds: selectedSiteIds,
      unitIds: selectedUnitIds,
    });

    // Reset
    setEmail("");
    setRole(roles[0]);
    setSelectedSiteIds([]);
    setSelectedUnitIds([]);
  };

  return (
    <ModalBase isOpen={isOpen} onClose={onClose}>
      <div className="text-center space-y-6">
        <h2 className="text-xl font-bold text-[#1F3A4A]">Invite Team Member</h2>
        <div className="flex justify-center">
            <div className="p-4 bg-[#1F3A4A] rounded-xl text-white">
                <UserPlus size={24} />
            </div>
        </div>
        
        <div className="space-y-4 text-left">
            <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">E-Mail</label>
                <input 
                  type="email" 
                  placeholder="ayo@gmail.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="w-full border border-gray-100 rounded-lg px-4 py-2.5 text-sm bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-primary/5" 
                />
            </div>
            <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Assign role</label>
                <select 
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  disabled={loading}
                  className="w-full border border-gray-100 rounded-lg px-4 py-2.5 text-sm bg-gray-50/50 focus:outline-none"
                >
                    {roles.map((r: string) => (
                      <option key={r} value={r}>
                        {String(r).toLowerCase() === "coordinator" ? "Care Coordinator" : "Manager"}
                      </option>
                    ))}
                </select>
            </div>

            {normalizedRole === "manager" && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Assign Sites</label>
                <div className="max-h-44 overflow-y-auto rounded-lg border border-gray-100 bg-gray-50/50 p-3 space-y-2">
                  {sites.length === 0 && (
                    <p className="text-xs text-gray-400">No sites available to assign.</p>
                  )}
                  {sites.map((site: any) => (
                    <label key={site.id} className="flex items-center gap-2 text-sm text-[#1F3A4A]">
                      <input
                        type="checkbox"
                        checked={selectedSiteIds.includes(site.id)}
                        onChange={() => toggleSite(site.id)}
                        disabled={loading}
                        className="accent-primary"
                      />
                      <span>{site.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {normalizedRole === "coordinator" && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Assign Units</label>
                <div className="max-h-56 overflow-y-auto rounded-lg border border-gray-100 bg-gray-50/50 p-3 space-y-3">
                  {sites.length === 0 && (
                    <p className="text-xs text-gray-400">No units available to assign.</p>
                  )}
                  {sites.map((site: any) => (
                    <div key={site.id}>
                      <p className="text-xs font-bold text-[#1F3A4A] uppercase tracking-wide mb-2">{site.name}</p>
                      <div className="space-y-2">
                        {(site.units || []).length === 0 && (
                          <p className="text-xs text-gray-400">No units under this site.</p>
                        )}
                        {(site.units || []).map((unit: any) => (
                          <label key={unit.id} className="flex items-center gap-2 text-sm text-[#1F3A4A]">
                            <input
                              type="checkbox"
                              checked={selectedUnitIds.includes(unit.id)}
                              onChange={() => toggleUnit(unit.id)}
                              disabled={loading}
                              className="accent-primary"
                            />
                            <span>{unit.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>

        <div className="flex gap-3 pt-4">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 rounded-lg text-sm font-bold border border-gray-100 text-[#1F3A4A] hover:bg-gray-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 py-2.5 rounded-lg text-sm font-bold bg-[#1F3A4A] text-white hover:bg-[#2c4e62] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading
              ? normalizedRole === "coordinator"
                ? `Assigning ${displayLabel}...`
                : `Inviting ${displayLabel}...`
              : normalizedRole === "coordinator"
                ? `Assign ${displayLabel}`
                : `Invite ${displayLabel}`}
          </button>
        </div>
      </div>
    </ModalBase>
  );
}

// 2. Status Modals (Success/Error)
export function StatusModal({ isOpen, onClose, type, title, message, buttonText = "Awesome", icon: CustomIcon }: any) {
    const isSuccess = type === "success";
    const isError = type === "error";
    const isInfo = type === "info";

    return (
        <ModalBase isOpen={isOpen} onClose={onClose}>
            <div className="text-center space-y-6">
                <div className="relative flex justify-center">
                    <div className={cn(
                        "w-20 h-20 rounded-full flex items-center justify-center border-4 border-white shadow-lg",
                        isSuccess ? "bg-green-50" : isError ? "bg-red-50" : "bg-blue-50"
                    )}>
                        {CustomIcon ? <CustomIcon size={40} className={isSuccess ? "text-green-500" : "text-blue-500"} /> : (
                            <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center",
                                isSuccess ? "bg-green-500" : isError ? "bg-red-500" : "bg-[#1F3A4A]"
                            )}>
                                {isSuccess ? <Check className="text-white" /> : <AlertCircle className="text-white" />}
                            </div>
                        )}
                    </div>
                </div>

                <div>
                    <h2 className="text-xl font-bold text-[#1F3A4A] mb-2">{title}</h2>
                    <p className="text-xs text-gray-400 font-medium leading-relaxed" dangerouslySetInnerHTML={{ __html: message }}></p>
                </div>

                <button 
                  onClick={onClose}
                  className="w-full bg-[#1F3A4A] text-white py-2.5 rounded-lg text-xs font-bold shadow-lg hover:bg-[#2c4e62] transition-all active:scale-95"
                >
                    {buttonText}
                </button>
            </div>
        </ModalBase>
    );
}

// 3. Edit Team Member Access
export function EditMemberRoleModal({ isOpen, onClose, member, options, onSave, loading = false }: any) {
    const sites = Array.isArray(options?.sites) ? options.sites : [];
    const [selectedSiteIds, setSelectedSiteIds] = React.useState<number[]>([]);
    const [selectedUnitIds, setSelectedUnitIds] = React.useState<number[]>([]);

    React.useEffect(() => {
      if (!isOpen || !member) return;
      setSelectedSiteIds(Array.isArray(member.siteIds) ? member.siteIds.map((id: any) => Number(id)) : []);
      setSelectedUnitIds(Array.isArray(member.unitIds) ? member.unitIds.map((id: any) => Number(id)) : []);
    }, [isOpen, member]);

    const normalizedRole = String(member?.role || "").toLowerCase();
    const displayRole = normalizedRole === "coordinator" ? "Care Coordinator" : "Manager";

    const toggleSite = (siteId: number) => {
      setSelectedSiteIds((prev) =>
        prev.includes(siteId) ? prev.filter((id) => id !== siteId) : [...prev, siteId]
      );
    };

    const toggleUnit = (unitId: number) => {
      setSelectedUnitIds((prev) =>
        prev.includes(unitId) ? prev.filter((id) => id !== unitId) : [...prev, unitId]
      );
    };

    const handleSubmit = async () => {
      if (normalizedRole === "manager" && selectedSiteIds.length === 0) return;
      if (normalizedRole === "coordinator" && selectedUnitIds.length === 0) return;

      await onSave({
        siteIds: selectedSiteIds,
        unitIds: selectedUnitIds,
      });
    };

    return (
        <ModalBase isOpen={isOpen} onClose={onClose}>
            <div className="text-center space-y-6">
                <h2 className="text-xl font-bold text-[#1F3A4A]">Edit Team Member Access</h2>
                <div className="flex justify-center">
                    <div className="p-4 bg-[#1F3A4A] rounded-xl text-white">
                        <UserPlus size={24} />
                    </div>
                </div>

                <div className="space-y-4 text-left">
                    <div>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-wide">Update {member?.name || member?.email}&apos;s access</p>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Assigned role</label>
                        <div className="w-full border border-gray-100 rounded-lg px-4 py-2.5 text-sm bg-gray-50/50 text-[#1F3A4A] font-bold">
                          {displayRole}
                        </div>
                    </div>

                    {normalizedRole === "manager" && (
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Assigned Sites</label>
                        <div className="max-h-44 overflow-y-auto rounded-lg border border-gray-100 bg-gray-50/50 p-3 space-y-2">
                          {sites.length === 0 && <p className="text-xs text-gray-400">No sites available to assign.</p>}
                          {sites.map((site: any) => (
                            <label key={site.id} className="flex items-center gap-2 text-sm text-[#1F3A4A]">
                              <input
                                type="checkbox"
                                checked={selectedSiteIds.includes(Number(site.id))}
                                onChange={() => toggleSite(Number(site.id))}
                                disabled={loading}
                                className="accent-primary"
                              />
                              <span>{site.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    {normalizedRole === "coordinator" && (
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Assigned Units</label>
                        <div className="max-h-56 overflow-y-auto rounded-lg border border-gray-100 bg-gray-50/50 p-3 space-y-3">
                          {sites.length === 0 && <p className="text-xs text-gray-400">No units available to assign.</p>}
                          {sites.map((site: any) => (
                            <div key={site.id}>
                              <p className="text-xs font-bold text-[#1F3A4A] uppercase tracking-wide mb-2">{site.name}</p>
                              <div className="space-y-2">
                                {(site.units || []).length === 0 && (
                                  <p className="text-xs text-gray-400">No units under this site.</p>
                                )}
                                {(site.units || []).map((unit: any) => (
                                  <label key={unit.id} className="flex items-center gap-2 text-sm text-[#1F3A4A]">
                                    <input
                                      type="checkbox"
                                      checked={selectedUnitIds.includes(Number(unit.id))}
                                      onChange={() => toggleUnit(Number(unit.id))}
                                      disabled={loading}
                                      className="accent-primary"
                                    />
                                    <span>{unit.name}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </div>

                <div className="flex gap-3 pt-4">
                    <button
                      onClick={onClose}
                      disabled={loading}
                      className="flex-1 py-2.5 rounded-lg text-sm font-bold border border-gray-100 text-[#1F3A4A] hover:bg-gray-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        Cancel
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="flex-1 py-2.5 rounded-lg text-sm font-bold bg-[#1F3A4A] text-white hover:bg-[#2c4e62] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>
        </ModalBase>
    );
}

// 4. Remove Team Member
export function RemoveMemberModal({ isOpen, onClose, name, onConfirm, loading = false }: any) {
    return (
        <ModalBase isOpen={isOpen} onClose={onClose}>
            <div className="text-center space-y-6">
                <h2 className="text-xl font-bold text-[#1F3A4A]">Remove Team Member</h2>
                <div className="flex justify-center">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500">
                        <Trash2 size={24} />
                    </div>
                </div>

                <p className="text-xs text-gray-400 font-medium leading-relaxed">
                    By doing this, <span className="font-bold text-[#1F3A4A]">{name}</span> will no longer be able<br /> to access this dashboard anymore.
                </p>

                <div className="flex gap-3 pt-4">
                    <button
                      onClick={onClose}
                      disabled={loading}
                      className="flex-1 py-2.5 rounded-lg text-sm font-bold border border-gray-100 text-[#1F3A4A] hover:bg-gray-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        Cancel
                    </button>
                    <button
                      onClick={onConfirm}
                      disabled={loading}
                      className="flex-1 py-2.5 rounded-lg text-sm font-bold bg-[#1F3A4A] text-white hover:bg-[#2c4e62] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? "Removing..." : "Yes, Remove"}
                    </button>
                </div>
            </div>
        </ModalBase>
    );
}
