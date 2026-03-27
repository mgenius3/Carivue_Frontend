"use client";

import React from "react";
import { Upload } from "lucide-react";

interface AddOrgModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddOrgModal({ isOpen, onClose }: AddOrgModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#000000]/60 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl animate-fade-in-up overflow-hidden">
        <div className="px-8 py-8">
          <h2 className="text-2xl font-bold text-[#1F3A4A] mb-1">Add New Organisation</h2>
          <p className="text-sm text-gray-400 font-medium mb-8">Enter the details to create an organisation</p>

          <form className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-[#1F3A4A]">Upload Organisation CSV</label>
              <p className="text-[10px] text-gray-400 font-medium mb-4">Uploading a CSV allows Carivue to auto-fill your organisation, site, and unit details. You can review and edit before confirming.</p>
              
              <div className="border-2 border-dashed border-gray-100 rounded-3xl p-10 flex flex-col items-center justify-center text-center group cursor-pointer hover:bg-gray-50 transition-colors">
                <div className="w-12 h-12 bg-[#FFF8F1] rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Upload size={24} className="text-secondary" />
                </div>
                <p className="text-sm font-bold text-[#1F3A4A]">Drop your files here or <span className="text-secondary">Click to upload</span></p>
                <p className="text-[10px] text-gray-400 font-medium mt-1">Only CSV format (max. 500mb)</p>
              </div>
            </div>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100"></div>
              </div>
              <div className="relative flex justify-center text-[10px] font-bold text-gray-300 uppercase tracking-widest px-2 bg-white w-fit mx-auto">
                Fill Your Details Manually
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-[#1F3A4A]">Organisation Name*</label>
              <input 
                type="text" 
                placeholder="Enter Organisation Name" 
                className="w-full border border-gray-100 rounded-lg px-4 py-3 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all text-sm"
              />
            </div>

            <button 
              type="submit"
              className="w-full px-6 py-3.5 rounded-xl text-sm font-bold text-white bg-[#1F3A4A] hover:bg-[#2c4e62] transition-colors shadow-lg mt-4"
            >
              Add New Organisation
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
