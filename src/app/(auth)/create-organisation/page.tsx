'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CarivueLogo } from '@/components/ui/CarivueLogo';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { RadioGroup } from '@/components/ui/RadioGroup';
import { apiFetch } from '@/lib/api';
import { Upload, Plus } from 'lucide-react';

interface UnitForm {
  name: string;
  minCapacity: string;
  maxCapacity: string;
}

interface SiteForm {
  name: string;
  siteType: string;
  location: string;
  hasInternalUnits: string;
  units: UnitForm[];
}

const emptySite: SiteForm = {
  name: '',
  siteType: '',
  location: '',
  hasInternalUnits: 'no',
  units: [{ name: '', minCapacity: '', maxCapacity: '' }],
};

const emptyUnit: UnitForm = { name: '', minCapacity: '', maxCapacity: '' };

export default function CreateOrganisationPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [orgName, setOrgName] = useState('');
  const [sectorType, setSectorType] = useState('');
  const [totalStaffingSize, setTotalStaffingSize] = useState('');
  const [sizeOfResidence, setSizeOfResidence] = useState('');
  const [avgCareHours, setAvgCareHours] = useState('');
  const [country, setCountry] = useState('');
  const [reportingCycle, setReportingCycle] = useState('');
  const [sites, setSites] = useState<SiteForm[]>([{ ...emptySite }]);

  const updateSite = (index: number, field: keyof SiteForm, value: string) => {
    setSites((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const updateUnit = (siteIndex: number, unitIndex: number, field: keyof UnitForm, value: string) => {
    setSites((prev) => {
      const updated = [...prev];
      const units = [...updated[siteIndex].units];
      units[unitIndex] = { ...units[unitIndex], [field]: value };
      updated[siteIndex] = { ...updated[siteIndex], units };
      return updated;
    });
  };

  const addSite = () => {
    setSites((prev) => [...prev, { ...emptySite, units: [{ ...emptyUnit }] }]);
  };

  const addUnit = (siteIndex: number) => {
    setSites((prev) => {
      const updated = [...prev];
      updated[siteIndex] = {
        ...updated[siteIndex],
        units: [...updated[siteIndex].units, { ...emptyUnit }],
      };
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      await apiFetch('/organisations', {
        method: 'POST',
        body: JSON.stringify({
          name: orgName,
          sectorType,
          totalStaffingSize: Number(totalStaffingSize),
          sizeOfResidence: Number(sizeOfResidence),
          avgCareHoursPerWeek: Number(avgCareHours),
          country,
          reportingCycle,
          sites: sites.map((s) => ({
            name: s.name,
            siteType: s.siteType,
            location: s.location,
            hasInternalUnits: s.hasInternalUnits === 'yes',
            units: s.hasInternalUnits === 'yes'
              ? s.units.map((u) => ({
                  name: u.name,
                  minCapacity: Number(u.minCapacity),
                  maxCapacity: Number(u.maxCapacity),
                }))
              : [],
          })),
        }),
        token: token || undefined,
      });

      router.push('/dashboard/executive');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <CarivueLogo className="mb-6" />

      <h1 className="text-2xl font-bold text-text">Create a New Organisation</h1>
      <p className="text-sm text-gray-500 mb-6">Fill in the details for your new organisation</p>

      {/* CSV Upload */}
      <h2 className="text-base font-bold text-text mb-1">Upload Organisation CSV</h2>
      <p className="text-xs text-gray-500 mb-3">
        Uploading a CSV allows Carivue to auto-fill your organisation, site, and unit details. You can review and edit before confirming.
      </p>

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center mb-8 cursor-pointer hover:border-primary/50 transition">
        <Upload size={28} className="text-secondary mb-2" />
        <p className="text-sm text-gray-500">
          Drop your files here or <span className="text-secondary font-semibold">Click to upload</span>
        </p>
        <p className="text-xs text-gray-400 mt-1">Only CSV format (max. 500mb)</p>
      </div>

      {/* Divider */}
      <div className="relative mb-6">
        <p className="text-xs font-semibold text-gray-400 tracking-widest uppercase">Fill your details manually</p>
      </div>

      {error && (
        <div className="bg-error/10 text-error text-sm p-3 rounded-md mb-4">{error}</div>
      )}

      <form onSubmit={handleSubmit}>
        <Input
          label="Organisation Name*"
          placeholder="Enter Organisation Name"
          value={orgName}
          onChange={(e) => setOrgName(e.target.value)}
          required
        />

        <RadioGroup
          label="Sector Type*"
          name="sectorType"
          options={[
            { label: 'Care Home', value: 'care_home' },
            { label: 'Residential Care', value: 'residential_care' },
            { label: 'Domiciliary Care', value: 'domiciliary_care' },
          ]}
          value={sectorType}
          onChange={setSectorType}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Total Staffing Size*"
            type="number"
            placeholder="000"
            value={totalStaffingSize}
            onChange={(e) => setTotalStaffingSize(e.target.value)}
          />
          <Input
            label="Size of Residence*"
            type="number"
            placeholder="000"
            value={sizeOfResidence}
            onChange={(e) => setSizeOfResidence(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Average care hours per week*"
            placeholder="e.g 1,120 hours/week"
            value={avgCareHours}
            onChange={(e) => setAvgCareHours(e.target.value)}
          />
          <div className="mb-4">
            <label className="block text-sm font-semibold text-text mb-1">Country*</label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-sm text-text
                focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            >
              <option value="">Select country</option>
              <option value="UK">United Kingdom</option>
              <option value="IE">Ireland</option>
              <option value="US">United States</option>
            </select>
          </div>
        </div>

        <RadioGroup
          label="Reporting cycle*"
          name="reportingCycle"
          options={[
            { label: 'Weekly', value: 'weekly' },
            { label: 'Monthly', value: 'monthly' },
          ]}
          value={reportingCycle}
          onChange={setReportingCycle}
        />

        {/* Sites Section */}
        {sites.map((site, siteIndex) => (
          <div key={siteIndex} className="border-t border-gray-200 pt-4 mt-4">
            <p className="text-xs font-semibold text-gray-400 tracking-widest uppercase mb-3">
              Add your sites
            </p>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Site Name*"
                placeholder="Enter Site Name"
                value={site.name}
                onChange={(e) => updateSite(siteIndex, 'name', e.target.value)}
              />
              <div className="mb-4">
                <label className="block text-sm font-semibold text-text mb-1">Site type*</label>
                <select
                  value={site.siteType}
                  onChange={(e) => updateSite(siteIndex, 'siteType', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-sm text-text
                    focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                >
                  <option value="">Select sector type</option>
                  <option value="care_home">Care Home</option>
                  <option value="residential_care">Residential Care</option>
                  <option value="domiciliary_care">Domiciliary Care</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <RadioGroup
                label="Does this site have internal units?"
                name={`hasUnits-${siteIndex}`}
                options={[
                  { label: 'Yes', value: 'yes' },
                  { label: 'No', value: 'no' },
                ]}
                value={site.hasInternalUnits}
                onChange={(v) => updateSite(siteIndex, 'hasInternalUnits', v)}
              />
              <Input
                label="Site Location*"
                placeholder="Enter Site Location"
                value={site.location}
                onChange={(e) => updateSite(siteIndex, 'location', e.target.value)}
              />
            </div>

            {/* Units */}
            {site.hasInternalUnits === 'yes' && site.units.map((unit, unitIndex) => (
              <div key={unitIndex} className="border-t border-gray-100 pt-3 mt-3">
                <p className="text-xs font-semibold text-gray-400 tracking-widest uppercase mb-2">
                  Add your unit
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Unit Name*"
                    placeholder="e.g., Ground Floor, First Floor"
                    value={unit.name}
                    onChange={(e) => updateUnit(siteIndex, unitIndex, 'name', e.target.value)}
                  />
                  <Input
                    label="Minimum capacity"
                    type="number"
                    placeholder="0000"
                    value={unit.minCapacity}
                    onChange={(e) => updateUnit(siteIndex, unitIndex, 'minCapacity', e.target.value)}
                  />
                </div>
                <Input
                  label="Maximum capacity"
                  type="number"
                  placeholder="0000"
                  value={unit.maxCapacity}
                  onChange={(e) => updateUnit(siteIndex, unitIndex, 'maxCapacity', e.target.value)}
                />
              </div>
            ))}

            {site.hasInternalUnits === 'yes' && (
              <button
                type="button"
                onClick={() => addUnit(siteIndex)}
                className="flex items-center gap-1 text-sm text-secondary font-semibold hover:underline mt-2"
              >
                <Plus size={16} /> Add Another Unit
              </button>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={addSite}
          className="flex items-center gap-1 text-sm text-secondary font-semibold hover:underline mt-4 mb-6 mx-auto"
        >
          <Plus size={16} /> Add Another Site
        </button>

        <Button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Finish Setup'}
        </Button>
      </form>
    </div>
  );
}
