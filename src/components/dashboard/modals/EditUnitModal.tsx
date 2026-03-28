"use client";

import React from "react";
import { apiFetch } from "@/lib/api";

interface UnitRecord {
  id: number;
  name: string;
  min_capacity?: number;
  max_capacity?: number;
  minCapacity?: number;
  maxCapacity?: number;
}

interface EditUnitModalProps {
  isOpen: boolean;
  onClose: () => void;
  unit: UnitRecord | null;
  onUpdated?: () => void | Promise<void>;
}

export function EditUnitModal({ isOpen, onClose, unit, onUpdated }: EditUnitModalProps) {
  const [name, setName] = React.useState("");
  const [minCapacity, setMinCapacity] = React.useState("");
  const [maxCapacity, setMaxCapacity] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    if (!isOpen || !unit) {
      return;
    }

    setName(unit.name || "");
    const minValue = unit.min_capacity ?? unit.minCapacity ?? 0;
    const maxValue = unit.max_capacity ?? unit.maxCapacity ?? 0;
    setMinCapacity(String(minValue));
    setMaxCapacity(String(maxValue));
    setError("");
  }, [isOpen, unit]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!unit) return;

    if (!name.trim()) {
      setError("Please enter a unit name.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const token = localStorage.getItem("token") || "";
      await apiFetch(`/dashboard/units/${unit.id}`, {
        method: "PUT",
        body: JSON.stringify({
          name: name.trim(),
          minCapacity: Number(minCapacity) || 0,
          maxCapacity: Number(maxCapacity) || 0,
        }),
        token,
      });

      if (onUpdated) {
        await onUpdated();
      }

      onClose();
    } catch (err: any) {
      setError(err.message || "We couldn't update this unit right now.");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen || !unit) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#000000]/60 backdrop-blur-sm" onClick={saving ? undefined : onClose}></div>
      <div className="relative bg-white w-full max-w-xl rounded-3xl shadow-2xl animate-fade-in-up overflow-hidden">
        <div className="px-8 py-8">
          <h2 className="text-2xl font-bold text-[#1F3A4A] mb-1">Edit Unit</h2>
          <p className="text-sm text-gray-400 font-medium mb-8">Update unit details and capacity values.</p>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-bold text-[#1F3A4A]">Unit Name*</label>
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                disabled={saving}
                className="w-full border border-gray-100 rounded-lg px-4 py-3 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all text-sm"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#1F3A4A]">Minimum Capacity</label>
                <input
                  type="number"
                  min="0"
                  value={minCapacity}
                  onChange={(event) => setMinCapacity(event.target.value)}
                  disabled={saving}
                  className="w-full border border-gray-100 rounded-lg px-4 py-3 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#1F3A4A]">Maximum Capacity</label>
                <input
                  type="number"
                  min="0"
                  value={maxCapacity}
                  onChange={(event) => setMaxCapacity(event.target.value)}
                  disabled={saving}
                  className="w-full border border-gray-100 rounded-lg px-4 py-3 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all text-sm"
                />
              </div>
            </div>

            {error && <p className="text-sm font-medium text-red-500">{error}</p>}

            <div className="flex justify-end gap-4 pt-2">
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
