'use client';

import { useState, useTransition } from 'react';
import dynamic from 'next/dynamic';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import { createReportAction } from '@/app/actions/reports';
import { DEPARTMENTS, municipalitiesFor } from '@/lib/colombia-divipola';

// Dynamic to avoid SSR (Leaflet needs window)
const ReportMap = dynamic(() => import('@/components/map/ReportMap'), { ssr: false });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

interface ReportFormProps {
  isAuthed: boolean;
}

export default function ReportForm({ isAuthed }: ReportFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [personName, setPersonName] = useState('');
  const [personAge, setPersonAge] = useState('');
  const [address, setAddress] = useState('');
  const [lastSeenAt, setLastSeenAt] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(true); // default anónimo
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [photoError, setPhotoError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Department and municipality state
  const [department, setDepartment] = useState('');
  const [municipality, setMunicipality] = useState('');
  const availableMunicipalities = department ? municipalitiesFor(department) : [];

  const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

  function onPhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    setPhotoError(null);
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) {
      setPhotoError('La foto debe pesar menos de 5 MB');
      return;
    }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(f.type)) {
      setPhotoError('Solo se aceptan fotos JPG, PNG o WebP');
      return;
    }
    setPhotoFile(f);
    setPhotoPreview(URL.createObjectURL(f));
  }

  async function uploadPhotoIfNeeded(): Promise<string | null> {
    if (isAnonymous || !photoFile) return null;
    setUploading(true);
    try {
      // Get current user (must be authed to upload)
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Debes iniciar sesión para subir una foto');

      const ext = photoFile.name.split('.').pop() || 'jpg';
      const stamp = Date.now();
      const rand = Math.random().toString(36).slice(2, 8);
      const path = `${user.id}/${stamp}-${rand}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from('report-photos')
        .upload(path, photoFile, { cacheControl: '3600', upsert: false });
      if (upErr) throw upErr;

      const { data: pub } = supabase.storage.from('report-photos').getPublicUrl(path);
      return pub.publicUrl;
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!location) {
      setError('Indicá la ubicación en el mapa');
      return;
    }

    let uploadedPhotoUrl: string | null = null;
    try {
      uploadedPhotoUrl = await uploadPhotoIfNeeded();
    } catch (e: unknown) {
      const errMsg = e instanceof Error ? e.message : 'No se pudo subir la foto';
      setError(errMsg);
      return;
    }

    const fd = new FormData();
    fd.append('person_name', personName);
    if (personAge) fd.append('person_age', personAge);
    if (address) fd.append('last_known_address', address);
    if (lastSeenAt) fd.append('last_seen_at', lastSeenAt);
    fd.append('contact_phone', contactPhone);
    if (contactEmail) fd.append('contact_email', contactEmail);
    fd.append('last_known_lat', String(location.lat));
    fd.append('last_known_lng', String(location.lng));
    fd.append('isAnonymous', String(isAnonymous));
    if (uploadedPhotoUrl) fd.append('photoUrl', uploadedPhotoUrl);
    if (department) fd.append('department', department);
    if (municipality) fd.append('municipality', municipality);

    startTransition(async () => {
      const result = await createReportAction(undefined, fd);
      if (result?.error) {
        setError(result.error);
        return;
      }
      router.push('/');
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">
          Nombre de la persona <span className="text-red-600">*</span>
        </label>
        <input
          name="person_name"
          required
          maxLength={200}
          value={personName}
          onChange={(e) => setPersonName(e.target.value)}
          className="w-full min-h-[44px] border rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Edad (opcional)</label>
        <input
          type="number"
          name="person_age"
          min={0}
          max={130}
          value={personAge}
          onChange={(e) => setPersonAge(e.target.value)}
          className="w-full min-h-[44px] border rounded px-3 py-2"
        />
      </div>

      <ReportMap value={location} onChange={setLocation} />

      <div>
        <label className="block text-sm font-medium mb-1">
          Dirección / referencia (opcional)
        </label>
        <textarea
          name="last_known_address"
          maxLength={500}
          rows={2}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Ej: Barrio San Antonio, Pereira"
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Departamento (opcional)
        </label>
        <select
          name="department"
          value={department}
          onChange={(e) => {
            setDepartment(e.target.value);
            setMunicipality('');
          }}
          className="w-full min-h-[44px] border rounded px-3 py-2"
        >
          <option value="">Selecciona un departamento</option>
          {DEPARTMENTS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      {department && (
        <div>
          <label className="block text-sm font-medium mb-1">
            Municipio (opcional)
          </label>
          <select
            name="municipality"
            value={municipality}
            onChange={(e) => setMunicipality(e.target.value)}
            className="w-full min-h-[44px] border rounded px-3 py-2"
          >
            <option value="">Selecciona un municipio</option>
            {availableMunicipalities.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">
          Última vez visto (opcional)
        </label>
        <input
          type="datetime-local"
          name="last_seen_at"
          value={lastSeenAt}
          onChange={(e) => setLastSeenAt(e.target.value)}
          className="w-full min-h-[44px] border rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Teléfono de contacto <span className="text-red-600">*</span>
        </label>
        <input
          type="tel"
          name="contact_phone"
          required
          minLength={7}
          maxLength={20}
          value={contactPhone}
          onChange={(e) => setContactPhone(e.target.value)}
          placeholder="3001234567"
          className="w-full min-h-[44px] border rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Correo (opcional)
        </label>
        <input
          type="email"
          name="contact_email"
          value={contactEmail}
          onChange={(e) => setContactEmail(e.target.value)}
          className="w-full min-h-[44px] border rounded px-3 py-2"
        />
      </div>

      <fieldset className="border rounded p-3">
        <legend className="text-sm font-medium px-2">¿Cómo querés publicar?</legend>
        <label className="flex items-center gap-2 py-1">
          <input
            type="radio"
            name="anonToggle"
            checked={isAnonymous}
            onChange={() => setIsAnonymous(true)}
          />
          <span>Como anónimo (sin foto)</span>
        </label>
        <label className="flex items-center gap-2 py-1">
          <input
            type="radio"
            name="anonToggle"
            checked={!isAnonymous}
            disabled={!isAuthed}
            onChange={() => setIsAnonymous(false)}
          />
          <span>
            Identificarme {isAuthed ? '(con foto)' : '(iniciá sesión primero)'}
          </span>
        </label>
      </fieldset>

      {!isAnonymous && isAuthed && (
        <div>
          <label htmlFor="person_photo" className="block text-sm font-medium mb-1">
            Foto (opcional)
          </label>
          <input
            id="person_photo"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={onPhotoChange}
            aria-describedby="person_photo_help"
            className="w-full min-h-[44px]"
          />
          <p id="person_photo_help" className="text-xs text-gray-500 mt-1">
            JPG, PNG o WebP. Máximo 5 MB.
          </p>
          {photoPreview && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photoPreview}
              alt="Vista previa"
              className="mt-2 max-h-48 rounded border"
            />
          )}
          {uploading && <p className="text-sm text-gray-600">Subiendo foto…</p>}
          {photoError && <p className="text-sm text-red-600">{photoError}</p>}
        </div>
      )}

      {error && (
        <p role="alert" className="text-red-600 text-sm bg-red-50 p-2 rounded">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 min-h-[44px] bg-blue-600 text-white rounded px-4 py-2 disabled:opacity-50"
        >
          {isPending ? 'Publicando…' : 'Publicar reporte'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/')}
          className="min-h-[44px] border rounded px-4 py-2"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
