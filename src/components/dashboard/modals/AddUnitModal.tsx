"use client";

import React from "react";
import { Plus, X } from "lucide-react";
import { apiFetch } from "@/lib/api";

interface SiteOption {
  id: number;
  name: string;
}

interface UnitDraft {
  name: string;
  minCapacity: string;
  maxCapacity: string;
}

interface AddUnitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void | Promise<void>;
  preferredSiteId?: number | null;
}

const EMPTY_UNIT: UnitDraft = {
  name: "",
  minCapacity: "",
  maxCapacity: "",
};

export function AddUnitModal({ isOpen, onClose, onCreated, preferredSiteId = null }: AddUnitModalProps) {
  const [sites, setSites] = React.useState<SiteOption[]>([]);
  const [selectedSiteId, setSelectedSiteId] = React.useState("");
  const [units, setUnits] = React.useState<UnitDraft[]>([{ ...EMPTY_UNIT }]);
  const [loadingOptions, setLoadingOptions] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");

  const resetForm = React.useCallback(() => {
    setUnits([{ ...EMPTY_UNIT }]);
    setError("");
  }, []);

  React.useEffect(() => {
    if (!isOpen) {
      return;
    }

    const loadSites = async () => {
      setLoadingOptions(true);
      setError("");

      try {
        const token = localStorage.getItem("token") || "";
        const data = await apiFetch<{ sites: SiteOption[] }>("/dashboard/sites", { token });
        const nextSites = Array.isArray(data?.sites) ? data.sites : [];
        setSites(nextSites);

        const defaultSiteId = preferredSiteId && nextSites.some((site) => Number(site.id) === Number(preferredSiteId))
          ? String(preferredSiteId)
          : nextSites[0]
            ? String(nextSites[0].id)
            : "";

        setSelectedSiteId(defaultSiteId);
      } catch (err: any) {
        setError(err.message || "We couldn't load your available sites.");
      } finally {
        setLoadingOptions(false);
      }
    };

    loadSites();
    resetForm();
  }, [isOpen, preferredSiteId, resetForm]);

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

    const validUnits = units
      .map((unit) => ({
        name: unit.name.trim(),
        minCapacity: unit.minCapacity.trim(),
        maxCapacity: unit.maxCapacity.trim(),
      }))
      .filter((unit) => unit.name.length > 0);

    if (!selectedSiteId) {
      setError("Please select a site for these units.");
      return;
    }

    if (validUnits.length === 0) {
      setError("Please add at least one unit name.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const token = localStorage.getItem("token") || "";

      for (const unit of validUnits) {
        await apiFetch("/dashboard/units", {
          method: "POST",
          body: JSON.stringify({
            siteId: Number(selectedSiteId),
            name: unit.name,
            minCapacity: Number(unit.minCapacity) || 0,
            maxCapacity: Number(unit.maxCapacity) || 0,
          }),
          token,
        });
      }

      if (onCreated) {
        await onCreated();
      } else if (typeof window !== "undefined") {
        window.location.reload();
      }

      onClose();
      resetForm();
    } catch (err: any) {
      setError(err.message || "We couldn't create the unit right now.");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#000000]/60 backdrop-blur-sm" onClick={saving ? undefined : onClose} />

      <div className="relative bg-white w-full max-w-3xl rounded-3xl shadow-2xl animate-fade-in-up overflow-hidden">
        <div className="px-10 py-10">
          <h2 className="text-2xl font-bold text-[#1F3A4A] mb-1">Add New Unit</h2>
          <p className="text-sm text-gray-400 font-medium mb-8">Create one or more units for a selected site.</p>

          <form className="space-y-8" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-bold text-[#1F3A4A]">Site*</label>
              <select
                value={selectedSiteId}
                onChange={(event) => setSelectedSiteId(event.target.value)}
                disabled={loadingOptions || saving}
                className="w-full border border-gray-100 rounded-xl px-4 py-3.5 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all text-sm font-medium"
              >
                {sites.length === 0 ? (
                  <option value="">No site available</option>
                ) : (
                  sites.map((site) => (
                    <option key={site.id} value={site.id}>
                      {site.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            {units.map((unit, index) => (
              <div key={index} className="space-y-6 rounded-2xl border border-gray-100 p-6 bg-gray-50/30">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                    Unit {index + 1}
                  </p>
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

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[#1F3A4A]">Unit Name*</label>
                    <input
                      type="text"
                      value={unit.name}
                      onChange={(event) => updateUnit(index, "name", event.target.value)}
                      disabled={saving}
                      placeholder="e.g., Ground Floor, First Floor"
                      className="w-full border border-gray-100 rounded-xl px-4 py-3.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all text-sm font-medium"
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
                      className="w-full border border-gray-100 rounded-xl px-4 py-3.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all text-sm font-medium"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[#1F3A4A]">Maximum capacity</label>
                    <input
                      type="number"
                      min="0"
                      value={unit.maxCapacity}
                      onChange={(event) => updateUnit(index, "maxCapacity", event.target.value)}
                      disabled={saving}
                      placeholder="0"
                      className="w-full border border-gray-100 rounded-xl px-4 py-3.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all text-sm font-medium"
                    />
                  </div>
                </div>
              </div>
            ))}

            {error && (
              <p className="text-sm font-medium text-red-500">{error}</p>
            )}

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={addAnotherUnit}
                disabled={saving || loadingOptions || !selectedSiteId}
                className="flex items-center gap-2 text-secondary font-bold text-sm hover:text-secondary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus size={18} />
                Add Another Unit
              </button>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={saving}
                  className="px-8 py-3 rounded-xl text-sm font-bold text-gray-400 bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-100 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || loadingOptions || sites.length === 0}
                  className="px-8 py-3 rounded-xl text-sm font-bold text-white bg-[#1F3A4A] hover:bg-[#2c4e62] transition-colors shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {saving ? "Adding Unit..." : "Add New Unit"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
