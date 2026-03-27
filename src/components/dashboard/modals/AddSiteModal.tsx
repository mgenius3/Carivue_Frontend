"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";

interface AddSiteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddSiteModal({ isOpen, onClose }: AddSiteModalProps) {
  const [hasUnits, setHasUnits] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#000000]/60 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-white w-full max-w-3xl rounded-3xl shadow-2xl animate-fade-in-up overflow-hidden">
        <div className="px-10 py-8">
          <h2 className="text-2xl font-bold text-[#1F3A4A] mb-1">Add New Site</h2>
          <p className="text-sm text-gray-400 font-medium mb-8">Enter the details to create a service location (site).</p>

          <form className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#1F3A4A]">Site Name*</label>
                <input 
                  type="text" 
                  placeholder="Enter Site Name" 
                  className="w-full border border-gray-100 rounded-lg px-4 py-3 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#1F3A4A]">Site type*</label>
                <select className="w-full border border-gray-100 rounded-lg px-4 py-3 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all text-sm appearance-none">
                  <option>Select sector type</option>
                  <option>Residential Care</option>
                  <option>Domiciliary Care</option>
                  <option>Supported Living</option>
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-sm font-bold text-[#1F3A4A]">Does this site have internal units?</label>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="hasUnits" 
                      checked={hasUnits} 
                      onChange={() => setHasUnits(true)} 
                      className="w-4 h-4 text-primary"
                    />
                    <span className="text-sm font-medium text-gray-600">Yes</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="hasUnits" 
                      checked={!hasUnits} 
                      onChange={() => setHasUnits(false)} 
                      className="w-4 h-4 text-primary"
                    />
                    <span className="text-sm font-medium text-gray-600">No</span>
                  </label>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#1F3A4A]">Site Location*</label>
                <input 
                  type="text" 
                  placeholder="Enter Site Location" 
                  className="w-full border border-gray-100 rounded-lg px-4 py-3 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all text-sm"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-6">Add Your Unit</p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#1F3A4A]">Unit Name*</label>
                  <input 
                    type="text" 
                    placeholder="e.g., Ground Floor, First Floor" 
                    className="w-full border border-gray-100 rounded-lg px-4 py-3 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#1F3A4A]">Minimum capacity</label>
                  <input 
                    type="text" 
                    placeholder="0000" 
                    className="w-full border border-gray-100 rounded-lg px-4 py-3 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all text-sm"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mt-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#1F3A4A]">Maximum capacity</label>
                  <input 
                    type="text" 
                    placeholder="0000" 
                    className="w-full border border-gray-100 rounded-lg px-4 py-3 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all text-sm"
                  />
                </div>
                <div className="flex items-end flex-col">
                  <button type="button" className="flex items-center gap-2 text-secondary font-bold text-sm mt-8 hover:text-secondary/80 transition-colors">
                    <Plus size={18} />
                    Add Another Unit
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4 mt-8">
              <button 
                type="button" 
                onClick={onClose}
                className="px-6 py-2.5 rounded-lg text-sm font-bold text-gray-400 bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-100"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-6 py-2.5 rounded-lg text-sm font-bold text-white bg-[#1F3A4A] hover:bg-[#2c4e62] transition-colors shadow-lg"
              >
                Add New Site
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
