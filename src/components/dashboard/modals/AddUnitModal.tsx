"use client";

import React from "react";
import { Plus } from "lucide-react";

interface AddUnitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddUnitModal({ isOpen, onClose }: AddUnitModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#000000]/60 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-white w-full max-w-3xl rounded-3xl shadow-2xl animate-fade-in-up overflow-hidden">
        <div className="px-10 py-10">
          <h2 className="text-2xl font-bold text-[#1F3A4A] mb-1">Add New Unit</h2>
          <p className="text-sm text-gray-400 font-medium mb-8">Enter the details to create a unit.</p>

          <form className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#1F3A4A]">Unit Name*</label>
                <input 
                  type="text" 
                  placeholder="e.g., Ground Floor, First Floor" 
                  className="w-full border border-gray-100 rounded-xl px-4 py-3.5 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all text-sm font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#1F3A4A]">Minimum capacity</label>
                <input 
                  type="text" 
                  placeholder="0000" 
                  className="w-full border border-gray-100 rounded-xl px-4 py-3.5 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all text-sm font-medium"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#1F3A4A]">Maximum capacity</label>
                <input 
                  type="text" 
                  placeholder="0000" 
                  className="w-full border border-gray-100 rounded-xl px-4 py-3.5 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all text-sm font-medium"
                />
              </div>
              <div className="flex items-end justify-end pb-1">
                <button type="button" className="flex items-center gap-2 text-secondary font-bold text-sm hover:text-secondary/80 transition-colors">
                  <Plus size={18} />
                  Add Another Unit
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-10">
              <button 
                type="button" 
                onClick={onClose}
                className="px-8 py-3 rounded-xl text-sm font-bold text-gray-400 bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-100"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-8 py-3 rounded-xl text-sm font-bold text-white bg-[#1F3A4A] hover:bg-[#2c4e62] transition-colors shadow-lg"
              >
                Add New Unit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
