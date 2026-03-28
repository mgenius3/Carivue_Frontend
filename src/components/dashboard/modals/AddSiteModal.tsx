"use client";

import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import { apiFetch } from "@/lib/api";

interface UnitDraft {
  name: string;
  minCapacity: string;
  maxCapacity: string;
}

interface AddSiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void | Promise<void>;
}

const EMPTY_UNIT: UnitDraft = {
  name: "",
  minCapacity: "",
  maxCapacity: "",
};

export function AddSiteModal({ isOpen, onClose, onCreated }: AddSiteModalProps) {
  const [name, setName] = useState("");
  const [siteType, setSiteType] = useState("Residential Care");
  const [location, setLocation] = useState("");
  const [hasUnits, setHasUnits] = useState(false);
  const [units, setUnits] = useState<UnitDraft[]>([{ ...EMPTY_UNIT }]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const resetForm = () => {
    setName("");
    setSiteType("Residential Care");
    setLocation("");
    setHasUnits(false);
    setUnits([{ ...EMPTY_UNIT }]);
    setError("");
  };

  React.useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const updateUnit = (index: number, key: keyof UnitDraft, value: string) => {
    setUnits((prev) =>
      prev.map((unit, unitIndex) => (unitIndex === index ? { ...unit, [key]: value } : unit))
    );
  };

  const addAnotherUnit = () => {
    setUnits((prev) => [...prev, { ...EMPTY_UNIT }]);
  };

  const removeUnit = (index: number) => {
    setUnits((prev) => (prev.length === 1 ? prev : prev.filter((_, unitIndex) => unitIndex !== index)));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!name.trim() || !location.trim() || !siteType.trim()) {
      setError("Please complete the site name, type, and location.");
      return;
    }

    const preparedUnits = hasUnits
      ? units
          .map((unit) => ({
            name: unit.name.trim(),
            minCapacity: Number(unit.minCapacity) || 0,
            maxCapacity: Number(unit.maxCapacity) || 0,
          }))
          .filter((unit) => unit.name.length > 0)
      : [];

    if (hasUnits && preparedUnits.length === 0) {
      setError("Please add at least one unit name or switch the site to no internal units.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const token = localStorage.getItem("token") || "";
      await apiFetch("/dashboard/sites", {
        method: "POST",
        body: JSON.stringify({
          name: name.trim(),
          siteType: siteType.trim(),
          location: location.trim(),
          hasInternalUnits: hasUnits,
          units: preparedUnits,
        }),
        token,
      });

      if (onCreated) {
        await onCreated();
      } else if (typeof window !== "undefined") {
        window.location.reload();
      }

      onClose();
      resetForm();
    } catch (err: any) {
      setError(err.message || "We couldn't create the site right now.");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#000000]/60 backdrop-blur-sm" onClick={saving ? undefined : onClose}></div>

      <div className="relative bg-white w-full max-w-3xl rounded-3xl shadow-2xl animate-fade-in-up overflow-hidden">
        <div className="px-10 py-8">
          <h2 className="text-2xl font-bold text-[#1F3A4A] mb-1">Add New Site</h2>
          <p className="text-sm text-gray-400 font-medium mb-8">Enter the details to create a service location.</p>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#1F3A4A]">Site Name*</label>
                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  disabled={saving}
                  placeholder="Enter Site Name"
                  className="w-full border border-gray-100 rounded-lg px-4 py-3 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#1F3A4A]">Site Type*</label>
                <select
                  value={siteType}
                  onChange={(event) => setSiteType(event.target.value)}
                  disabled={saving}
                  className="w-full border border-gray-100 rounded-lg px-4 py-3 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all text-sm appearance-none"
                >
                  <option value="Residential Care">Residential Care</option>
                  <option value="Domiciliary Care">Domiciliary Care</option>
                  <option value="Supported Living">Supported Living</option>
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
                      disabled={saving}
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
                      disabled={saving}
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
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  disabled={saving}
                  placeholder="Enter Site Location"
                  className="w-full border border-gray-100 rounded-lg px-4 py-3 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all text-sm"
                />
              </div>
            </div>

            {hasUnits && (
              <div className="pt-4 border-t border-gray-100">
                <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-6">Add Units</p>

                <div className="space-y-5">
                  {units.map((unit, index) => (
                    <div key={index} className="rounded-2xl border border-gray-100 bg-gray-50/30 p-5 space-y-5">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Unit {index + 1}</p>
                        {units.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeUnit(index)}
                            disabled={saving}
                            className="inline-flex items-center gap-1 text-xs font-bold text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <X size={14} />
                            Remove
                          </button>
                        )}
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-[#1F3A4A]">Unit Name*</label>
                          <input
                            type="text"
                            value={unit.name}
                            onChange={(event) => updateUnit(index, "name", event.target.value)}
                            disabled={saving}
                            placeholder="e.g., Ground Floor, First Floor"
                            className="w-full border border-gray-100 rounded-lg px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all text-sm"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-[#1F3A4A]">Minimum capacity</label>
                          <input
                            type="number"
                            min="0"
                            value={unit.minCapacity}
                            onChange={(event) => updateUnit(index, "minCapacity", event.target.value)}
                            disabled={saving}
                            placeholder="0"
                            className="w-full border border-gray-100 rounded-lg px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all text-sm"
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-[#1F3A4A]">Maximum capacity</label>
                          <input
                            type="number"
                            min="0"
                            value={unit.maxCapacity}
                            onChange={(event) => updateUnit(index, "maxCapacity", event.target.value)}
                            disabled={saving}
                            placeholder="0"
                            className="w-full border border-gray-100 rounded-lg px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={addAnotherUnit}
                  disabled={saving}
                  className="flex items-center gap-2 text-secondary font-bold text-sm mt-6 hover:text-secondary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus size={18} />
                  Add Another Unit
                </button>
              </div>
            )}

            {error && <p className="text-sm font-medium text-red-500">{error}</p>}

            <div className="flex justify-end gap-4 pt-4 mt-8">
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
                {saving ? "Adding Site..." : "Add New Site"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
