"use client";

import React from "react";
import { apiFetch } from "@/lib/api";

interface SiteRecord {
  id: number;
  name: string;
  site_type: string;
  location: string;
  has_internal_units: boolean | number;
}

interface EditSiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  site: SiteRecord | null;
  onUpdated?: () => void | Promise<void>;
}

export function EditSiteModal({ isOpen, onClose, site, onUpdated }: EditSiteModalProps) {
  const [name, setName] = React.useState("");
  const [siteType, setSiteType] = React.useState("residential_care");
  const [location, setLocation] = React.useState("");
  const [hasInternalUnits, setHasInternalUnits] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    if (!isOpen || !site) {
      return;
    }

    setName(site.name || "");
    setSiteType(site.site_type || "residential_care");
    setLocation(site.location || "");
    setHasInternalUnits(Boolean(site.has_internal_units));
    setError("");
  }, [isOpen, site]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!site) return;

    if (!name.trim() || !siteType.trim() || !location.trim()) {
      setError("Please complete site name, type, and location.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const token = localStorage.getItem("token") || "";
      await apiFetch(`/dashboard/sites/${site.id}`, {
        method: "PUT",
        body: JSON.stringify({
          name: name.trim(),
          siteType: siteType.trim(),
          location: location.trim(),
          hasInternalUnits,
        }),
        token,
      });

      if (onUpdated) {
        await onUpdated();
      }

      onClose();
    } catch (err: any) {
      setError(err.message || "We couldn't update this site right now.");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen || !site) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#000000]/60 backdrop-blur-sm" onClick={saving ? undefined : onClose}></div>
      <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl animate-fade-in-up overflow-hidden">
        <div className="px-8 py-8">
          <h2 className="text-2xl font-bold text-[#1F3A4A] mb-1">Edit Site</h2>
          <p className="text-sm text-gray-400 font-medium mb-8">Update site name and basic information.</p>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#1F3A4A]">Site Name*</label>
                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  disabled={saving}
                  className="w-full border border-gray-100 rounded-lg px-4 py-3 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#1F3A4A]">Site Type*</label>
                <select
                  value={siteType}
                  onChange={(event) => setSiteType(event.target.value)}
                  disabled={saving}
                  className="w-full border border-gray-100 rounded-lg px-4 py-3 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all text-sm"
                >
                  <option value="care_home">Care Home</option>
                  <option value="residential_care">Residential Care</option>
                  <option value="domiciliary_care">Domiciliary Care</option>
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#1F3A4A]">Site Location*</label>
                <input
                  type="text"
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  disabled={saving}
                  className="w-full border border-gray-100 rounded-lg px-4 py-3 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#1F3A4A]">Internal Units</label>
                <select
                  value={hasInternalUnits ? "yes" : "no"}
                  onChange={(event) => setHasInternalUnits(event.target.value === "yes")}
                  disabled={saving}
                  className="w-full border border-gray-100 rounded-lg px-4 py-3 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all text-sm"
                >
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
            </div>

            {error && <p className="text-sm font-medium text-red-500">{error}</p>}

            <div className="flex justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="px-6 py-2.5 rounded-lg text-sm font-bold text-gray-400 bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-100 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-lg text-sm font-bold text-white bg-[#1F3A4A] hover:bg-[#2c4e62] transition-colors shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
