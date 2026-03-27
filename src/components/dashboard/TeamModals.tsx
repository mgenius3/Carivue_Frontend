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
export function InviteMemberModal({ isOpen, onClose, onInvite }: any) {
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
                <input type="email" placeholder="ayo@gmail.com" className="w-full border border-gray-100 rounded-lg px-4 py-2.5 text-sm bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-primary/5" />
            </div>
            <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Assign role</label>
                <select className="w-full border border-gray-100 rounded-lg px-4 py-2.5 text-sm bg-gray-50/50 focus:outline-none">
                    <option>Manager</option>
                    <option>Executive</option>
                    <option>Care Coordinator</option>
                </select>
            </div>
            <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Select Site</label>
                <select className="w-full border border-gray-100 rounded-lg px-4 py-2.5 text-sm bg-gray-50/50 focus:outline-none">
                    <option>Select Site</option>
                    <option>Willowbrooks</option>
                    <option>Riversides</option>
                </select>
            </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-lg text-sm font-bold border border-gray-100 text-[#1F3A4A] hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button onClick={onInvite} className="flex-1 py-2.5 rounded-lg text-sm font-bold bg-[#1F3A4A] text-white hover:bg-[#2c4e62] transition-colors">
            Invite
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

// 3. Edit Team Member's Role
export function EditMemberRoleModal({ isOpen, onClose, name, onSave }: any) {
    return (
        <ModalBase isOpen={isOpen} onClose={onClose}>
            <div className="text-center space-y-6">
                <h2 className="text-xl font-bold text-[#1F3A4A]">Edit Team Member&apos;s Role</h2>
                <div className="flex justify-center">
                    <div className="p-4 bg-[#1F3A4A] rounded-xl text-white">
                        <UserPlus size={24} />
                    </div>
                </div>

                <div className="space-y-4">
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wide">Edit {name}&apos;s role</p>
                    <div className="space-y-1.5 text-left">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Assign role</label>
                        <select className="w-full border border-gray-100 rounded-lg px-4 py-2.5 text-sm bg-gray-50/50 focus:outline-none">
                            <option>Manager</option>
                            <option>Executive</option>
                            <option>Care Coordinator</option>
                        </select>
                    </div>
                </div>

                <div className="flex gap-3 pt-4">
                    <button onClick={onClose} className="flex-1 py-2.5 rounded-lg text-sm font-bold border border-gray-100 text-[#1F3A4A] hover:bg-gray-50 transition-colors">
                        Cancel
                    </button>
                    <button onClick={onSave} className="flex-1 py-2.5 rounded-lg text-sm font-bold bg-[#1F3A4A] text-white hover:bg-[#2c4e62] transition-colors">
                        Save Changes
                    </button>
                </div>
            </div>
        </ModalBase>
    );
}

// 4. Remove Team Member
export function RemoveMemberModal({ isOpen, onClose, name, onConfirm }: any) {
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
                    <button onClick={onClose} className="flex-1 py-2.5 rounded-lg text-sm font-bold border border-gray-100 text-[#1F3A4A] hover:bg-gray-50 transition-colors">
                        Cancel
                    </button>
                    <button onClick={onConfirm} className="flex-1 py-2.5 rounded-lg text-sm font-bold bg-[#1F3A4A] text-white hover:bg-[#2c4e62] transition-colors">
                        Yes, Remove
                    </button>
                </div>
            </div>
        </ModalBase>
    );
}
