'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { DEPARTMENTS, municipalitiesFor } from '@/lib/colombia-divipola';

interface FilterBarProps {
  current: {
    department?: string | null;
    municipality?: string | null;
    ageMin?: string | null;
    ageMax?: string | null;
  };
}

export default function ReportsFilterBar({ current }: FilterBarProps) {
  const router = useRouter();

  const [department, setDepartment] = useState(current.department || '');
  const [municipality, setMunicipality] = useState(current.municipality || '');
  const [ageMin, setAgeMin] = useState(current.ageMin || '');
  const [ageMax, setAgeMax] = useState(current.ageMax || '');

  const availableMunicipalities = department ? municipalitiesFor(department) : [];

  // Reset municipality when department changes
  useEffect(() => {
    if (department !== current.municipality) {
      // If department changed, check if current municipality is valid
      const validMunicipalities = municipalitiesFor(department);
      if (department && current.municipality && !validMunicipalities.includes(current.municipality)) {
        setMunicipality('');
      }
    }
  }, [department, current.department, current.municipality]);

  const hasFilters = department || municipality || ageMin || ageMax;

  function buildQueryString(): string {
    const params = new URLSearchParams();
    if (department) params.set('department', department);
    if (municipality) params.set('municipality', municipality);
    if (ageMin) params.set('ageMin', ageMin);
    if (ageMax) params.set('ageMax', ageMax);
    const qs = params.toString();
    return qs ? `?${qs}` : '';
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    router.push(`/reports${buildQueryString()}`);
  }

  function handleClear() {
    router.push('/reports');
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow mb-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Departamento</label>
          <select
            value={department}
            onChange={(e) => {
              setDepartment(e.target.value);
              setMunicipality('');
            }}
            className="w-full min-h-[44px] border rounded px-3 py-2"
          >
            <option value="">Todos</option>
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Municipio</label>
          <select
            value={municipality}
            onChange={(e) => setMunicipality(e.target.value)}
            disabled={!department}
            className="w-full min-h-[44px] border rounded px-3 py-2 disabled:bg-gray-100"
          >
            <option value="">Todos</option>
            {availableMunicipalities.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Edad mínima</label>
          <input
            type="number"
            min="0"
            max="130"
            value={ageMin}
            onChange={(e) => setAgeMin(e.target.value)}
            placeholder="0"
            className="w-full min-h-[44px] border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Edad máxima</label>
          <input
            type="number"
            min="0"
            max="130"
            value={ageMax}
            onChange={(e) => setAgeMax(e.target.value)}
            placeholder="130"
            className="w-full min-h-[44px] border rounded px-3 py-2"
          />
        </div>

        <div className="flex items-end gap-2">
          <button
            type="submit"
            className="flex-1 min-h-[44px] bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700"
          >
            Filtrar
          </button>
        </div>
      </div>

      {hasFilters && (
        <div className="mt-3">
          <button
            type="button"
            onClick={handleClear}
            className="text-sm text-blue-600 hover:underline"
          >
            Limpiar filtros
          </button>
        </div>
      )}
    </form>
  );
}
